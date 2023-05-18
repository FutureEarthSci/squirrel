const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let gameHeight = 512;
let gameWidth = 1024;

let players = {};
let gameStarted = false;
let round = 0;
let id1 = "";
let id2 = "";
let name1 = "";
let name2 = "";
let readysReceived = 0;

let myLoop;


function checkRound(){
    readysReceived = 0;
    if (Object.keys(players).length >= 2){
        //find two players
        let count = 0;
        for (const [key, value] of Object.entries(players)){
            if (count === 0){
                id1 = key;
                name1 = value;
            }
            else if (count === 1){
                id2 = key;
                name2 = value;
            }
            count++;
        }
        //assign player numbers
        io.to(id1).emit("readyCheck", 1);
        io.to(id2).emit("readyCheck", 2);
        
    }
    else {
        console.log("how did we get here... restart server");
    }
}









class Player{
    constructor(position, velocity, playerNum){
        this.position = position;
        this.velocity = velocity;
        this.speed = 6;
        this.grounded = false;
        this.hitbox = [20,30];
        this.left = 0;
        this.right = 0;
        this.up = false;
        this.down = false;

        this.playerNum = playerNum;
    }
    
    move(){
        if (!this.grounded){
            this.velocity[1] += 2; //constant of gravity
        }

        this.velocity[0] = (this.right - this.left) * this.speed;
        
        if (this.grounded && this.up){
            this.velocity[1] -= 30; //constant of jump
        }

        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];

        this.grounded = false;
        if (this.position[1] + this.hitbox[1] >= gameHeight){
            this.position[1] = gameHeight - this.hitbox[1];
            this.grounded = true;
            this.velocity[1] = 0;
        }
    }
}

let player1 = new Player([0,0], [0,0], 1);
let player2 = new Player([200,0], [0,0], 2);


function startRound(){
    round++;
    myLoop = setInterval(update, 20);
    player1.position = [0,0];
    player1.velocity = [0,0];
    player2.position = [200,0];
    player2.velocity = [0,0];
    io.emit("updateRoundInfo", round, name1, name2);
    
}

function endRound(){
    clearInterval(myLoop);
    io.emit("resetPlayerNum");
}


function update(){
    player1.move();
    player2.move();
    io.emit("update", player1, player2);
}


app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  //console.log(req);
});


io.on('connection', (socket) => {
    console.log("socket got on");
    socket.on("joinAttempt", (name) => {
        let nameTaken = false;
        for (const [key, value] of Object.entries(players)){
            if (name === value){
                nameTaken = true;
            }
        }

        if (gameStarted){
            io.to(socket.id).emit("joinError", "game already started");
        }
        else if (nameTaken){
            io.to(socket.id).emit("joinError", "name taken");
        }
        else{
            players[socket.id] = name;
            io.to(socket.id).emit("joinSuccess", socket.id, gameWidth, gameHeight);
            console.log("user joined successfully");
            io.emit("updateUserList", players);
        }
    })

    socket.on("startGameAttempt", () => {

        if (Object.keys(players).length < 2 || gameStarted){
            io.to(socket.id).emit("startGameError");
        }
        else {
            io.emit("startGame");
            gameStarted = true;
            checkRound();
        }
    })

    socket.on("imReady", () => {
        readysReceived++;
        if (readysReceived === 2){
            startRound();
        }
    })
    
    socket.on("updateMove", (playerNum, up_key, left_key, right_key)=>{
        if (playerNum==1){
            player1.left=left_key;
            player1.right=right_key;
            player1.up=up_key;
        }
        else if (playerNum==2){
            player2.left=left_key;
            player2.right=right_key;
            player2.up=up_key;
        }
    })
});
io.on('disconnect', ()=>{
    delete(players[socket.id]);
    io.emit("updateUserList", players);
    console.log("socket left");
})


server.listen(3000, () => {
    console.log('listening on *:3000');
});