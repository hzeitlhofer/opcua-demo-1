const opcua = require("./opcua");


var Device = function(app, o) {

    try {

	    var process = function() {
	        
			let topic = 'br/opcuatest/measure';
	    	let data = opcua.getValues();

	    	if (data.data.length) {
	        	console.log(topic, data);
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
}

const run = (app) => {
	var dev = new Device(app, {
	    name: 'opcua-test'
	});
};

module.exports = {
	run: run
};




