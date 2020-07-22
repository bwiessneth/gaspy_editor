'use strict'

const { ipcRenderer, remote } = require('electron')
const dialog = remote.dialog 
const fs = require('fs');
const path = require('path');
const { PythonShell } = require('python-shell')
const Split = require('split.js')
require('popper.js');
require('bootstrap');
// const $ = require('jquery');
// window.$ = window.jQuery = require('jquery');


const sourceFile = {}

// Create CodeMirror object from textarea
const myCodeMirror = CodeMirror.fromTextArea(sourceeditor, {
	lineNumbers: true,
	lineWrapping: true,
	gutters: ["CodeMirror-linenumbers", "subroutines", "breakpoints"],
	mode: "gasm",
});

myCodeMirror.setSize("100%", "100%");


ipcRenderer.on('onNew', (event, arg) => {
	console.log('onNew')

	sourceFile.content = '';
	sourceFile.filepath = '';
	sourceFile.filename = '';
	sourceFile.dir = '';
	ipcRenderer.send('title:change', sourceFile.filename);

	myCodeMirror.setValue(sourceFile.content);
	myCodeMirror.refresh();
})


ipcRenderer.on('onOpen', (event, arg) => {
	console.log('onOpen')

	dialog.showOpenDialog((fileNames) => {

	    if(fileNames === undefined){
	    	console.log("No file selected");
	    	return;
	    }

	    fs.readFile(fileNames[0], 'utf-8', (err, data) => {
	    	if(err){
	    		alert("An error ocurred reading the file :" + err.message);
	    		return;
	    	}

	    	sourceFile.content = data;
	    	sourceFile.filepath = fileNames[0]
	    	sourceFile.filename = path.parse(sourceFile.filepath).base;
	    	sourceFile.dir = path.parse(sourceFile.filepath).dir;
	    	myCodeMirror.setValue(sourceFile.content);
	    	myCodeMirror.refresh();

	    	ipcRenderer.send('title:change', sourceFile.filename);
	    });
	});
})


ipcRenderer.on('onSave', (event, arg) => {
	console.log('onSave')
	
	var filepath;

	if (sourceFile.filepath) {
		filepath = sourceFile.filepath;
	} else {
		console.log('No filepath set, opening dialog')
		filepath = dialog.showSaveDialog({});
	}

	sourceFile.content = myCodeMirror.getValue();
	fs.writeFile(filepath, sourceFile.content, function(err) {
		if(err){
			alert("An error ocurred saving the file :" + err.message);
			return;
		}		
		sourceFile.filepath = filepath;
		sourceFile.filename = path.parse(sourceFile.filepath).base;
		sourceFile.dir = path.parse(sourceFile.filepath).dir;
		ipcRenderer.send('title:change', sourceFile.filename);
	});
})


ipcRenderer.on('onSaveAs', (event, arg) => {
	console.log('onSaveAs')

	var filepath;
	filepath = dialog.showSaveDialog({});

	sourceFile.content = myCodeMirror.getValue();
	fs.writeFile(filepath, sourceFile.content, function(err) {
		if(err){
			alert("An error ocurred saving the file :" + err.message);
			return;
		}
		sourceFile.filepath = filepath;
		sourceFile.filename = path.parse(sourceFile.filepath).base;
		sourceFile.dir = path.parse(sourceFile.filepath).dir;
		ipcRenderer.send('title:change', sourceFile.filename);
	});
})


ipcRenderer.on('onBuild', (event, arg) => {
	console.log('onBuild')
	log_clear();

	// Show log pane by resizing it to 25% height	
	splitView.setSizes([75, 25])

	var gass_options = {
		mode: 'text',
		// pythonPath: 'path/to/python',
		pythonOptions: ['-u'],
		scriptPath: 'gumnut_simulator\\GumnutSimulator\\',
		args: [sourceFile.filepath, "-o", sourceFile.dir]
		// args: ['-h']
	};

	console.log({gass_options})

	PythonShell.run('GumnutAssembler.py', gass_options, function (err, results) {
		if (err) {
			log(err.message);
		}
		// results is an array consisting of messages collected during execution
		if (results) {
			log(results.join('\n'));
		}
	});
})

function log(text) {
	document.getElementById("logeditor").value += text;
}

function log_clear(text) {
	document.getElementById("logeditor").value = '';
}

ipcRenderer.on('onLog', (event, arg) => {
	log(arg);
})

const splitView = Split(['.a', '.b'], {
    gutterSize: 3,
    direction: "vertical",
    sizes: [100, 0],
    minSize: 0,
    snapOffset: 1,
});


document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.keyCode === 27) {
        splitView.setSizes([100, 0])
    }
});