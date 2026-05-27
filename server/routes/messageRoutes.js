const express = require("express");

const Message = require("../models/Message");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const { encryptMessage, decryptMessage } = require("../utils/encryption");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

// SEND IMAGE MESSAGE
router.post(
  "/send-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { receiverId } = req.body;

      const imageUrl = `https://192.168.1.50:5000/uploads/${req.file.filename}`;

      const message = await Message.create({
        sender: req.userId,

        receiver: receiverId,

        image: imageUrl,
      });

      res.json(message);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  },
);

// SEND AUDIO MESSAGE
router.post(
  "/send-audio",
  authMiddleware,
  upload.single("audio"),
  async (req, res) => {
    try {
      const { receiverId } = req.body;

      const audioUrl = `https://192.168.1.50:5000/uploads/${req.file.filename}`;

      const message = await Message.create({
        sender: req.userId,

        receiver: receiverId,

        audio: audioUrl,
      });

      res.json(message);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  },
);

// SEND MESSAGE
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    const message = await Message.create({
      sender: req.userId,
      receiver: receiverId,
      text: encryptMessage(text),
    });

    const decryptedMessage = {

  ...message._doc,

  text,

};

res.status(201).json(
  decryptedMessage
);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// GET RECENT CHATS
router.get("/chats", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email profilePic lastSeen")
      .populate("receiver", "name email profilePic lastSeen");

    const usersMap = new Map();

    messages.forEach((msg) => {
      // SKIP BROKEN DATA
      if (!msg.sender || !msg.receiver) {
        return;
      }

      // SKIP IF _id MISSING
      if (!msg.sender._id || !msg.receiver._id) {
        return;
      }

      const otherUser =
        String(msg.sender._id) === String(req.userId)
          ? msg.receiver
          : msg.sender;

      // EXTRA SAFETY
      if (!otherUser || !otherUser._id) {
        return;
      }

      usersMap.set(otherUser._id.toString(), otherUser);
    });

    res.json(Array.from(usersMap.values()));
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// GET CHAT MESSAGES
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUser = req.userId;

    const otherUser = req.params.userId;

    const messages = await Message.find({
      $or: [
        {
          sender: currentUser,
          receiver: otherUser,
        },
        {
          sender: otherUser,
          receiver: currentUser,
        },
      ],
    }).sort({ createdAt: 1 });

    const decryptedMessages = messages.map((msg) => ({
      ...msg._doc,

      text: msg.text ? decryptMessage(msg.text) : "",
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// MARK MESSAGE AS SEEN
router.put("/seen/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      {
        seen: true,
      },
      {
        new: true,
      },
    );

    res.json(message);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// DELETE CHAT
router.delete("/delete-chat/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUser = req.userId;

    const otherUser = req.params.userId;

    await Message.deleteMany({
      $or: [
        {
          sender: currentUser,
          receiver: otherUser,
        },
        {
          sender: otherUser,
          receiver: currentUser,
        },
      ],
    });

    res.json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;
