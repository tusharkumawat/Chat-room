const path = require("path");

const http = require("http");

const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const { rooms, addRoom, removeRoom } = require("./utils/rooms");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
const ADMIN = "admin";

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options,
    });
    if (error) {
      return callback(error);
    }
    const { errorName, room } = addRoom(user.room);
    if (errorName) {
      console.log(errorName);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage(ADMIN, "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(ADMIN, `${user.username} has joined!`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    io.emit("openRooms", rooms);
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    // const filter = new Filter();

    // if(filter.isProfane(message)){
    //     return callback('Don\'t be naughty!')
    // }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendFile", (fileObject) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "fileMessage",
      generateMessage(user.username, {
        type: fileObject.type,
        body: Buffer.from(fileObject.body, "binary").toString("base64"),
        mimeType: fileObject.mimeType,
        fileName: fileObject.fileName,
      })
    );
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      if (getUsersInRoom(user.room) < 1) {
        removeRoom(user.room);
      }

      io.to(user.room).emit(
        "message",
        generateMessage(ADMIN, `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("getRooms", (callback) => {
    io.emit("openRooms", rooms);
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
