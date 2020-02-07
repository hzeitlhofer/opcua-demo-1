var Device = function(app, clients) {

    try {

	    var process = function() {
	        
	    	let data = clients[0].getSeries();
			let topic = 'br/hmidemo/0';

        	console.log(topic, data);

	    	if (data && data.data && data.data.length) {
        		app.io.emit('data', {
        			topic: topic,
        			payload: data
        		});
	        }

	    }

	    var startTimer = function() {
	        process();
	        this.timer = setInterval(function() {
	            process();
	        }, 1000);
	    }

	    var init = function() {
	        startTimer();
	    }


	} catch(e) {
		console.log(e);
		process.exit();
	}

	init();
}

const run = (app, clients) => {
	var dev = new Device(app, clients);
};

module.exports = {
	run: run
};




