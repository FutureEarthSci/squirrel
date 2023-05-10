const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  //console.log(req);
});

io.on('connection', (socket) => {
    io.to(socket.id).emit("welcome", socket.id);
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});