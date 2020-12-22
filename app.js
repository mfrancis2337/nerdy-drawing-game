//Created by M. Francis - 2020

const port = 8080;

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var static = require('node-static'); // for serving files

//Create a new server
var fileServer = new static.Server('./');

//The port to listen to
app.listen(port);

/**
 * Serves files from the server when opened in a browser
 * @param {IncomingMessage} request The request from the client
 * @param {ServerResponse} response The response to the client
 */
function handler(request, response) {
	request.addListener('end', function () {
		//Return the correct file
		fileServer.serve(request, response);
	});
}

//Prevents debug messages (comment it out to have debug messages)
io.set('log level', 1);

/**
 * Listens for incoming connections from clients
 */
io.sockets.on('connection', function (socket) {
	//LISTEN FOR EVENTS IN HERE

	//Send information about joining
	socket.on("join", function(data){
		// 
	});
	socket.on("leave", function(data){
		//
	});

	//Send information about drawing information
	socket.on("draw", function(data){
		//
	});
	//Send information about filling
	socket.on("fill", function(data){
		// 
	});
	//Send information about erasing
	socket.on("erase", function(data){
		// 
	});

	// socket.broadcast.emit("your message here", data);
});
