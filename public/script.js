const socket = io();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let gameWidth;
let gameHeight;

let playerNum=0;


socket.on("welcome", (id, gWidth, gHeight) => {
    console.log(id);
    gameWidth = gWidth;
    gameHeight = gHeight;
})

socket.on("update", (player1, player2) => {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
    ctx.fillStyle = "#000000";
    ctx.fillRect(player1.position[0], player1.position[1], player1.hitbox[0], player1.hitbox[1]);
    ctx.fillRect(player2.position[0], player2.position[1], player2.hitbox[0], player2.hitbox[1]);
})

socket.on("assignPlayerNum", (num)=>{
    playerNum=num;
    console.log(playerNum);
})

let left_key = 0;
let right_key = 0;
let up_key = false;

window.addEventListener('keydown', function (e) {

    if(e.key === "w" || e.key === "W" || e.code === "Space"){
        up_key = true;
    }
    else if (e.key === "a" || e.key === "A"){
        left_key = 1;
    }
    else if (e.key === "d" || e.key === "D"){
        right_key = 1;
    }

    socket.emit("updateMove", playerNum, up_key, left_key, right_key);


});
window.addEventListener('keyup', function (e) {

    if(e.key === "w" || e.code === "Space" || e.key === "W"){
        up_key = false;
    }
    else if (e.key === "a" || e.key === "A"){
        left_key = 0;
    }
    else if (e.key === "d" || e.key === "D"){
        right_key = 0;
    }
    socket.emit("updateMove", playerNum, up_key, left_key, right_key);

});

