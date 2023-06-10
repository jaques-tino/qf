import { ElectronAPI, IpcRenderer } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    ipcRenderer: IpcRenderer
    electronApi: {
      openUrl: (callback) => IpcRenderer
      openDevTools: (callback) => IpcRenderer
    }
  }
}
