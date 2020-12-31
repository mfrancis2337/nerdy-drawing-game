//Created by M. Francis - 2020

"use strict";

const port = process.env.PORT || 8080;

var express = require("express");               //Import express js
var app = express();                            //Express function
var http = require("http").createServer(app); //Web server
var io = require("socket.io")(http);          //Socket.io

const users = new Map();
const rooms = new Map();

//Server
app.use(express.static(__dirname + '/public'));
http.listen(port, () => {
	console.log("Listening on port " + port);
});

/**
 * Listens for incoming connections from clients
 */
io.sockets.on("connection", function(socket){
	/**
	 * The many ways of sending messages:
	 *   - Send to sender                  socket.emit();
	 *   - Send to everyone                io.emit();
	 *   - Send to everyone except sender  socket.broadcast.emit();
	 *   - Send to everyone in room        socket.broadcast.to(room).emit();
	 */

	//Set a user id
	users.set(socket.id, {userid: socket.id, roomid: "", playername: "Unnamed user"});
	socket.emit("setuserid", socket.id);
	console.log(socket.id + " has joined.");

	//ON USER LEAVING
	socket.on("disconnect", function(){
		//Send leaving information
		let roomid = users.get(socket.id).roomid;
		if(roomid != ""){
			//Remove player information from server-side
			let playerID = rooms.get(roomid).playeridlist.indexOf(socket.id);
			let roomPlayerIDs = rooms.get(roomid).playeridlist || [];
			roomPlayerIDs.splice(playerID, 1);
			let roomPlayerNames = rooms.get(roomid).playernamelist || [];
			roomPlayerNames.splice(playerID, 1);
			let roomPlayerScores = rooms.get(roomid).playerscorelist || [];
			roomPlayerScores.splice(playerID, 1);
			rooms.set(roomid, {
				playeridlist: roomPlayerIDs,
				playernamelist: roomPlayerNames,
				playerscorelist: roomPlayerScores,
				turn: rooms.get(roomid).turn,
				word: rooms.get(roomid).word
			});
			//Send information to other users in room
			socket.to(roomid).emit("userleave", socket.id);
			//Remove room if empty
			if(rooms.get(roomid).playernamelist.length == 0){
				rooms.delete(roomid);
				console.log("Room " + roomid + " was deleted.");
			}
		}
		//Remove user
		users.delete(socket.id);
		console.log(socket.id + " has left.");
	});

	//LISTEN FOR EVENTS IN HERE

	//Send information about room availability
	socket.on("checkroom", function(data){
		if(rooms.has(data.roomid)){
			//Room exists
			if(rooms.get(data.roomid).players > 9){
				//Room is full
				socket.emit("checkroomresponse", {available: "no", reason: "room is full"});
			} else {
				//Room is not full, available to join
				socket.emit("checkroomresponse", {available: "yes", roomid: data.roomid});
			}
		} else {
			//Room does not exist
			socket.emit("checkroomresponse", {available: "no", reason: "room does not exist"});
		}
	});

	//Send information about joining
	socket.on("join", function(data){
		//Add information to user
		users.set(socket.id, {userid: socket.id, roomid: data.roomid, name: data.name});
		//Add information to room
		let roomPlayerIDs = rooms.get(data.roomid).playeridlist || [];
		roomPlayerIDs.push(socket.id);
		let roomPlayerNames = rooms.get(data.roomid).playernamelist || [];
		roomPlayerNames.push(data.name);
		let roomPlayerScores = rooms.get(data.roomid).playerscorelist || [];
		roomPlayerScores.push(0);
		rooms.set(data.roomid, {
			playeridlist: roomPlayerIDs,
			playernamelist: roomPlayerNames,
			playerscorelist: roomPlayerScores,
			turn: rooms.get(data.roomid).turn,
			word: rooms.get(data.roomid).word
		});
		//Send message of new player
		socket.to(data.roomid).emit("userjoin", {name: data.name, userid: socket.id});
		//Add user to room and send information to user
		socket.join(data.roomid);
		socket.emit("roomjoin", {
			playeridlist: roomPlayerIDs,
			playernamelist: roomPlayerNames,
			playerscorelist: roomPlayerScores,
			turn: rooms.get(data.roomid).turn,
			word: rooms.get(data.roomid).word,
			roomid: data.roomid
		});
	});

	//Create a room and send information
	socket.on("create", function(data){
		console.log("Received create request");
		let code = "";
		let alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM";//in QWERTY order to spice things up
		let letters = [];
		do {
			letters = [
				alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
				alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
				alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
				alphabet.charAt(Math.floor(Math.random() * alphabet.length))
			];
			code = letters.join("");
		} while(rooms.has(code));
		console.log("Created room: " + code);
		rooms.set(code, {
			playeridlist: [socket.id],
			playernamelist: [data.name],
			playerscorelist: [0],
			turn: 0,
			word: ""
		});
		socket.emit("roomjoin", {
			playeridlist: [socket.id],
			playernamelist: [data.name],
			playerscorelist: [0],
			turn: 0,
			word: "",
			roomid: code
		});
		socket.join(code);
	});

	//Send information about drawing information
	socket.on("draw", function(data){
		socket.to(data.roomid).broadcast.emit("draw", {
			oldx: data.oldx,
			oldy: data.oldy,
			newx: data.newx,
			newy: data.newy,
			size: data.size,
			color: data.color
		});
	});
	//Send information about filling
	socket.on("fill", function(data){
		socket.to(data.roomid).broadcast.emit("fill", {
			x: data.x,
			y: data.y,
			color: data.color
		});
	});
	//Send information about erasing
	socket.on("erase", function(data){
		socket.to(data.roomid).broadcast.emit("erase", {
			oldx: data.oldx,
			oldy: data.oldy,
			newx: data.newx,
			newy: data.newy,
			size: data.size
		});
	});
	//Send information about canvas reset
	socket.on("reset", function(data){
		socket.to(data.roomid).broadcast.emit("reset");
	});
	//Send information about new chat items
	socket.on("message", function(data){
		socket.to(data.roomid).broadcast.emit("message", {player: data.player, name: data.name, message: data.message});
	});

	// socket.broadcast.emit("your message here", data);
});
