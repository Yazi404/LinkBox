const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("linkbox", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  copyText: (text) => ipcRenderer.invoke("copy-text", text)
});
