/* eslint-disable @typescript-eslint/no-explicit-any */
import { IpcRenderer, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
    contextBridge.exposeInMainWorld('electronApi', {
      openUrl: (callback) => ipcRenderer.on('open-url', callback),
      openDevTools: (callback) => ipcRenderer.on('open-devtools', callback)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.ipcRenderer = ipcRenderer
  // @ts-ignore (define in dts)
  window.electronApi = {
    openUrl: (callback): IpcRenderer => ipcRenderer.on('open-url', callback),
    openDevTools: (callback): IpcRenderer => ipcRenderer.on('open-devtools', callback)
  }
}
