//Created by M. Francis - 2020

//Set up variables
const colors = [
	"#000000",//Black
	"#7f7f7f",//Gray
	"#c3c3c3",//Light gray
	"#ffffff",//White
	"#880015",//Cranberry red
	"#ed1c24",//Red
	"#ff7f27",//Orange
	"#ffc90e",//Orange yellow
	"#fff200",//Yellow
	"#b5e61d",//Green yellow
	"#22b14c",//Green
	"#99d9ea",//Sky blue
	"#00a2e8",//Light blue
	"#3f48cc",//Blue
	"#7092be",//Periwinkle
	"#c8bfe7",//Light purple
	"#a349a4",//Purple
	"#ffaec9",//Pink
	"#efe4b0",//Very light brown
	"#b97a57",//Light brown
	"#ffff"   //Transparent
];
const canvasWidth = 1920;
const canvasHeight = 1080;

//Set up online functionality
var socket = io.connect();

var hasJoinedRoom = false;
var hasSetName = false;
var roomCodeHidden = false;
var gameStarted = false;

var mode = 0;
var penSize = 10;
var selectedColor = 0;

var round = 0;
var turn = -1; //Set this to -1 to prevent any drawing
var timer;
var countdown = 0;

var roomCode = "----";
var playerID = 0; //0 = not joined; 1-10 = joined
var globalPlayerID = ""; //This gets assigned a random value when joining a game to ensure player differentiation
var playerName = "You";
var playerScore = 0;

var playerNames = [];
var playerGlobalIDs = [];
var playerScores = [];

var mouseIsDown = false;
var mouseX = -1;
var mouseY = -1;
var oldMouseX = -1;
var oldMouseY = -1;

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Functions for tracking mouse movement

/**
 * Decides what to do when the onmousedown event is triggered.
 * @param {Event} e The onmousedown event
 */
function onMouseDown(e, touchscreen){
	e.preventDefault();
	//Get the element information
	let canvasRect = document.querySelector("canvas").getBoundingClientRect();
	//Use the element information to determine where the mouse is on the canvas
	if(touchscreen){
		let event = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		let touch = event.touches[0] || event.changedTouches[0];
		oldMouseX = Math.round(((touch.pageX - canvasRect.left) / canvasRect.width) * canvasWidth);
		oldMouseY = Math.round(((touch.pageY - canvasRect.top) / canvasRect.height) * canvasHeight);
	} else {
		oldMouseX = Math.round(((e.clientX - canvasRect.left) / canvasRect.width) * canvasWidth);
		oldMouseY = Math.round(((e.clientY - canvasRect.top) / canvasRect.height) * canvasHeight);
	}
	//Set mouseIsDown to true to ensure that we can draw
	mouseIsDown = true;
	//Do certain things if necessary
	if(mode == 1){
		//Draw a starting dot so that at least something is put down
		draw(oldMouseX, oldMouseY);
	} else if(mode == 2){
		//Fill an area, once.
		fill(oldMouseX, oldMouseY);
	}
}

/**
 * Decides what to do when the onmouseup event is triggered.
 * @param {Event} e The onmouseup event
 */
function onMouseUp(e){
	e.preventDefault();
	//Set mouseIsDown to false to ensure that things will not be further drawn
	mouseIsDown = false;
}

/**
 * Decides what to do when the onmousemove event is triggered.
 */
function onMouseMove(e, touchscreen){
	if(mouseIsDown){
		let canvasRect = document.querySelector("canvas").getBoundingClientRect();
		if(touchscreen){
			let event = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
			let touch = event.touches[0] || event.changedTouches[0];
			mouseX = Math.round(((touch.pageX - canvasRect.left) / canvasRect.width) * canvasWidth);
			mouseY = Math.round(((touch.pageY - canvasRect.top) / canvasRect.height) * canvasHeight);
		} else {
			mouseX = Math.round(((e.clientX - canvasRect.left) / canvasRect.width) * canvasWidth);
			mouseY = Math.round(((e.clientY - canvasRect.top) / canvasRect.height) * canvasHeight);
		}
		switch(mode){
			//Do nothing
			default:
				break;
			//Draw
			case 1:
				draw(mouseX, mouseY);
				break;
			//Fill only needs (and only should be) called once, so it is not included here
			//Erase
			case 3:
				erase(mouseX, mouseY);
				break;
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Gameplay functions

/**
 * Draws a line from the old mouse position to the new one. Called when the current user is drawing.
 * @param {number} x The new mouse X position
 * @param {number} y The new mouse Y position
 */
function draw(x, y){
	//Make sure it is our turn
	if(turn != 0 && turn != playerID) return;

	//Get context
	let canvas = document.querySelector("canvas").getContext("2d");
	//Set styling
	canvas.lineCap = "round";
	canvas.globalCompositeOperation = "source-over";
	canvas.strokeStyle = colors[selectedColor];
	canvas.lineWidth = penSize;
	//Draw line
	canvas.beginPath();
	canvas.moveTo(oldMouseX, oldMouseY);
	canvas.lineTo(x, y);
	canvas.stroke();
	//Send information
	if(socket && hasJoinedRoom) socket.emit("draw", {roomid: roomCode, oldx: oldMouseX, oldy: oldMouseY, newx: x, newy: y, size: penSize, color: selectedColor});
	//Set old mouse variables
	oldMouseX = x;
	oldMouseY = y;
}

/**
 * A copy of the draw function. Draws a line from one position to the next. Called when another player is drawing.
 * @param {number} xOld The old x-coordinate
 * @param {number} yOld The old y-coordinate
 * @param {number} xNew The new x-coordinate
 * @param {number} yNew The new y-coordinate
 * @param {number} size The selected size
 * @param {number} color The selected color
 */
function drawMultiplayer(xOld, yOld, xNew, yNew, size, color){
	//Get context
	let canvas = document.querySelector("canvas").getContext("2d");
	//Set styling
	canvas.lineCap = "round";
	canvas.globalCompositeOperation = "source-over";
	canvas.strokeStyle = colors[color];
	canvas.lineWidth = size;
	//Draw line
	canvas.beginPath();
	canvas.moveTo(xOld, yOld);
	canvas.lineTo(xNew, yNew);
	canvas.stroke();
}

/**
 * Flood fills an area with a specific color.
 * 
 * That code was adapted from https://ben.akrin.com/canvas_fill/fill_04.html,
 * which was adapted from http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
 * @param {number} xC The x-coordinate to fill in
 * @param {number} yC The y-coordinate to fill in
 */
function fill(xC, yC){
	//Make sure it is our turn
	if(turn != 0 && turn != playerID) return;

	//Get image data from the canvas
	let canvas = document.querySelector("canvas").getContext("2d");
	let pixels = canvas.getImageData(0, 0, canvasWidth, canvasHeight);
	let originalPos = (yC * 4 * canvasWidth) + (xC * 4);
	let originalColor = {
		r: pixels.data[originalPos],
		g: pixels.data[originalPos + 1],
		b: pixels.data[originalPos + 2],
		a: pixels.data[originalPos + 3]
	};

	//Set up queueing variables
	let queue = [{x: xC, y: yC}];

	//Set the color to flood fill
	//This function was adapted from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	function hexToRGBA(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			a: 255
		} : null;
	  }
	let color = hexToRGBA(colors[selectedColor]);

	//Make sure we aren't filling the same color (because this could cause a page crash)
	if(originalColor.r == color.r && originalColor.g == color.g && originalColor.b == color.b && originalColor.a == color.a) return;

	//Fill in the area
	while(queue.length > 0){
		//Get the current pixel and some other information
		let pixel = queue.shift();
		let x = pixel.x;
		let y = pixel.y;
		let currentPos = (y * 4 * canvasWidth) + (x * 4);

		//Look for the top boundary (either the edge or a different color)
		while(y-- >= 0 && (
			pixels.data[currentPos] == originalColor.r &&
			pixels.data[currentPos + 1] == originalColor.g &&
			pixels.data[currentPos + 2] == originalColor.b &&
			pixels.data[currentPos + 3] == originalColor.a
		)){
			currentPos -= canvasWidth * 4;
		}
		currentPos += canvasWidth * 4;
		y++;

		//Fill in vertical space. Also find the left and right boundaries
		let reachedLeft = false;
		let reachedRight = false;
		while(y++ < canvasHeight && (
			pixels.data[currentPos] == originalColor.r &&
			pixels.data[currentPos + 1] == originalColor.g &&
			pixels.data[currentPos + 2] == originalColor.b &&
			pixels.data[currentPos + 3] == originalColor.a
		)){
			//Set the color
			pixels.data[currentPos] = color.r;
			pixels.data[currentPos + 1] = color.g;
			pixels.data[currentPos + 2] = color.b;
			pixels.data[currentPos + 3] = color.a;

			//Find left boundary
			if(x > 0){
				if(pixels.data[currentPos - 4] == originalColor.r &&
					pixels.data[currentPos - 4 + 1] == originalColor.g &&
					pixels.data[currentPos - 4 + 2] == originalColor.b &&
					pixels.data[currentPos - 4 + 3] == originalColor.a
				){
					if(!reachedLeft){
						queue.push({x: x-1, y: y});
						reachedLeft = true;
					}
				} else if(reachedLeft){
					reachedLeft = false;
				}
			}

			//Find right boundary
			if(x < canvasWidth - 1){
				if(pixels.data[currentPos + 4] == originalColor.r &&
					pixels.data[currentPos + 4 + 1] == originalColor.g &&
					pixels.data[currentPos + 4 + 2] == originalColor.b &&
					pixels.data[currentPos + 4 + 3] == originalColor.a
				){
					if(!reachedRight){
						queue.push({x: x+1, y: y});
					}
				} else if(reachedRight){
					reachedRight = false;
				}
			}

			//Shift position
			currentPos += canvasWidth * 4;
		}
	}
	//Put new image on screen
	canvas.putImageData(pixels, 0, 0);
	//Send information
	if(socket && hasJoinedRoom) socket.emit("fill", {roomid: roomCode, x: xC, y: yC, color: selectedColor});
}

/**
 * A copy of the fill function. Fills an area with a color. Called when another player is drawing.
 * @param {number} xC The x-coordinate of the area to fill in
 * @param {number} yC The y-coordinate of the area to fill in
 * @param {number} sColor The selected color
 */
function fillMultiplayer(xC, yC, sColor){
	//Get image data from the canvas
	let canvas = document.querySelector("canvas").getContext("2d");
	let pixels = canvas.getImageData(0, 0, canvasWidth, canvasHeight);
	let originalPos = (yC * 4 * canvasWidth) + (xC * 4);
	let originalColor = {
		r: pixels.data[originalPos],
		g: pixels.data[originalPos + 1],
		b: pixels.data[originalPos + 2],
		a: pixels.data[originalPos + 3]
	};

	//Set up queueing variables
	let queue = [{x: xC, y: yC}];

	//Set the color to flood fill
	//This function was adapted from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	function hexToRGBA(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			a: 255
		} : null;
	  }
	let color = hexToRGBA(colors[sColor]);

	//Fill in the area
	while(queue.length > 0){
		//Get the current pixel and some other information
		let pixel = queue.shift();
		let x = pixel.x;
		let y = pixel.y;
		let currentPos = (y * 4 * canvasWidth) + (x * 4);

		//Look for the top boundary (either the edge or a different color)
		while(y-- >= 0 && (
			pixels.data[currentPos] == originalColor.r &&
			pixels.data[currentPos + 1] == originalColor.g &&
			pixels.data[currentPos + 2] == originalColor.b &&
			pixels.data[currentPos + 3] == originalColor.a
		)){
			currentPos -= canvasWidth * 4;
		}
		currentPos += canvasWidth * 4;
		y++;

		//Fill in vertical space. Also find the left and right boundaries
		let reachedLeft = false;
		let reachedRight = false;
		while(y++ < canvasHeight && (
			pixels.data[currentPos] == originalColor.r &&
			pixels.data[currentPos + 1] == originalColor.g &&
			pixels.data[currentPos + 2] == originalColor.b &&
			pixels.data[currentPos + 3] == originalColor.a
		)){
			//Set the color
			pixels.data[currentPos] = color.r;
			pixels.data[currentPos + 1] = color.g;
			pixels.data[currentPos + 2] = color.b;
			pixels.data[currentPos + 3] = color.a;

			//Find left boundary
			if(x > 0){
				if(pixels.data[currentPos - 4] == originalColor.r &&
					pixels.data[currentPos - 4 + 1] == originalColor.g &&
					pixels.data[currentPos - 4 + 2] == originalColor.b &&
					pixels.data[currentPos - 4 + 3] == originalColor.a
				){
					if(!reachedLeft){
						queue.push({x: x-1, y: y});
						reachedLeft = true;
					}
				} else if(reachedLeft){
					reachedLeft = false;
				}
			}

			//Find right boundary
			if(x < canvasWidth - 1){
				if(pixels.data[currentPos + 4] == originalColor.r &&
					pixels.data[currentPos + 4 + 1] == originalColor.g &&
					pixels.data[currentPos + 4 + 2] == originalColor.b &&
					pixels.data[currentPos + 4 + 3] == originalColor.a
				){
					if(!reachedRight){
						queue.push({x: x+1, y: y});
					}
				} else if(reachedRight){
					reachedRight = false;
				}
			}

			//Shift position
			currentPos += canvasWidth * 4;
		}
	}
	canvas.putImageData(pixels, 0, 0);
}

/**
 * Removes any drawing from an area. Called when the current user is drawing.
 * @param {number} x The new x-coordinate
 * @param {number} y The new y-coordinate
 */
function erase(x, y){
	//Make sure it is our turn
	if(turn != 0 && turn != playerID) return;

	//Get context
	let canvas = document.querySelector("canvas").getContext("2d");
	//Set styling
	canvas.lineCap = "round";
	canvas.globalCompositeOperation = "destination-out";
	canvas.lineWidth = penSize * 2;
	//Draw line
	canvas.beginPath();
	canvas.moveTo(oldMouseX, oldMouseY);
	canvas.lineTo(x, y);
	canvas.stroke();
	//Send information
	if(socket && hasJoinedRoom) socket.emit("erase", {roomid: roomCode, oldx: oldMouseX, oldy: oldMouseY, newx: x, newy: y, size: penSize});
	//Set old mouse variables
	oldMouseX = x;
	oldMouseY = y;
}

/**
 * Copy of the erase function. Removes any drawing from an area. Called when another player is drawing.
 * @param {number} xOld The old x-coordinate of the mouse
 * @param {number} yOld The old y-coordinate of the mouse
 * @param {number} xNew The new x-coordinate of the mouse
 * @param {number} yNew The new y-coordinate of the mouse
 * @param {number} size The current selected pen size of the player drawing
 */
function eraseMultiplayer(xOld, yOld, xNew, yNew, size){
	//Get context
	let canvas = document.querySelector("canvas").getContext("2d");
	//Set styling
	canvas.lineCap = "round";
	canvas.globalCompositeOperation = "destination-out";
	canvas.lineWidth = size * 2;
	//Draw line
	canvas.beginPath();
	canvas.moveTo(xOld, yOld);
	canvas.lineTo(xNew, yNew);
	canvas.stroke();
}

/**
 * Switches the pen color
 * @param {number} color The color to set to
 */
function switchColor(color){
	if(mode != 0){
		if(!selectedColor) selectedColor = 0;
		document.getElementsByClassName("color")[selectedColor].classList.remove("active");
		//Switch color
		selectedColor = color;
		document.getElementsByClassName("color")[color].classList.add("active");
	}
}

/**
 * Switches the current tool and styles the cursor when over the canvas.
 * @param {number} tool The tool to switch to. A value 1-3; 1 = pen, 2 = fill, 3 = eraser.
 */
function switchTool(tool){
	//Can only switch tools when it is the player's turn
	if(turn == playerID || turn == 0){
		//Switch tool
		mode = tool;
		//Add border
		if(document.querySelector(".active.noncolor") && document.querySelector(".active.noncolor") != document.querySelector(".active.size"))
			document.querySelector(".active.noncolor").classList.remove("active");
		document.querySelectorAll(".tool.noncolor")[tool - 1].classList.add("active");
		//Style cursor on canvas element
		let canvasElem = document.querySelector("canvas");
		switch(tool){
			default:
				canvasElem.style.cursor = "default";
				break;
			case 1:
				canvasElem.style.cursor = "crosshair";
				break;
			case 2:
				canvasElem.style.cursor = "pointer";
				break;
			case 3:
				canvasElem.style.cursor = "crosshair";
				break;
		}
	}
}

/**
 * 
 * @param {number} size The size pen to set to
 * @param {number} number The element number in the footer to change to active.
 */
function switchSize(size, number){
	if(turn == playerID || turn == 0){
		//Switch size
		penSize = size;
		//Add border
		if(document.querySelector(".active.size"))
			document.querySelector(".active.size").classList.remove("active");
		document.querySelectorAll(".size")[number].classList.add("active");
	}
}

/**
 * Erases the canvas.
 * @param {boolean} sendMessage Whether or not to send a message. Optional; defaults to true.
 */
function resetCanvas(sendMessage = true){
	let canvas = document.querySelector("canvas").getContext("2d");
	canvas.clearRect(0, 0, canvasWidth, canvasHeight);
	if(socket && hasJoinedRoom && sendMessage) socket.emit("reset", {roomid: roomCode});
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Chat functionality

/**
 * Deals with the text in the chat textbox. Decides whether to join a room, set name, or chat something.
 * @param {Event} e The form submission event (to prevent page reload)
 */
function submitText(e){
	//Prevent page from reloading
	e.preventDefault();
	//Get entry
	let entry = document.getElementById("textbox").value || "";
	//Make sure value is not empty
	if(entry == "") return;
	//Test entry through regex (any of a number of characters but must contain at least one alphanumeric character)
	let pattern = /^(?=.*[A-Za-z0-9])[\w\-\s\(\).,:;'"]*$/;
	let regexTester = new RegExp(pattern);
	if(!regexTester.test(entry)){
		//Item did not make it through, send a warning
		let warningText = document.createElement("p");
		warningText.style.color = "red";
		warningText.innerText = "CANNOT SEND MESSAGE \"" + entry + "\"\nIllegal characters";
		document.getElementById("chatbox").appendChild(warningText);
		//Add error border if not present already
		if(!document.querySelector("form").classList.contains("error"))
			document.querySelector("form").classList.add("error");
		//Stop any further running of scripts in the function
		return;
	} else if(document.querySelector("form").classList.contains("error")){
		//Remove error border
		document.querySelector("form").classList.remove("error");
	}
	//Reset text box
	document.getElementById("textbox").value = "";
	//Do something with the text
	if(!hasSetName){
		//Name must be set first
		setName(entry);
		return;
	}
	if(!hasJoinedRoom){
		//Join room next
		setRoomID(entry.toUpperCase());
		return;
	}
	//Otherwise just chat
	chat(entry);
}

/**
 * Sets the name of the player.
 * @param {string} entry The value from the textbox
 */
function setName(entry){
	//Make sure name is a certain length
	if(entry.length >= 3 && entry.length <= 20){
		//Name is good :)
		//Set variables
		playerName = entry;
		hasSetName = true;
		//Put new prompt in chat
		let message = document.createElement("p");
		message.innerText = "Please enter a room id (or create a room on the left)";
		document.getElementById("chatbox").appendChild(message);
		document.getElementById("joincontrols").style.display = "block";
		//Scroll chat
		document.getElementById("chatbox").scrollIntoView({block: "end"});
	} else {
		//Name is too short or long
		let warningText = document.createElement("p");
		warningText.style.color = "red";
		if(entry.length < 3) warningText.innerText = "Name too short!";
		else warningText.innerText = "Name too long!";
		document.getElementById("chatbox").appendChild(warningText);
		//Add error border if not present already
		if(!document.querySelector("form").classList.contains("error"))
			document.querySelector("form").classList.add("error");
		//Scroll chat
		document.getElementById("chatbox").scrollIntoView({block: "end"});
	}
}

/**
 * Joins a room from a room id.
 * @param {string} entry The value from the textbox
 */
function setRoomID(entry){
	//Make sure code is 4 letters and only uppercase letters
	let pattern = /^[A-Z]{4}$/;
	let regexTester = new RegExp(pattern);
	if(!regexTester.test(entry)){
		//Invalid code, send error message
		let warningText = document.createElement("p");
		warningText.style.color = "red";
		warningText.innerText = "INVALID ROOM CODE";
		document.getElementById("chatbox").appendChild(warningText);
		//Add error border if not present already
		if(!document.querySelector("form").classList.contains("error"))
			document.querySelector("form").classList.add("error");
		//Scroll chat
		warningText.scrollIntoView({block: "end"});
		//Stop any further running of scripts in the function
		return;
	}
	//Check room
	checkRoom(entry);
}

/**
 * Enters something in the chat
 * @param {string} entry The value from the textbox
 */
function chat(entry){
	//Get chat box
	let chatbox = document.getElementById("chatbox");
	//Create chat items
	let chatitem = document.createElement("p");
	let chatname = document.createElement("span");
	//Set stuff up for chat items
	chatname.style.color = "var(--player-" + playerID + ")";
	chatname.innerText = playerName + ": ";
	chatitem.appendChild(chatname);
	chatitem.innerHTML = chatitem.innerHTML + entry;
	//Append chat item
	chatbox.appendChild(chatitem);
	//Scroll chat
	chatitem.scrollIntoView({block: "end"});
	//Send information
	socket.emit("message", {roomid: roomCode, player: playerID, name: playerName, message: entry});
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Socket.io functionality (general)

/**
 * Sets the user ID
 */
socket.on("setuserid", function(id){
	//Check to see if we already have a player id and joined a room
	if(globalPlayerID != "" && roomCode != "----"){
		//We have a player id already and roomCode has been set, we disconnected somehow.
		//Make sure the server knows we are the same person
		socket.emit("update", {
			name: playerName,
			roomid: roomCode,
			playerid: playerID,
			score: playerScore
		});
	}
	//Set new player id
	globalPlayerID = id;
	console.log("User ID: " + id);
	return;
});

/**
 * Joins a room
 */
socket.on("roomjoin", function(data){
	resetCanvas();
	//Retrieve information
	playerNames = data.playernamelist;
	playerGlobalIDs = data.playeridlist;
	playerScores = data.playerscorelist;
	turn = data.turn;
	roomCode = data.roomid;
	
	//Set player ID and check to see if we are host
	playerID = playerGlobalIDs.indexOf(globalPlayerID) + 1;
	document.getElementById("joincontrols").style.display = "none";
	if(playerID == 1) document.getElementById("hostcontrols").style.display = "block";
	document.getElementById("playercontrols").style.display = "block";

	//Update page information
	hasJoinedRoom = true;//In case the room was created
	document.getElementById("chatbox").innerHTML = "";
	if(!roomCodeHidden) document.getElementById("roomcode").innerText = roomCode;
	document.getElementById("players").innerText = playerNames.length;
	for(let i = 1; i <= playerNames.length; i++){
		document.querySelectorAll(".playercolor")[i - 1].classList.add("active");
		document.getElementById("p" + i + "n").innerText = playerNames[i - 1];
		document.getElementById("p" + i + "s").innerText = playerScores[i - 1];
	}
	return;
});

/**
 * Adds a new user
 */
socket.on("userjoin", function(data){
	//Retrieve data
	console.log(data.name + " joined the game");
	playerNames.push(data.name);
	playerGlobalIDs.push(data.userid);
	playerScores.push(0);

	//Change player list
	document.getElementById("players").innerText = playerNames.length;
	for(let i = 0; i < 10; i++)
		document.querySelectorAll(".playercolor")[i].classList.remove("active");
	for(let j = 1; j <= playerNames.length; j++){
		document.querySelectorAll(".playercolor")[j - 1].classList.add("active");
		document.getElementById("p" + j + "n").innerText = playerNames[j - 1];
		document.getElementById("p" + j + "s").innerText = playerScores[j - 1];
	}
});
/**
 * Removes an existing user
 */
socket.on("userleave", function(data){
	if(typeof data != "string") return;
	//Remove data
	let removePlayer = playerGlobalIDs.indexOf(data);
	console.log(playerNames[removePlayer] + " left the game");
	playerNames.splice(removePlayer, 1);
	playerGlobalIDs.splice(removePlayer, 1);
	playerScores.splice(removePlayer, 1);

	//Update player ID and check to see if we are host
	playerID = playerGlobalIDs.indexOf(globalPlayerID) + 1;
	document.getElementById("joincontrols").style.display = "none";
	if(playerID == 1) document.getElementById("hostcontrols").style.display = "block";

	//Change player list
	document.getElementById("players").innerText = playerNames.length;
	for(let i = 0; i < 10; i++)
		document.querySelectorAll(".playercolor")[i].classList.remove("active");
	for(let j = 1; j <= playerNames.length; j++){
		document.querySelectorAll(".playercolor")[j - 1].classList.add("active");
		document.getElementById("p" + j + "n").innerText = playerNames[j - 1];
		document.getElementById("p" + j + "s").innerText = playerScores[j - 1];
	}

	//See if a game needs to be stopped
	if(playerGlobalIDs.length < 2){
		stopGame();
	}
});

/**
 * Leaves a room if the player is in one.
 */
function leaveRoom(){
	//Make sure we are in a room
	let pattern = /^[A-Z]{4}$/;
	let regexTester = new RegExp(pattern);
	if(!regexTester.test(roomCode)){
		//Invalid code, send error message
		console.warn("You cannot leave a room if you aren't in one!");
		//Stop any further running of scripts in the function
		return;
	}
	//Send leave request
	socket.emit("leave", roomCode);
	//Reset variables
	playerNames = [];
	playerGlobalIDs = [];
	playerScores = [];
	roomCode = "----";
	hasJoinedRoom = false;
	playerID = 0;
	resetCanvas();
	//Clear chat and player lists
	document.getElementById("chatbox").innerHTML = "";
	if(!roomCodeHidden) document.getElementById("roomcode").innerText = roomCode;
	document.getElementById("players").innerText = 0;
	for(let i = 0; i < 10; i++){
		document.getElementsByClassName("playercolor")[i].classList.remove("active");
		document.getElementById("p" + (i + 1) + "n").innerText = "";
		document.getElementById("p" + (i + 1) + "s").innerText = "";
	}
	document.getElementById("hostcontrols").style.display = "none";
	document.getElementById("playercontrols").style.display = "none";
	//Put room code prompt in chat
	let message = document.createElement("p");
	message.innerText = "Please enter a room id (or create a room on the left)";
	document.getElementById("chatbox").appendChild(message);
	document.getElementById("joincontrols").style.display = "block";
	return;
}

var wait;
/**
 * Checks to see if a room is available to join
 * @param {string} code The room code to test
 */
function checkRoom(code){
	//Get chat box
	let chatbox = document.getElementById("chatbox");
	let intro = document.createElement("p");
	intro.innerText = "Attempting to connect to room...";
	chatbox.appendChild(intro);
	//Send request
	socket.emit("checkroom", {roomid: code});
	//Timer for timing out (this will be turned off on its own)
	wait = setTimeout(() => {
		//Put error message
		console.warn("The server didn't respond. Either you are offline, the server is offline, or the server is busy.");
		let reason = document.createElement("p");
		reason.innerText = "Could not join room: server didn't respond";
		chatbox.appendChild(reason);
		//Scroll chat
		reason.scrollIntoView({block: "end"});
		return;
	}, 10000);
	
}
/**
 * Determines whether a room can be joined or not
 */
socket.on("checkroomresponse", function(data){
	try {
		//Prevent too long error message
		clearTimeout(wait);
	} catch {
		//If the timeout isn't there, then this shouldn't have been called
		console.warn("The checkroomresponse event listener was called and it shouldn't have been called...");
		return;
	}
	if(data.available == "yes"){
		//Put success message
		let success = document.createElement("p");
		success.innerText = "Joining room " + data.roomid;
		chatbox.appendChild(success);
		hasJoinedRoom = true;
		socket.emit("join", {name: playerName, roomid: data.roomid});
		//Scroll chat
		success.scrollIntoView({block: "end"});
		return;
	} else {
		//Put error message
		let reason = document.createElement("p");
		reason.innerText = "Could not join room: " + data.reason;
		chatbox.appendChild(reason);
		//Scroll chat
		reason.scrollIntoView({block: "end"});
		//Leave room if we are in one
		if(roomCode != "----") leaveRoom();
		return;
	}
});

/**
 * Sends a request to the server to create a server.
 */
function createRoom(){
	//Create room
	if(!hasJoinedRoom) socket.emit("create", {name: playerName});
	else console.warn("You cannot create a room while you are in one!");
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Socket.io functionality (host)

/**
 * Decides whether to start or stop the game
 * @param {Element} elem The button element being pressed
 */
function toggleGame(elem, broadcast){
	if(!elem) return;
	if(gameStarted){
		if(broadcast) stopGame();
		elem.value = "Start Game";
	} else {
		if(broadcast) startGame();
		elem.value = "Stop Game";
	}
}

/**
 * Sends a message to start the game
 */
function startGame(){
	//Make sure we are the host, there are enough players, and that a game isn't already started
	if(playerID == 1 && playerGlobalIDs.length > 1 && !gameStarted){
		gameStarted = !gameStarted;
		socket.emit("startgame", {
			roomid: roomCode,
			startplayer: playerGlobalIDs.length
		});
	}
	return;
}

/**
 * Sends a message to stop the game
 */
function stopGame(){
	//Make sure we are the host and a game is in session
	if(playerID == 1 && gameStarted){
		gameStarted = !gameStarted;
		socket.emit("stopgame", {
			roomid: roomCode
		});
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Socket.io functionality (game)

/**
 * Prepares for the next turn in the game
 */
socket.on("newturn", function(data){
	console.log("New turn!");
	console.log(data);
	turn = data;
	//Do some things
	clearInterval(timer);
	countdown = 30;
	timer = setInterval(() => {
		countdown--;
		document.getElementById("timer").innerText = countdown;
		if(countdown == 0){
			document.getElementById("bluroverlay").style.display = "none";
			console.log("timer is over :(");
			clearInterval(timer);
			if(playerID == 1){
				console.log("I am the host");
				if(turn == 1) socket.emit("finishgame", roomCode);
				else socket.emit("nextturn", {
					roomid: roomCode,
					nextplayer: turn - 1
				});
			}
		}
	}, 1000);
	document.getElementById("word").innerText = "???";
	document.getElementById("bluroverlay").style.display = "flex";
	document.getElementById("nonchoosecontainer").style.display = "none";
	document.getElementById("choosecontainer").style.display = "none";
	document.getElementById("wincontainer").style.display = "none";
	//Determine if it's the user's turn
	if(playerID == data){
		//It is the user's turn
		document.getElementById("choosecontainer").style.display = "block";
		let button1 = document.getElementById("val1");
		let button2 = document.getElementById("val2");
		let button3 = document.getElementById("val3");
		let randNums = [
			Math.floor(Math.random() * words.length),
			Math.floor(Math.random() * words.length),
			Math.floor(Math.random() * words.length)
		];
		button1.value = words[randNums[0]];
		button1.setAttribute("onclick", "chooseWord(" + randNums[0] + ");");
		button2.value = words[randNums[1]];
		button2.setAttribute("onclick", "chooseWord(" + randNums[1] + ");");
		button3.value = words[randNums[2]];
		button3.setAttribute("onclick", "chooseWord(" + randNums[2] + ");");
	} else {
		//It is not the user's turn
		document.getElementById("nonchoosecontainer").style.display = "block";
		document.getElementById("choosename").innerText = (data > 0) ? playerNames[data] : "User";
		mode = 0;
	}
});
/**
 * Sends a message about which word
 * @param {number} index The index of the word in the words array
 */
function chooseWord(index){
	console.log(index + ": " + words[index]);
	console.log(turn + "," + playerID);
	if(turn == playerID){
		socket.emit("chosenword", {
			roomid: roomCode,
			word: words[index],
			wordNumber: index
		});
	}
}
/**
 * Prepares for the guessing portion of a turn
 */
socket.on("chosenword", function(data){
	console.log("Word id:" + data);
	//Hide blur overlay
	resetCanvas(false);
	document.getElementById("bluroverlay").style.display = "none";
	//Set timer
	clearInterval(timer);
	countdown = 45;
	timer = setInterval(() => {
		countdown--;
		document.getElementById("timer").innerText = countdown;
		if(countdown == 0){
			clearInterval(timer);
			if(playerID == 1){
				if(turn == 1) socket.emit("finishgame", roomCode);
				else socket.emit("nextturn", {
					roomid: roomCode,
					nextplayer: turn - 1
				});
			}
		}
	}, 1000);
	if(turn == playerID){
		//Put word up on top
		document.getElementById("word").innerText = words[data];
	} else {
		//Set word with underscores
		let underscores = "";
		for(let i = 0; i < words[data].length; i++){
			if(words[data].charAt(i).match(/[A-Za-z]/)) underscores += "_";
			else underscores += words[data].charAt(i);
		}
		document.getElementById("word").innerText = underscores;
	}
	return;
});

/**
 * On receiving a message to stop the game
 */
socket.on("stopgame", function(data){
	//Make sure that it is the host that is stopping the game
	if(playerGlobalIDs.indexOf(data) != 0){
		return;
	}
	//Reset stuff
	resetCanvas(false);
	clearInterval(timer);
	countdown = 0;
	turn = 0;
	document.getElementById("timer").innerText = "--";
	document.getElementById("word").innerText = "???";
	console.log("Game was stopped");
	return;
});

/**
 * On receiving that the game is finished
 */
socket.on("finishgame", function(){
	//Reset stuff
	turn = 0;
	document.getElementById("timer").innerText = "--";
	document.getElementById("word").innerText = "???";
	//Show the end screen
	document.getElementById("bluroverlay").style.display = "flex";
	document.getElementById("nonchoosecontainer").style.display = "none";
	document.getElementById("choosecontainer").style.display = "none";
	document.getElementById("wincontainer").style.display = "block";
	setTimeout(() => {
		//Hide endscreen after 10 seconds.
		//This won't happen if another round has happened.
		if(document.getElementById("bluroverlay").style.display == "flex" && turn == 0){
			document.getElementById("bluroverlay").style.display = "none";
			document.getElementById("wincontainer").style.display = "none";
		}
	}, 10000);
});

/**
 * Events that correlate to a change on the page
 * (i.e. drawing, filling, erasing, resetting, or new chat message)
 */
socket.on("draw", function(data){drawMultiplayer(data.oldx, data.oldy, data.newx, data.newy, data.size, data.color)});
socket.on("fill", function(data){fillMultiplayer(data.x, data.y, data.color)});
socket.on("erase", function(data){eraseMultiplayer(data.oldx, data.oldy, data.newx, data.newy, data.size)});
socket.on("reset", function(){resetCanvas(false)});//put in a function to stop undefined error when starting a game
socket.on("message", function(data){
	//Get chat box
	let chatbox = document.getElementById("chatbox");
	//Create chat items
	let chatitem = document.createElement("p");
	let chatname = document.createElement("span");
	//Set stuff up for chat items
	chatname.style.color = "var(--player-" + data.player + ")";
	chatname.innerText = data.name + ": ";
	chatitem.appendChild(chatname);
	chatitem.innerHTML = chatitem.innerHTML + data.message;
	//Append chat item
	chatbox.appendChild(chatitem);
	//Scroll chat
	chatitem.scrollIntoView({block: "end"});
});

/**
 * Update player data of a player who reconnected
 */
socket.on("update", function(data){
	if(playerNames[data.playerid] == data.name){
		//The room did not receive a disconnect, just update player id
		console.log(data.name + " reconnected");
		playerGlobalIDs[data.playerid] == data.userid;
	} else {
		//The player was disconnected completely, re-add their items
		console.log(data.name + " rejoined");
		playerNames.splice(data.playerid - 1, 0, data.name);
		playerGlobalIDs.splice(data.playerid - 1, 0, data.userid);
		playerScores.splice(data.playerid - 1, 0, data.score);
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Other misc functionality

/**
 * Toggles the left sidebar
 */
function toggleLeftSidebar(){
	//Get element
	let leftSidebar = document.querySelector("aside");
	//Toggle styles
	if(leftSidebar.style.marginLeft == "-200px"){
		leftSidebar.style.marginLeft = "0px";
	} else {
		leftSidebar.style.marginLeft = "-200px";
	}
}
/**
 * Toggles the right sidebar
 */
function toggleRightSidebar(){
	//Get element
	let rightSidebar = document.querySelector("main");
	//Toggle styles
	if(rightSidebar.style.marginRight == "-200px"){
		rightSidebar.style.marginRight = "0px";
	} else {
		rightSidebar.style.marginRight = "-200px";
	}
}
/**
 * Toggles if the room code is hidden
 */
function toggleRoomCode(){
	//Get element
	let roomCodeElem = document.getElementById("roomcode");
	//Toggle hiddenness (I guess)
	roomCodeHidden = !roomCodeHidden;
	if(roomCodeHidden) roomCodeElem.innerText = "????";
	else roomCodeElem.innerText = roomCode;
}

/**
 * 
 */
function downloadCanvas(){
	let d = new Date();
	let dataURL = document.querySelector("canvas").toDataURL("image/png");
	let saveName = playerNames[turn - 1] + "-" + d.getMilliseconds() + ".png";

	let elem = document.createElement("a");
	elem.setAttribute("href", dataURL);
	elem.setAttribute("download", saveName);
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
	return;
}

/**
 * A function created for testing random word generation.
 * This is not used anywhere.
 */
function generateRandomWords(i = 3){
	let selectedWords = [];
	for(let j = 0; j < i; j++){
		selectedWords.push(words[Math.floor(Math.random() * words.length)]);
	}
	return selectedWords;
}