const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const gameWidth = 1024;
const gameHeight = 768;

let joined = 0;


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

const loop = setInterval(update, 20);

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
    io.to(socket.id).emit("welcome", socket.id, gameWidth, gameHeight);
    joined+=1;

    if (joined==1){
        io.to(socket.id).emit("assignPlayerNum", 1);
    }
    else if (joined==2){
        io.to(socket.id).emit("assignPlayerNum", 2);
    }
    else {
        io.to(socket.id).emit("assignedPlayerNum", 0);
    }
    
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


server.listen(3000, () => {
    console.log('listening on *:3000');
});