//Created by M. Francis - 2020

"use strict";

const port = process.env.PORT || 8080;

var http = require("http");   //Web server
var fs = require("fs");       //File server
var url = require("url");     //URL parsing
var mmm = require('mmmagic'); //MIME type parsing
var path = require('path');   //File path detection

var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

//A function that returns the 404 webpage contents
function return404(){
	fs.readFile("./404.html", function(err, data){
		return data;
	});
}

//The port to listen to
http.createServer(function(req, res){
	//Parse url
	var q = url.parse(req.url, true);
	var filename = "." + q.pathname;
	if(filename == "./"){
		filename = "./index.html";
	}

	//Get file type
	var extname = path.extname(filename);
	var contentType = "text/html";
	switch(extname){
		case ".css":
			contentType = "text/css";
			break;
		case ".js":
			contentType = "text/javascript";
			break;
		case ".json":
			contentType = "application/json";
			break;
		case ".png":
			contentType = "image/png";
			break;
		case ".svg":
			contentType = "image/svg+xml";
			break;
		case ".ico":
			contentType = "image/x-icon";
			break;
	}

	//Get file
	fs.readFile(filename, function(err, data){
		//If we received an error
		if(err){
			//Send the user a 404 error
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.write("404 :(\n" + filename + " is not a real place.\n" + err + " is what to look in to");
			return res.end();
		}

		//Return the desired webpage
		try {
			console.log("SUCCESS: " + contentType);
			res.writeHead(200, {"Content-Type": contentType});
		} catch {
			console.log("ERROR: " + contentType);
			res.writeHead(200, {"Content-Type": "text/plain"});
		}
		
		res.write(data);
		return res.end();
	});
}).listen(port);

var io = require("socket.io")(http);

/**
 * Listens for incoming connections from clients
 */
io.sockets.on("connection", function (socket) {
	//LISTEN FOR EVENTS IN HERE

	//Send information about joining
	socket.on("join", function(data){
		// 
	});
	//Send information about leaving
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
