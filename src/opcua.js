const opcua = require("node-opcua");
const config = require("../config");

function Client(config) {
    self = this;

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
    //  id: 0,
        id: "ns=0;i=85",
        text: "Objects"
    };  

    let the_session;

    let nodes = [root_node];
    let sense = config.nodes.sense;
    let series = [];
    let set = {
        ts: false,
        data: []
    };
    let id=0;
    let nodecount = 0;
    let _nodecount = 0;
    let nodecountnotified = false;
    
    this.running = false;

    this.browse = (n, depth) => {
        n = n || root_node;
        depth = depth || 0;

        the_session.browse(n.id, async function (err, data) {
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

                self.browse(node, depth+4);
            }
        });
    }

    this.readValues = async () => {

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

    this.setNodes = (data) => {
        sense = data;
    }

    this.getValues = () => {
        return set;
    }

    this.getSeries = () => {
        if (!this.running) return false;

        ret = series.splice(0, series.length);
        console.log('get', ret);
        return ret;
    }

    this.startMonitoring = () => {
        console.log("start monitoring".yellow);            
        setInterval(() => {
            
            self.readValues();
            
            if (nodecount == _nodecount && nodecount > 0 && !nodecountnotified) {
                console.log("found",nodecount,"OPCUA variables");
                nodecountnotified = true;
            }

            _nodecount = nodecount;

        }, config.interval || 1000);
    }


    this.createSession = async () => {
       let userIdentity = null;
        client.createSession(userIdentity, async function (err, session) {
            if (err) {
                console.log(err);
            } else {
                the_session = session;
                console.log("session created".yellow);
                console.log("sessionId : ", session.sessionId.toString());
                console.log("start browsing".yellow);            
                self.browse();
                self.startMonitoring();
                self.running = true;
            }
        });

    }

    this.connect = (config) => {
        console.log("connecting to ", config.url);
        client.connect(config.url, () => {
            console.log('connected');
            self.createSession();
        })
    };

    this.getNodes = () => {
        return nodes;
    }

    this.connect(config);
}

module.exports = Client;




