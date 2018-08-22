function Terminal(options){
	this.columns = options.columns;
	this.path = options.path;
	this.user = options.user;
	this.server = options.server;
	this.bootSeq = options.bootSeq;

	this.app = new PIXI.Application(800,600);
	this.command = '';
	this.prefix = this.user+'@'+this.server+':'+this.path+'$ ';
	this.outputLines = [];
	this.activeLine = 0;
	this.textStyle = new PIXI.TextStyle({
	    fontFamily: 'VT323',
	    fontSize: 24,
	    fill: '#ffffff'
	});
	this.textContainer = new PIXI.Container();

	this.startup = function(){
		this.app.stage.addChild(this.textContainer);
		this.textContainer.filterArea = new PIXI.Rectangle(0,0,800,600);
		this.textContainer.filters = [new PIXI.filters.CRTFilter({
			// options at https://github.com/pixijs/pixi-filters/blob/master/filters/crt/src/CRTFilter.js
			curvature:4,
			vignettingAlpha:0.5
		})];

		for (i = 0; i < this.columns; i++) { 
			text = new PIXI.Text('',this.textStyle);
			text.x = 8;
			text.y = (this.columns*i)+8;
			this.outputLines.push(text);
		}

		document.body.appendChild(this.app.view);

		document.addEventListener('keydown', (event) => {
			var keycode = event.keyCode;
			var keyName = event.key;

			switch(keycode){
				case 13:
					this.sendCommand(this.command);
					break;
				case 8:
					this.command = this.command.substr(0,this.command.length-1);
					break;
				default:
					if (keyName.length === 1 && /[a-zA-Z0-9-_/ ]/.test(keyName)){
						this.command += keyName;
					}
			}
			this.textContainer.removeChild(this.outputLines[this.activeLine]);
			this.outputLines[this.activeLine].text = this.prefix+this.command;
			this.textContainer.addChild(this.outputLines[this.activeLine]);
		});

		var that = this;
		if(Array.isArray(this.bootSeq)){

		} else {
			setTimeout(function(){that.initTerminal(); that.readyForInput();},500);	
		}
	}

	this.drawNewBashLine = function(){
		this.outputLines[this.activeLine].text = this.prefix;
		this.textContainer.addChild(this.outputLines[this.activeLine]);
	}

	this.drawLine = function(text){
		this.outputLines[this.activeLine].text = text;
		this.textContainer.addChild(this.outputLines[this.activeLine]);
		this.activeLine++;
	}

	this.initTerminal = function(){
		for (i = 0; i < this.outputLines.length-1; i++) { 
			this.outputLines[i].text = '';
			this.textContainer.removeChild(this.outputLines[i]);
		}

		this.activeLine = 0;
		this.drawNewBashLine();
	}

	this.readyForInput = function(){
		var that = this;
		this.app.ticker.add(function(delta) {
			//that.drawCommandOutput();
		});
	}

	this.sendCommand = function(){
		switch(this.command){
			case "clr":
				this.initTerminal();
				this.command = '';
				return;
			case "reboot":
				location.reload();
				return;
		}
		
		//ajax bullshit otherwise...

		this.command = '';
		this.activeLine++;
		this.drawNewBashLine();
	}
}