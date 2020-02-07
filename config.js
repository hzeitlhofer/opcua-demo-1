module.exports = [
	{
	    url: "opc.tcp://10.0.0.100:4840",
	    interval: 1000,
	    nodes: {
	    	monitor: [
		    	'ns=4;i=40004',
	    	],
	    	sense: [{
	    		id: 'ns=6;s=::HZ01:HZ01_IOImage.Data.counter',
	    		text: 'counter'
	    	}]
	    }
    }, {
	    url: "opc.tcp://opcuaserver.com:4840",
	    interval: 1000,
	    nodes: {
	    	monitor: [],
	    	sense: []
	    }
    }, {
	    url: "opc.tcp://opcuademo.sterfive.com:26543",
	    interval: 1000,
	    nodes: {
	    	monitor: [],
	    	sense: []
	    }
    }
]

