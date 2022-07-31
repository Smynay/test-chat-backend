const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const { roomId } = socket.handshake.query;
  socket.roomId = roomId;
  socket.join(roomId);

  socket.emit("core:connected");

  socket.on("core:connected-data", (payload) => {
    io.in(socket.roomId).emit("chat-user:connected", {
      socketId: socket.id,
      senderId: payload.id,
      senderName: payload.name,
    });
    console.log("a user send connect-data", payload.name);
  });

  socket.on("message:send", (payload) => {
    io.in(socket.roomId).emit("message:receive", payload);
    console.log("a user send message", payload.text);
  });

  socket.on("disconnect", () => {
    io.in(socket.roomId).emit("chat-user:disconnected", {
      socketId: socket.id,
    });
    socket.leave(roomId);

    console.log("a user disconnected", socket.id);
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
