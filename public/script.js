const socket = io();



const userJoin = document.getElementById("userJoin");
const nameInput = document.getElementById("nameInput");
const joinError = document.getElementById("joinError");
const roundInfo = document.getElementById("roundInfo");
const roundNumber = document.getElementById("roundNumber");
const roundPlayers = document.getElementById("roundPlayers");
const readyButton = document.getElementById("readyButton");
const peopleNames = document.getElementById("peopleNames");
const userList = document.getElementById("userList");
const startGameButton = document.getElementById("startGameButton");
const needTwoPlayers = document.getElementById("needTwoPlayers");


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let gameHeight = 768;
let gameWidth = 1024;

//initial visibility
userJoin.style.visibility = "visible";
roundInfo.style.visibility = "hidden";
readyButton.style.visibility = "hidden";
peopleNames.style.visibility = "hidden";
userList.style.visibility = "hidden";
startGameButton.style.visibility = "hidden";
needTwoPlayers.style.visibility = "hidden";
canvas.style.visibility = "hidden";


let playerNum = 0;
let id = "";

function submitName(){
    if (nameInput.value){
        socket.emit("joinAttempt", nameInput.value);
    }
}

socket.on("joinError", (errorType) => {
    joinError.innerHTML = errorType;
})

socket.on("joinSuccess", (socketId, gW, gH) =>{
    canvas.style.width = gW;
    canvas.style.height = gH;
    id = socketId;
    userJoin.style.visibility = "hidden";
    roundInfo.style.visibility = "visible";
    peopleNames.style.visibility = "visible";
    userList.style.visibility = "visible";
    startGameButton.style.visibility = "visible";
    needTwoPlayers.style.visibility = "visible";
    canvas.style.visibility = "visible";
})

socket.on("updateUserList", (players) => {
    while(userList.firstChild){
        userList.firstChild.remove();
    }
    for (const [key, value] of Object.entries(players)){
        var newUser = document.createElement("p");
        var text = document.createTextNode(value);
        newUser.appendChild(text);
        userList.appendChild(newUser);
    }
})

function startGame(){
    socket.emit("startGameAttempt");
}

socket.on("startGameError", () => {
    needTwoPlayers.innerHTML = "need at least two players! (or game already started but you shouldn't be seeing this if that's the case)";
})

socket.on("startGame", () => {
    startGameButton.style.visibility = "hidden";
    needTwoPlayers.style.visibility = "hidden";
})

socket.on("readyCheck", (assignedPlayerNum) => {
    readyButton.style.visibility = "visible";
    playerNum = assignedPlayerNum;
})


function confirmReady(){
    socket.emit("imReady");
    readyButton.style.visibility = "hidden";
}

socket.on("updateRoundInfo", (roundNum, p1, p2) => {
    roundNumber.innerHTML = "round: " + String(roundNum);
    roundPlayers.innerHTML = p1 + " vs " + p2;
})

socket.on("update", (player1, player2) => {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
    ctx.fillStyle = "#000000";
    ctx.fillRect(player1.position[0], player1.position[1], player1.hitbox[0], player1.hitbox[1]);
    ctx.fillRect(player2.position[0], player2.position[1], player2.hitbox[0], player2.hitbox[1]);
})

socket.on("resetPlayerNum", () => {
    playerNum = 0;
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

