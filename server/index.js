const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
const PORT = process.env.PORT || 3000;

const drawingLines = [];
const connectedClients = new Set();

io.on("connection", (socket) => {
    connectedClients.add(socket);

    socket.emit("initialize_drawing", drawingLines);

    socket.on("drawing", (data) => {
        drawingLines.push(data);
        socket.broadcast.emit("drawing", data);
    });

    socket.on("disconnect", () => {
        connectedClients.delete(socket);

        if (connectedClients.size === 0) {
            drawingLines.length = 0;
        }
    });
});

// app.use("*", express.static(__dirname + "/dist"));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
