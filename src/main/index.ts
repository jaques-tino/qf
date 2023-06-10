import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 1364,
    minHeight: 768,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
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

  ipcMain.handle('showWebviewMenu', (_, id: number) => {
    const menu = Menu.buildFromTemplate([
      {
        label: '打开开发者工具',
        accelerator: 'F12',
        click: (): void => {
          mainWindow.webContents.send('open-devtools', id)
        }
      }
    ])

    menu.popup()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('web-contents-created', (_, webContents) => {
    webContents.setWindowOpenHandler((details) => {
      const { url } = details
      mainWindow.webContents.send('open-url', url)
      return {
        action: 'deny'
      }
    })
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
