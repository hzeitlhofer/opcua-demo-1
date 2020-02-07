const express = require("express");
const http = require("http");
const socketio = require('socket.io');
const bodyParser = require("body-parser");
const path = require('path');
const config = require("../config");
const Client = require("./opcua");
const monitor = require("./monitor");
const app = express();

app.server = http.createServer(app);
app.io = socketio(app.server);

app.version = '0.1';

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', './src/views');
app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'views')));

app.get('/getconfig', async (req, res) => {
	res.send(config);
});

app.get('/nodes/:id', async (req, res) => {
	res.send(clients[req.params.id].getNodes());
});

app.get('/get/:id', async (req, res) => {
	let v = await clients[req.params.id].getValues();
	res.send(v);
})

app.get('/all/:id', async (req, res) => {
	let v = await clients[req.params.id].getSeries();
	res.send(v);
})

app.io.on('connection', function(socket) {
	console.log('client connection established');
	socket.on('nodes', function(msg) {
		console.log(msg);
		clients[msg.id].setNodes(msg.nodes);
	})
})

app.message = function(msg) {
	console.log(msg);
	app.io.emit('message', msg);
}


let clients = [];
//for (i in config) {
	clients.push(new Client(config[0]));
//}

monitor.run(app, clients);

module.exports = app;

