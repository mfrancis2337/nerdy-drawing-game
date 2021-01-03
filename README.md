# nerdy-drawing-game
A multiplayer drawing game based on Pictionary that is playable in your browser. Served by a NodeJS web server.

## Why I created the project
This is a project of mine where I learn about NodeJS and how it can be used with websites. In this instance, I have used it to create a multiplayer-drawing game similar to Pictionary (but on a 1 vs all scale) with rooms so more than one game can be going at one time. I have integrated socket.io to communicate between all of the users in a room but not people in another room.

This project is important to me because it gives me many opportunities to learn. One of these opportunities is for me to learn a new library of code that may be useful in the future while also challenging my current programming skills. Another thing is it allows me to learn about Heroku, which is a cloud platform. This allows me to share my creation with the world (or people who know about it, at least). You can find it at https://nerdy-drawing-game.herokuapp.com. Setting up Heroku on your local machine deals with command line, which gave me a chance to learn to use the command console more.

This project started when I was meeting with some friends during the coronavirus pandemic of 2020. At the end of one of our meetings where we were deciding on a good group game that we could all play, I offered skribbl.io as an option (skribbl.io was what this application is inspired by). But due to school restrictions on our devices and the lack of other devices to use, some people were unable to access the website. So I offered to create an application and challenge myself. This is where this idea extended from. Originally, I was going to use PHP instead of NodeJS, but then I learned about how slow PHP is and how bulky some of the code can be on the client-side, learning that NodeJS is a much better option.

**In a nutshell: the whole purpose of this project is to challenge my programming knowledge and provide learning opportunities for me.**

## Get it working on your computer
The project is meant to be running from a web server. If you have a computer connected to the internet, NodeJS allows your computer to run a web server.

To get the project up and running on your local machine, download all of the files to a directory on your computer. Make sure you have node and npm installed along with the dependencies specified in `package.json`. In the command line, navigate to the directory where `app.js` is installed in and run the command `$ node app.js`. The following message should appear: "Listening on port 8080". If the number is different, that is okay. This means it is working.

Now, in your browser, go to localhost:8080 (if the number in the console message is different, replace 8080 with that) and a web page should appear. If trying to connect with an external device, you can connect with the machine's ipv4 address instead of localhost. Now you can run your game. At least 2 people are required to start a game, only 1 to start a room.

To stop the web server, press CTRL+C in the command console (Command+C for Mac users). This is a handy shortcut to know, since it can stop any application running in the commanad console.

## Other information
All code in this repository is created by me unless noted otherwise. This includes all the drawing prompts in /public/scripts/words.js. If you have any issues with the project, create an issue on GitHub and I will look into it whenever I have time.
