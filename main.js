'use strict'

const path = require('path')
const { app, BrowserWindow, ipcMain, Menu } = require('electron')

var mainWindow = null;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		show: false,
		width: 800,
		height: 600,
	})

	// and load the index.html of the app.
	mainWindow.loadFile(path.join('src', 'index.html'))

	// Open the DevTools.
	mainWindow.webContents.openDevTools()

    // Gracefully show when ready
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})
}


// This method will be called when Electron has finished initialization and is
// ready to create browser windows. Some APIs can only be used after this
// event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the dock
		// icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})



// Quit when all windows are closed, except on macOS. There, it's common for
// applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})



ipcMain.on('title:change', (event, title) => {
	if (title === '') {
		mainWindow.setTitle('GASM');
	} else {
		mainWindow.setTitle('GASM - ' + title);
	}
})



var menu = Menu.buildFromTemplate([
{
	label: 'File',
	submenu: [
	{
		label:'New File',
		accelerator: 'CmdOrCtrl+N',
		click() { mainWindow.webContents.send('onNew') }
	},
	{
		label:'Open File',
		accelerator: 'CmdOrCtrl+O',
		click() { mainWindow.webContents.send('onOpen') }
	},
	{
		label:'Save',
		accelerator: 'CmdOrCtrl+S',
		click() { mainWindow.webContents.send('onSave') }
	},
	{
		label:'Save As',
		accelerator: 'CmdOrCtrl+Shift+S',
		click() { mainWindow.webContents.send('onSaveAs') }
	},
	{type:'separator'},
	{
		label:'Exit',
		accelerator: 'CmdOrCtrl+Q',
		click() { app.quit() }
	}
	]
},
{
	label: 'Build',
	submenu: [
	{
		label:'Build',
		accelerator: 'CmdOrCtrl+B',
		click() { mainWindow.webContents.send('onBuild') }
	}
	]
}
])



Menu.setApplicationMenu(menu);
