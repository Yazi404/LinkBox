// Link Box – desktop app (Windows & Mac)
const { app, BrowserWindow, shell, ipcMain, clipboard } = require("electron");
const path = require("path");

const SAFE = /^(https?:|ftp:|mailto:)/i;

function createWindow() {
  const win = new BrowserWindow({
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

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
