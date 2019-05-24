const express = require("express");
const http = require("http");
const socketio = require('socket.io');
const bodyParser = require("body-parser");
const path = require('path');
const config = require("../config");
const opcua = require("./opcua");
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

app.get('/nodes', async (req, res) => {
	res.send(opcua.getNodes());
});

app.get('/get', async (req, res) => {
	let v = await opcua.getValues();
	res.send(v);
})

app.get('/all', async (req, res) => {
	let v = await opcua.getSeries();
	res.send(v);
})

app.io.on('connection', function(socket) {
	console.log('client connection established');
	socket.on('nodes', function(msg) {
		console.log(msg);
		opcua.setNodes(msg);
	})
})

app.message = function(msg) {
	console.log(msg);
	app.io.emit('message', msg);
}

opcua.run();
monitor.run(app);

module.exports = app;

