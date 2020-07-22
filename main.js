'use strict'

const path = require('path')
const { app, ipcMain, Menu } = require('electron')
const Window = require('./Window')

require('electron-reload')(__dirname, {
	electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

let mainWindow = {}

function main () {
	mainWindow = new Window({
		file: path.join('src', 'index.html')
	})

	ipcMain.on('title:change', (event, title) => {
		if (title === '') {
			mainWindow.setTitle('GASM');
		} else {
			mainWindow.setTitle('GASM - ' + title);
		}
	})
}

var menu = Menu.buildFromTemplate([
{
	label: 'File',
	submenu: [
	{
		label:'New File',
		accelerator: 'CmdOrCtrl+N',
		click() { fileNew() }
	},
	{
		label:'Open File',
		accelerator: 'CmdOrCtrl+O',
		click() { fileOpen() }
	},
	{
		label:'Save',
		accelerator: 'CmdOrCtrl+S',
		click() { fileSave() }
	},
	{
		label:'Save As',
		accelerator: 'CmdOrCtrl+Shift+S',
		click() { fileSaveAs() }
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
		click() { build() }}
	]
}
])
Menu.setApplicationMenu(menu);


app.on('ready', main)

app.on('window-all-closed', function () {
	app.quit()
})

function fileNew () {
	mainWindow.webContents.send('onNew');
}

function fileSave () {
	mainWindow.webContents.send('onSave');
}

function fileSaveAs () {
	mainWindow.webContents.send('onSaveAs');
}

function fileOpen () {
	mainWindow.webContents.send('onOpen');
}

function build () {
	mainWindow.webContents.send('onBuild');
}