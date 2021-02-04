//Created by M. Francis - 2020

"use strict";

const port = process.env.PORT || 8080;

var express = require("express");             //Import express js
var app = express();                          //Express function
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
	 * https://socket.io/docs/v3/emit-cheatsheet/
	 * The many ways of sending messages:
	 *   - Send to sender                             socket.emit();
	 *   - Send to everyone                           io.emit();
	 *   - Send to everyone except sender             socket.broadcast.emit();
	 *   - Send to everyone in room except sender     socket.to(room).emit();
	 *   - Send to everyone in room including sender  io.in(room).emit();
	 */

	//Set a user id
	users.set(socket.id, {userid: socket.id, roomid: "", playername: "Unnamed user"});
	socket.emit("setuserid", socket.id);
	console.log(socket.id + " has joined.");

	//ON USER LEAVING
	socket.on("disconnect", function(){
		//Send leaving information
		let roomid = users.get(socket.id).roomid;
		let pattern = /^[A-Z]{4}$/;
		let regexTester = new RegExp(pattern);
		if(regexTester.test(roomid)){
			//Remove player information from server-side
			let roomPlayerIDs = rooms.get(roomid).playeridlist || [];
			let playerID = roomPlayerIDs.indexOf(socket.id);
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
			console.log(rooms.get(roomid).playernamelist.length);
			if(rooms.get(roomid).playernamelist.length == 0){
				rooms.delete(roomid);
				console.log("Room " + roomid + " was deleted.");
			}
		}

		//Remove user
		users.delete(socket.id);
		console.log(socket.id + " has left.");
		return;
	});

	//LISTEN FOR EVENTS HERE

	//Send information about room availability
	socket.on("checkroom", function(data){
		if(rooms.has(data.roomid)){
			//Room exists
			if(rooms.get(data.roomid).playernamelist.length > 9){
				//Room is full
				socket.emit("checkroomresponse", {available: "no", reason: "room " + data.roomid + " is full"});
			} else if(rooms.get(data.roomid).word > -1){
				//Game is in session
				socket.emit("checkroomresponse", {available: "no", reason: "game is in session"});
			} else {
				//Room is not full, available to join
				socket.emit("checkroomresponse", {available: "yes", roomid: data.roomid});
			}
		} else {
			//Room does not exist
			socket.emit("checkroomresponse", {available: "no", reason: "room " + data.roomid + " does not exist"});
		}
		return;
	});

	//Send information about joining to a room
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
		return;
	});
	//Send information about leaving to a room
	socket.on("leave", function(roomid){
		//Make sure the user is in a room so no errors are produced
		let pattern = /^[A-Z]{4}$/;
		let regexTester = new RegExp(pattern);
		if(regexTester.test(roomid)){
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
			console.log(rooms.get(roomid).playernamelist.length);
			if(rooms.get(roomid).playernamelist.length == 0){
				rooms.delete(roomid);
				console.log("Room " + roomid + " was deleted.");
			}
		} else return;
		//Set user information
		users.set(socket.id, {
			userid: socket.id,
			roomid: "",
			playername: users.get(socket.id).playername
		});
		socket.leave(roomid);
		return;
	});

	//Create a room and send information
	socket.on("create", function(data){
		console.log("Received create request");
		//Create a new code
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
		//Create new room with basic information
		rooms.set(code, {
			playeridlist: [socket.id],
			playernamelist: [data.name],
			playerscorelist: [0],
			turn: 0,
			word: -1
		});
		//Send information to the user
		socket.emit("roomjoin", {
			playeridlist: [socket.id],
			playernamelist: [data.name],
			playerscorelist: [0],
			turn: 0,
			word: 0,
			roomid: code
		});
		//Add user to room
		users.set(socket.id, {userid: socket.id, roomid: data.roomid, name: data.name});
		socket.join(code);
		return;
	});

	//Send information about drawing in a room
	socket.on("draw", function(data){
		socket.to(data.roomid).emit("draw", {
			oldx: data.oldx,
			oldy: data.oldy,
			newx: data.newx,
			newy: data.newy,
			size: data.size,
			color: data.color
		});
		return;
	});
	//Send information about filling in a room
	socket.on("fill", function(data){
		socket.to(data.roomid).emit("fill", {
			x: data.x,
			y: data.y,
			color: data.color
		});
		return;
	});
	//Send information about erasing in a room
	socket.on("erase", function(data){
		socket.to(data.roomid).emit("erase", {
			oldx: data.oldx,
			oldy: data.oldy,
			newx: data.newx,
			newy: data.newy,
			size: data.size
		});
		return;
	});
	//Send information about canvas reset in a room
	socket.on("reset", function(data){
		socket.to(data.roomid).emit("reset");
		return;
	});
	//Send information about new chat items in a room
	socket.on("message", function(data){
		socket.to(data.roomid).emit("message", {
			player: data.player,
			name: data.name,
			message: data.message
		});
		return;
	});

	//Send information about an updated player id
	socket.on("update", function(data){
		//Update user information
		users.set(socket.id, {userid: socket.id, roomid: data.roomid, name: data.name});
		//Update room information
		let roomPlayerIDs = rooms.get(data.roomid).playeridlist || [];
		roomPlayerIDs.splice(data.playerid, 0, socket.id);
		let roomPlayerNames = rooms.get(data.roomid).playernamelist || [];
		roomPlayerNames.splice(data.playerid, 0, data.name);
		let roomPlayerScores = rooms.get(data.roomid).playerscorelist || [];
		roomPlayerScores.splice(data.playerid, 0, data.score);
		rooms.set(data.roomid, {
			playeridlist: roomPlayerIDs,
			playernamelist: roomPlayerNames,
			playerscorelist: roomPlayerScores,
			turn: rooms.get(data.roomid).turn,
			word: rooms.get(data.roomid).word
		});
		//Send information to room
		socket.to(data.roomid).emit("update", {
			name: data.name,
			userid: socket.id,
			playerid: data.playerid,
			score: data.score
		});
	});

	//Send information about the first player to play to a room
	socket.on("startgame", function(data){
		rooms.set(data.roomid, {
			playeridlist: rooms.get(data.roomid).playeridlist,
			playernamelist: rooms.get(data.roomid).playernamelist,
			playerscorelist: rooms.get(data.roomid).playerscorelist,
			turn: data.startplayer,
			word: -1
		});
		io.in(data.roomid).emit("newturn", data.startplayer);
	});
	//Send information about the next player to play to a room
	socket.on("nextturn", function(data){
		rooms.set(data.roomid, {
			playeridlist: rooms.get(data.roomid).playeridlist,
			playernamelist: rooms.get(data.roomid).playernamelist,
			playerscorelist: rooms.get(data.roomid).playerscorelist,
			turn: data.nextplayer,
			word: -1
		});
		io.in(data.roomid).emit("newturn", data.nextplayer);
	});
	//Store the chosen word and send information
	socket.on("chosenword", function(data){
		rooms.set(data.roomid, {
			playeridlist: rooms.get(data.roomid).playeridlist,
			playernamelist: rooms.get(data.roomid).playernamelist,
			playerscorelist: rooms.get(data.roomid).playerscorelist,
			turn: rooms.get(data.roomid).turn,
			word: data.wordNumber
		});
		io.in(data.roomid).emit("chosenword", data.wordNumber);
	});
	//Send information about the game stopping to a room
	socket.on("stopgame", function(data){
		//Update room info
		rooms.set(data.roomid, {
			playeridlist: rooms.get(data.roomid).playeridlist,
			playernamelist: rooms.get(data.roomid).playernamelist,
			playerscorelist: rooms.get(data.roomid).playerscorelist,
			turn: 0,
			word: -1
		});
		//Send messages
		io.in(data.roomid).emit("message", {
			player: 0,
			name: "Server",
			message: "Game was stopped."
		});
		io.in(data.roomid).emit("stopgame", socket.id);
	});
	//Send finish game to all when game is finished
	socket.on("finishgame", function(data){
		rooms.set(data.roomid, {
			playeridlist: rooms.get(data).playeridlist,
			playernamelist: rooms.get(data).playernamelist,
			playerscorelist: rooms.get(data).playerscorelist,
			turn: 0,
			word: -1
		});
		io.in(data).emit("finishgame");
	});
});
