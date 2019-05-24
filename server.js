console.log('starting app');

const app = require("./src/app");

app.server.listen(8080, () => {
	console.log('listening on port 8080');
})