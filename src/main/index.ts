import { app, shell, BrowserWindow, ipcMain, WebContents } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import contextMenu from 'electron-context-menu'

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    minWidth: 1364,
    minHeight: 900,
    width: 1364,
    height: 900,
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      height: 40,
      color: 'rgb(7, 14, 14)',
      symbolColor: 'rgb(183, 186, 196)'
    },
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      webviewTag: true
    }
  })

  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false)
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.handle('on-min', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('on-max', () => {
    mainWindow.maximize()
  })

  ipcMain.handle('on-unmax', () => {
    mainWindow.unmaximize()
  })

  ipcMain.handle('on-close', () => {
    mainWindow.close()
  })

  ipcMain.handle('platform', () => {
    return process.platform
  })

  ipcMain.handle('set-titlebar-overlay', (_, options) => {
    mainWindow.setTitleBarOverlay(options)
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('web-contents-created', (_, webContents) => {
    contextMenu({
      // electron-dl内部报错，需要这样解决，否则图片另存为失效
      window: { webContents } as unknown as WebContents,
      // window: webContents,
      showSaveImageAs: true,
      append: () => [
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: (): void => {
            webContents.openDevTools()
          }
        }
      ]
    })
    webContents.setWindowOpenHandler((details) => {
      const { url } = details
      mainWindow.webContents.send('open-url', url)
      return {
        action: 'deny'
      }
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
