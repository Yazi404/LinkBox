// Link Box – desktop app (Windows & Mac)
const { app, BrowserWindow, shell, ipcMain, clipboard, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const SAFE = /^(https?:|ftp:|mailto:)/i;
const PROTOCOL = "linkbox";

let win = null;
let pendingLink = null;

function findLinkArg(argv) {
  return (argv || []).find((a) => typeof a === "string" && a.toLowerCase().startsWith(PROTOCOL + "://")) || null;
}

function deliverLink(url) {
  if (!url) return;
  if (win && !win.webContents.isLoading()) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    win.webContents.send("shared-link", url);
  } else {
    pendingLink = url;
  }
}

// Only one Link Box window; a second launch (e.g. from a linkbox:// link) hands its link to the first.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  pendingLink = findLinkArg(process.argv);

  app.on("second-instance", (_e, argv) => {
    const url = findLinkArg(argv);
    if (url) deliverLink(url);
    else if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  // Mac sends linkbox:// links here
  app.on("open-url", (event, url) => {
    event.preventDefault();
    deliverLink(url);
  });

  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }

  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 380,
    minHeight: 560,
    title: "Link Box",
    backgroundColor: "#2F7BFF",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, "www", "index.html"));
  win.on("closed", () => { win = null; });

  // Any link that tries to open inside the app goes to the default browser instead.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (SAFE.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) {
      event.preventDefault();
      if (SAFE.test(url)) shell.openExternal(url);
    }
  });
}

ipcMain.handle("open-external", (_e, url) => {
  if (typeof url === "string" && SAFE.test(url)) return shell.openExternal(url);
});
ipcMain.handle("copy-text", (_e, text) => {
  clipboard.writeText(String(text));
});
ipcMain.handle("take-pending-link", () => {
  const url = pendingLink;
  pendingLink = null;
  return url;
});
ipcMain.handle("save-file", async (_e, name, text) => {
  const safeName = String(name || "LinkBox-links.json").replace(/[\\/:*?"<>|]/g, "-");
  const result = await dialog.showSaveDialog(win, {
    title: "Save links to share",
    defaultPath: path.join(app.getPath("documents"), safeName),
    filters: [{ name: "Link Box file", extensions: ["json"] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.promises.writeFile(result.filePath, String(text), "utf8");
  shell.showItemInFolder(result.filePath);
  return { path: result.filePath };
});
