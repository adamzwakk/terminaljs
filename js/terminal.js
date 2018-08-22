var command = '';
var outputLines = [];
var activeLine = 0;
var columns = 25;
var newCommand = false;
var folderpath = '~';
var textStyle = new PIXI.TextStyle({
    fontFamily: 'VT323',
    fontSize: 24,
    fill: '#ffffff'
});
var textContainer = new PIXI.Container();

var prefix = '';

function startup(){
	app.stage.addChild(textContainer);
	textContainer.filterArea = new PIXI.Rectangle(0,0,800,600);
	textContainer.filters = [new PIXI.filters.CRTFilter({
		// options at https://github.com/pixijs/pixi-filters/blob/master/filters/crt/src/CRTFilter.js
		curvature:4,
		vignettingAlpha:0.5
	})];

	for (i = 0; i < columns; i++) { 
		text = new PIXI.Text('',textStyle);
		text.x = 8;
		text.y = (columns*i)+8;
		outputLines.push(text);
	}

	document.body.appendChild(app.view);
}

function initConsole(){
	clearLines();
	drawNewLine();
}

function drawNewLine(){
	prefix = 'root@server-box:'+folderpath+'$ ';
	outputLines[activeLine].text = prefix;
	textContainer.addChild(outputLines[activeLine]);
}

function drawLine(text){
	outputLines[activeLine].text = text;
	textContainer.addChild(outputLines[activeLine]);
	activeLine++;
}

function clearLines(){
	for (i = 0; i < outputLines.length-1; i++) { 
		outputLines[i].text = '';
		textContainer.removeChild(outputLines[i]);
	}

	activeLine = 0;
}

const app = new PIXI.Application(800,600);

document.addEventListener('keydown', (event) => {
	var keycode = event.keyCode;
	var keyName = event.key;

	switch(keycode){
		case 13:
			newCommand = true;
			break;
		case 8:
			command = command.substr(0,command.length-1);
			break;
		default:
			if (keyName.length === 1 && /[a-zA-Z0-9-_/ ]/.test(keyName)){
				command += keyName;
			}
	}
	textContainer.removeChild(outputLines[activeLine]);
	outputLines[activeLine].text = prefix+command;
	textContainer.addChild(outputLines[activeLine]);
});

function drawCommandOutput(){
	if(newCommand){
		newCommand = false;
		switch(command){
			case "clr":
				clearLines();
				initConsole();
				command = '';
				return;
		}
		//ajax bullshit

		command = '';
		activeLine++;
		drawNewLine();
	}
}

startup();
bootup();
app.ticker.add(function(delta) {
	drawCommandOutput();
	
});