//Created by M. Francis - 2020

//Put warnings out on console
// console.log("%cHOLD ON A MOMENT!", "color: #ff7f7f; font-size: xx-large;");
// console.log("%cBefore you go mucking about here, please remember to NEVER PASTE THINGS INTO THE CONSOLE if you don't know what you're doing! This includes if someone else told you to. You could be leaking personal information about yourself to attackers for all you know!", "color: white;");

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

var mode = 0;
var penSize = 10;
var selectedColor = 0;

var turn = -1; //Set this to -1 to prevent any drawing
var roomCode = "----";
var playerID = 0; //0 = not joined; 1-10 = joined
var globalPlayerID = -1; //This gets assigned a random value when joining a game to ensure player differentiation
var playerName = "You";
var word = "";

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
function onMouseDown(e){
	e.preventDefault();
	//Get the element information
	let canvasRect = document.querySelector("canvas").getBoundingClientRect();
	//Use the element information to determine where the mouse is on the canvas
	oldMouseX = Math.round(((e.clientX - canvasRect.left) / canvasRect.width) * canvasWidth);
	oldMouseY = Math.round(((e.clientY - canvasRect.top) / canvasRect.height) * canvasHeight);
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
	//
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
	socket.emit("draw", {roomid: roomCode, oldx: oldMouseX, oldy: oldMouseY, newx: x, newy: y, size: penSize, color: selectedColor});
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
	socket.emit("fill", {roomid: roomCode, x: xC, y: yC, color: selectedColor});
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
	socket.emit("erase", {roomid: roomCode, oldx: oldMouseX, oldy: oldMouseY, newx: x, newy: y, size: penSize});
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
		if(selectedColor != colors.length)
			document.getElementsByClassName("tool")[selectedColor].classList.remove("active");
		//Switch color
		selectedColor = color;
		document.getElementsByClassName("tool")[color].classList.add("active");
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
	if(turn == playerID){
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
 */
function resetCanvas(){
	if(turn == 0 || turn == playerID){
		let canvas = document.querySelector("canvas").getContext("2d");
		canvas.clearRect(0, 0, canvasWidth, canvasHeight);
		socket.emit("reset", {roomid: roomCode});
	}
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
	//Test entry through regex
	let pattern = /^[\w\-\s\(\).,:;'"]*$/;
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
		document.getElementById("chatbox").scrollIntoView(false);
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
		document.getElementById("chatbox").scrollIntoView(false);
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
		warningText.scrollIntoView(false);
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
	chatitem.scrollIntoView(false);
	//Send information
	socket.emit("message", {roomid: roomCode, player: playerID, name: playerName, message: entry});
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

//Socket.io functionality

/**
 * Sets the user ID
 */
socket.on("setuserid", function(id){
	globalPlayerID = id;
	console.log("User ID: " + id);
	return;
});

/**
 * Joins a room
 */
socket.on("roomjoin", function(data){
	//Retrieve information
	playerNames = data.playernamelist;
	playerGlobalIDs = data.playeridlist;
	playerScores = data.playerscorelist;
	turn = data.turn;
	word = data.word;
	roomCode = data.roomid;
	
	//Set player ID and check to see if we are host
	playerID = playerGlobalIDs.indexOf(globalPlayerID) + 1;
	document.getElementById("joincontrols").style.display = "none";
	if(playerID == 1) document.getElementById("hostcontrols").style.display = "block";

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
	//Remove data
	console.log(data);
	let removePlayer = playerGlobalIDs.indexOf(data);
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
});

/**
 * Events that correlate to a change on the page
 * (i.e. drawing, filling, erasing, resetting, or new chat message)
 */
socket.on("draw", function(data){drawMultiplayer(data.oldx, data.oldy, data.newx, data.newy, data.size, data.color)});
socket.on("fill", function(data){fillMultiplayer(data.x, data.y, data.color)});
socket.on("erase", function(data){eraseMultiplayer(data.oldx, data.oldy, data.newx, data.newy, data.size)});
socket.on("reset", resetCanvas());
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
	chatitem.scrollIntoView(false);
});

// socket.on("newturn", function(data){});

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
		reason.scrollIntoView(false);
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
		success.scrollIntoView(false);
		return;
	} else {
		//Put error message
		let reason = document.createElement("p");
		reason.innerText = "Could not join room: " + data.reason;
		chatbox.appendChild(reason);
		//Scroll chat
		reason.scrollIntoView(false);
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