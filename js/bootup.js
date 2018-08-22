function bootup(){
	setTimeout(function(){
		drawLine('Boot-up sequence starting...');
		setTimeout(function(){
			drawLine('...');
			setTimeout(function(){
				drawLine('...');
				setTimeout(function(){
					drawLine('...');
					setTimeout(function(){
						drawLine('READY!');
						setTimeout(function(){initConsole()},2000);
					},800);
				},800);
			},800);
		},800);
		
	},500);
}