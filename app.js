//Created by M. Francis - 2020

const port = 8080;

var server = require('http').createServer(function(req, res){
	switch(req.url){
		//Main page
		case "/":
			res.writeHead(200, {'Content-Type': 'text/html'});
			break;
		default:
			req.addListener('end', function(){
				//Return the correct file
				fileServer.serve(req, res);
			});
			break;
	}
});
var io = require('socket.io').listen(server);
var static = require('node-static'); // for serving files

//Create a new server
var fileServer = new static.Server('./');

//The port to listen to
server.listen(port);

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
