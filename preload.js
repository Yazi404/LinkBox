const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("linkbox", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  copyText: (text) => ipcRenderer.invoke("copy-text", text),
  saveFile: (name, text) => ipcRenderer.invoke("save-file", name, text),
  takePendingLink: () => ipcRenderer.invoke("take-pending-link"),
  onSharedLink: (callback) => ipcRenderer.on("shared-link", (_e, url) => callback(url))
});
