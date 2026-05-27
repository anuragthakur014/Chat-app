require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const http = require("http");

const { Server } = require("socket.io");

const { ExpressPeerServer } = require("peer");

const authRoutes = require("./routes/authRoutes");

const messageRoutes = require("./routes/messageRoutes");

const app = express();

// ==========================
// HTTP SERVER
// ==========================

const server = http.createServer(app);

// ==========================
// PEER SERVER
// ==========================

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

// ==========================
// SOCKET.IO
// ==========================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ==========================
// ONLINE USERS
// ==========================

const onlineUsers = {};

// ==========================
// SOCKET CONNECTION
// ==========================

io.on("connection", (socket) => {
  console.log("SOCKET CONNECTED:", socket.id);

  // ==========================
  // USER JOIN
  // ==========================

  socket.on("join", (userId) => {
    console.log("USER JOINED:", userId);

    onlineUsers[String(userId)] = {
      socketId: socket.id,
    };

    io.emit("onlineUsers", Object.keys(onlineUsers));

    console.log("ONLINE USERS:", onlineUsers);
  });

  // ==========================
  // SEND MESSAGE
  // ==========================

  socket.on("sendMessage", (data) => {
    const { receiverId, message } = data;

    const receiverSocketId =
      onlineUsers[String(receiverId)]?.socketId;

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "receiveMessage",
        message
      );

      message.delivered = true;
    }
  });

  // ==========================
  // TYPING
  // ==========================

  socket.on("typing", (data) => {
    const receiverSocketId =
      onlineUsers[String(data.receiverId)]?.socketId;

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        senderId: data.senderId,
      });
    }
  });

  // ==========================
  // STOP TYPING
  // ==========================

  socket.on("stopTyping", (data) => {
    const receiverSocketId =
      onlineUsers[String(data.receiverId)]?.socketId;

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        senderId: data.senderId,
      });
    }
  });

  // ==========================
  // MESSAGE SEEN
  // ==========================

  socket.on("messageSeen", (data) => {
    const senderSocketId =
      onlineUsers[String(data.senderId)]?.socketId;

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", {
        messageId: data.messageId,
      });
    }
  });

  // ==========================
  // VIDEO CALL
  // ==========================

  socket.on("callUser", (data) => {
    console.log("CALL USER:", data);

    const userSocketId =
      onlineUsers[String(data.userToCall)]?.socketId;

    console.log("TARGET SOCKET:", userSocketId);

    if (userSocketId) {
      io.to(userSocketId).emit("incomingCall", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });

      console.log("CALL SENT");
    } else {
      console.log("USER NOT ONLINE");
    }
  });

  // ==========================
  // ANSWER CALL
  // ==========================

  socket.on("answerCall", (data) => {
    console.log("ANSWER CALL:", data);

    const callerSocketId =
      onlineUsers[String(data.to)]?.socketId;

    console.log("CALLER SOCKET:", callerSocketId);

    if (callerSocketId) {
      io.to(callerSocketId).emit(
        "callAccepted",
        data.signal
      );

      console.log("ANSWER SENT");
    }
  });

  // ==========================
  // REJECT CALL
  // ==========================

  socket.on("rejectCall", (data) => {
    const callerSocketId =
      onlineUsers[String(data.to)]?.socketId;

    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  // ==========================
  // END CALL
  // ==========================

  socket.on("endCall", (data) => {
    const userSocketId =
      onlineUsers[String(data.to)]?.socketId;

    if (userSocketId) {
      io.to(userSocketId).emit("callEnded");
    }
  });

  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", async () => {
    console.log("USER DISCONNECTED:", socket.id);

    for (const userId in onlineUsers) {
      if (
        onlineUsers[userId]?.socketId === socket.id
      ) {
        delete onlineUsers[userId];

        await mongoose
          .model("User")
          .findByIdAndUpdate(userId, {
            lastSeen: new Date(),
          });
      }
    }

    io.emit(
      "onlineUsers",
      Object.keys(onlineUsers)
    );
  });
});

// ==========================
// MIDDLEWARE
// ==========================

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());

// ==========================
// STATIC FILES
// ==========================

app.use("/uploads", express.static("uploads"));

// ==========================
// DATABASE
// ==========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log(err);
  });

// ==========================
// ROUTES
// ==========================

app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);

// ==========================
// TEST ROUTE
// ==========================

app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

// ==========================
// SERVER
// ==========================

const PORT = process.env.PORT || 5000;

server.listen(process.env.PORT || 5000, () => {

  console.log(
    `Server running on port ${process.env.PORT || 5000}`
  );

});