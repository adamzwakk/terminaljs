function Terminal(options){
	this.columns = options.columns;
	this.path = options.path;
	this.user = options.user;
	this.server = options.server;
	this.bootSeq = options.bootSeq;
	this.width = options.width;
	this.height = options.height;
	this.font = options.defaultfont;

	this.app = new PIXI.Application(this.width,this.height);
	this.command = '';
	this.allowCommands = false;
	this.drawingLine = false;
	this.prefix = this.user+'@'+this.server+':'+this.path+'$ ';
	this.outputLines = [];
	this.activeLine = 0;
	this.textStyle = new PIXI.TextStyle({
	    fontFamily: this.font.family,
	    fontSize: this.font.size,
	    fill: this.font.color
	});
	this.mainContainer = new PIXI.Container();
	this.textContainer = new PIXI.Container();
	this.crtFilter = new PIXI.filters.CRTFilter({
		// options at https://github.com/pixijs/pixi-filters/blob/master/filters/crt/src/CRTFilter.js
		curvature:5,
		lineWidth:4,
		vignettingAlpha:0.3,
		noise:1,
		time:5
	});

	this.startup = function(){
		document.body.appendChild(this.app.view);
		this.app.stage.addChild(this.mainContainer);
		var graphics = new PIXI.Graphics();
		graphics.beginFill(0x999999);
		graphics.drawRect(0, 0, this.width,this.height);
		this.mainContainer.addChild(graphics);
		this.mainContainer.addChild(this.textContainer);
		this.mainContainer.filters = [this.crtFilter];

		this.app.ticker.add(function(delta) {
			that.crtFilter.time = that.crtFilter.time*delta;
		});

		document.addEventListener('keydown', (event) => {
			if(this.allowCommands){	
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

				this.outputLines[this.activeLine].text = this.prefix+this.command;
			}
		});

		var that = this;
		if(typeof this.bootSeq === 'object'){
			setTimeout(function(){
				that.playOutputTimeline(that.bootSeq,function(){
					setTimeout(function(){
						that.bootOS();
					},500);
				});
			},500);
		} else {
			setTimeout(function(){
				that.bootOS();
			},500);
		}
	}

	this.drawLine = function(text,callback){
		if((this.activeLine+2) >= this.columns){
			console.log('whoooa there');
			return;
		}

		var ptext = this.createOutputLine();
		var chars = text.split('');
		this.textContainer.addChild(ptext);

		var index = 0;
		drawLineTicker = new PIXI.ticker.Ticker({speed:0.3});
		drawLineTicker.add(function(delta) {
			if(ptext.text !== '' && ptext.text.substr(-1,1) === '█'){
				ptext.text = ptext.text.substr(0,ptext.text.length-1);
			}
			if(index >= chars.length){
				drawLineTicker.stop();
				drawLineTicker.remove();
				return;
			}
			ptext.text = (ptext.text+chars[index]+'█').trim();
			index++;
		}).start();
	}

	this.initTerminal = function(){
		for (i = 0; i < this.outputLines.length; i++) { 
			this.textContainer.removeChild(this.outputLines[i]);
		}

		this.outputLines = [];
		this.activeLine = 0;
		this.drawLine(this.prefix+'█');
	}

	this.sendCommand = function(){
		var com = this.command.split(' ');
		switch(com[0]){
			case "clr":
			case "clear":
				this.initTerminal();
				this.command = '';
				return;
			case "reboot":
				location.reload();
				return;
			case "":
				//no command
				this.linebreak();
				this.drawLine('');
				return;
			case "ls":
			case "dir":
				this.linebreak();
				this.drawLine('text.txt');
				this.linebreak();
				this.drawLine('test5.txt');
				break;
			default:
				this.linebreak();
				this.drawLine('-bash: '+com[0]+': command not found');
		}

		this.command = '';
		this.linebreak();
		this.drawLine('');

	}

	this.bootOS = function(){
		this.initTerminal(); 
		this.allowCommands = true;
	}

	this.playOutputTimeline = function(obj,callback){
		this.allowCommands = false;
		var timed = 0;
		var that = this;
		Object.keys(obj).forEach(function(key) {
			if(key === 'lines'){
				var length = Object.keys(obj[key]).length;
				var lines = obj[key];
				var lineCount = 0;
				Object.keys(lines).forEach(function(time) {
					lineCount++;
					var l = lines[time];
					setTimeout(function(lineCount){
						that.drawLine(l);
						that.linebreak();
						if(lineCount === length)
						{
							callback();
							that.allowCommands = true;
						}
					},parseInt(time),lineCount);
				});
			}
		});
	}

	this.createOutputLine = function(){
		if(typeof this.outputLines[this.activeLine] === 'undefined'){
			var ptext = new PIXI.Text(null,this.textStyle);
			ptext.x = 8;
			ptext.y = (this.columns*this.activeLine)+8;
			this.outputLines.push(ptext);
		} else {
			var ptext = this.outputLines[this.activeLine];
		}

		return ptext;
	}

	this.linebreak = function(){
		this.activeLine++;
	}
}