'use strict'

const { ipcRenderer, remote } = require('electron')
const dialog = remote.dialog 
const fs = require('fs');
const path = require('path');
const child_process = require('child_process')
const Split = require('split.js')
require('popper.js');
require('bootstrap');


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
	log("\n");

	// Show log pane by resizing it to 25% height	
	splitView.setSizes([75, 25])

	var	exec_proc = child_process.exec('gaspy ' + sourceFile.filepath + " -o " + sourceFile.dir, (error, stdout, stderr, exitCode) => {		
		if (error === null) {
			console.log("Build complete!")
			log("Build complete!\n")
		} else {
			console.log("Build failed!")
			console.log(stderr)
			log("Build failed!\n")
			log(stderr)
		}
	});

})

function log(text) {
	document.getElementById("logeditor").value += text;
}

function log_clear(text) {
	document.getElementById("logeditor").value = '';
}

const splitView = Split(['.a', '.b'], {
	gutterSize: 3,
	direction: "vertical",
	sizes: [100, 0],
	minSize: 0,
	snapOffset: 1,
	onDragEnd: myCodeMirror.refresh()
});


document.addEventListener('keydown', event => {
	if (event.key === 'Escape' || event.keyCode === 27) {
		hide_log();
	}
});

function show_log() {
	splitView.setSizes([75, 25])
	myCodeMirror.refresh()
}

function hide_log() {
	splitView.setSizes([100, 0])
	myCodeMirror.refresh()
}

function check_gaspy_installation() {
	child_process.exec('gaspy --version', (error, stdout, stderr) => {
		if ((error === null) && (stderr === "")) {
			var prog_version = stdout.match(/gaspy (\d+).(\d+).(\d+)/);
			if (prog_version.length == 4) {
				var prog_version_major = prog_version[1];
				var prog_version_minor = prog_version[2];
				var prog_version_patch = prog_version[3];

				if ((prog_version_major == 1) && (prog_version_minor >= 0) && (prog_version_patch >= 1)) {
					console.log("Found dependency: " + stdout);
					log("Found dependency: " + stdout);
					return prog_version
				} else {
					console.log("Found dependency not installed: gaspy version >= 1.0.1");
					log("Found dependency not installed: gaspy version >= 1.0.1\n");
					show_log();
				}
			}
		} else {
			console.log("Found dependency not installed: gaspy version >= 1.0.1");
			log("Found dependency not installed: gaspy version >= 1.0.1\n");
			show_log();
		}
	});
}


function check_python_installation() {
	child_process.exec('python --version', (error, stdout, stderr) => {
		if ((error === null) && (stderr === "")) {
			var prog_version = stdout.match(/Python (\d+).(\d+).(\d+)/);
			if (prog_version.length == 4) {
				var prog_version_major = prog_version[1];
				var prog_version_minor = prog_version[2];
				var prog_version_patch = prog_version[3];

				if ((prog_version_major == 3) && (prog_version_minor >= 5)) {
					console.log("Found dependency: " + stdout);
					log("Found dependency: " + stdout);
					return prog_version
				} else {
					console.log("Found dependency not installed: python version >= 3.5.0");
					log("Found dependency not installed: python version >= 3.5.0\n");
					show_log();
				}
			}
		} else {
			console.log("Found dependency not installed: python version >= 3.5.0");
			log("Found dependency not installed: python version >= 3.5.0\n");
			show_log();
		}
	});
}

const py_version = check_python_installation()
const gaspy_version = check_gaspy_installation()
