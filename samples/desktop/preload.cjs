const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "studioStore",
  Object.freeze({
    load: () => ipcRenderer.invoke("studio:load"),
    save: (value) => ipcRenderer.invoke("studio:save", value),
    export: () => ipcRenderer.invoke("studio:export"),
  }),
);
