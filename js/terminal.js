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

		for (i = 0; i < this.columns; i++) { 
			text = new PIXI.Text(null,this.textStyle);
			text.x = 8;
			text.y = (this.columns*i)+8;
			this.outputLines.push(text);
		}

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
				this.textContainer.removeChild(this.outputLines[this.activeLine]);
				this.outputLines[this.activeLine].text = this.prefix+this.command;
				this.textContainer.addChild(this.outputLines[this.activeLine]);
			}
		});

		var that = this;
		if(typeof this.bootSeq === 'object'){
			setTimeout(function(){
				that.playOutputTimeline(that.bootSeq,function(){
					that.bootOS();
				});
			},500);
		} else {
			setTimeout(function(){
				that.bootOS();
			},500);
		}
	}

	this.drawLine = function(text,lbAfter){
		if(text !== ''){
			drawLineTicker = new PIXI.ticker.Ticker({speed:0.3});
			var line = this.outputLines[this.activeLine];
			var chars = text.split('');
			this.textContainer.addChild(line);

			var index = 0;
			drawLineTicker.add(function(delta) {
				if(line.text !== '' && line.text.substr(-1,1) === '█'){
					line.text = line.text.substr(0,line.text.length-1);
				}
				if(index >= chars.length){
					drawLineTicker.stop();
					drawLineTicker.remove();
					delete drawLineTicker;
					return;
				}

				line.text += chars[index]+'█';
				index++;
			}).start();
		}
		
		if(lbAfter){
			this.activeLine++;
		}
	}

	this.initTerminal = function(){
		for (i = 0; i < this.outputLines.length; i++) { 
			this.outputLines[i].text = null;
			this.textContainer.removeChild(this.outputLines[i]);
		}

		this.activeLine = 0;
		this.drawLine(this.prefix,false);
	}

	this.readyForInput = function(){
		var that = this;
	}

	this.sendCommand = function(){
		var com = this.command.split(' ');
		switch(com[0]){
			case "clr":
				this.initTerminal();
				this.command = '';
				return;
			case "clear":
				this.initTerminal();
				this.command = '';
				return;
			case "reboot":
				location.reload();
				return;
			case "":
				//no command
				this.drawLine('',true);
				return;
			default:
				this.activeLine++;
				this.drawLine('-bash: '+com[0]+': command not found',false);
		}

		this.command = '';
		this.drawLine('',true);
	}

	this.bootOS = function(){
		this.initTerminal(); 
		this.readyForInput();
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
						that.drawLine(l,true);
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

	this.animateCRT = function(delta){
		this.crtFilter.time = this.crtFilter.time*delta;
	}
}