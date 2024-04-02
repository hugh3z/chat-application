const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

// We use a set to store users; sets are for unique values of any type
const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  // When a new user joins
  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    // Emit to all clients that a new user has joined
    io.emit("user joined", { user: data, activeUsers: [...activeUsers] });
  });

  // When a user disconnects
  socket.on("disconnect", function () {
    activeUsers.delete(socket.userId);
    // Emit to all clients that a user has disconnected
    io.emit("user disconnected", { user: socket.userId, activeUsers: [...activeUsers] });
  });

  // When a user is typing
  socket.on("typing", function (data) {
    // Emit to all clients except the sender that a user is typing
    socket.broadcast.emit("user typing", { user: data });
  });

  // When a user sends a chat message
  socket.on("chat message", function (data) {
    // Emit the chat message to all clients
    io.emit("chat message", data);
  });
});
