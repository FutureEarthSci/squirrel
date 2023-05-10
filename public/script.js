const socket = io();

const cm = document.getElementById("myCanvas:");

socket.on("welcome", (id) => {
    console.log(id);
})
