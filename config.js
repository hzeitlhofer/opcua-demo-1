module.exports = {
    server: "opc.tcp://10.0.0.100:4840",
//    server: "opc.tcp://opcuaserver.com:4840",
//    server: "opc.tcp://opcuademo.sterfive.com:26543",
    interval: 1000,
    nodes: {
    	monitor: [
	    	'ns=4;i=40004',
    	],
    	sense: []
    }
}

