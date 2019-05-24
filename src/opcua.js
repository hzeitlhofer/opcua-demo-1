const opcua = require("node-opcua");
const config = require("../config");

const options = {
    endpoint_must_exist: false,
    keepSessionAlive: true,
    connectionStrategy: {
        maxRetry: 10,
        initialDelay: 2000,
        maxDelay: 10*1000
    }
};

let client = new opcua.OPCUAClient(options);

let root_node = {
//	id: 0,
	id: "ns=0;i=85",
	text: "Objects"
};	

let the_session;
let the_subscription;

let nodes = [root_node];
let sense = config.nodes.sense;
let series = [];
let set = {
	ts: false,
	data: []
};
let id=0;
let nodecount = 0;

const browse = async (n, depth) => {
    n = n || root_node;
    depth = depth || 0;

    await the_session.browse(n.id, async function (err, data) {
    	n.nodes = [];
        for (let i in data.references) {
            let r = data.references[i];
            let idtype = (r.nodeId.identifierType == 1) ? "i" : "s";
            let id = "ns="+r.nodeId.namespace+";"+idtype+"="+r.nodeId.value;
            let node = {
            	id: id,
            	text: encodeURIComponent(r.displayName.text),
            	tags: [id]
            }
            n.nodes.push(node);
            nodecount++;

//            console.log(" ".repeat(depth), r.browseName.name,":",nodeId);
//            console.log(r);
            await browse(node, depth+4);
        }
    });
}

const readValues = async () => {

	let s = {
		ts:  new Date().getTime(),
		data: []
	};

    for (i in sense) {
    	let n = sense[i];
        await the_session.readVariableValue(n.id, function (err, data) {
			if (data.value) {
	            let value = data.value.value;
	            if (typeof value === 'object') {
	                value = value.text;
	            }
	            s.data.push({i: n.id, n: n.text, v: value});
	        }
        })
    }
    series.push(s);
    set = s;
}

const setNodes = (data) => {
	sense = data;
}

const getValues = () => {
	return set;
}

const getSeries = () => {
	return series;
}

const startMonitoring = () => {
    setInterval(() => {
        readValues();
		console.log("found",nodecount,"OPCUA variables");
    }, config.interval || 1000);
}


const createSession = async () => {
   let userIdentity = null;
    client.createSession(userIdentity, async function (err, session) {
        if (err) {
        	console.log(err);
        } else {
            the_session = session;
            console.log("session created".yellow);
            console.log("sessionId : ", session.sessionId.toString());
            console.log("start browsing".yellow);            
			await browse();
			console.log("found",nodecount,"OPCUA variables");
			startMonitoring();
        }
    });

}

const connect = (endpointUrl) => {
	console.log("connecting to ", endpointUrl);
    client.connect(endpointUrl, () => {
        console.log('connected');
        createSession();
    })
};

const run = () => {
	connect(config.server);
}

const getNodes = () => {
	console.log("found",nodecount,"OPCUA variables");
	return nodes;
}

module.exports = {
	run: run,
	getNodes: getNodes,
	setNodes: setNodes,
	getValues: getValues,
	getSeries: getSeries
};



