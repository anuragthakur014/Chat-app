const express = require("express");

const Message = require("../models/Message");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const { encryptMessage, decryptMessage } = require("../utils/encryption");

const upload = require("../middleware/uploadMiddleware");

// SEND IMAGE MESSAGE
router.post(
  "/send-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { receiverId } = req.body;

      const imageUrl = `https://chat-app-gtzp.onrender.com/uploads/${req.file.filename}`;

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

      const audioUrl = `https://chat-app-gtzp.onrender.com/uploads/${req.file.filename}`;

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


// ============================================
// SEND UNIVERSAL ATTACHMENT
// ============================================

router.post(
  "/send-attachment",
  authMiddleware,
  upload.single("attachment"),
  async (req, res) => {
    try {

      const { receiverId } = req.body;

      if (!req.file) {
        return res.status(400).json({
          message: "No file selected",
        });
      }

      let folder = "documents";

      if (req.file.mimetype.startsWith("image/")) {

        folder = "images";

      } else if (req.file.mimetype.startsWith("video/")) {

        folder = "videos";

      } else if (req.file.mimetype.startsWith("audio/")) {

        folder = "audio";

      }

      const fileUrl =
        `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;

      let attachmentType = "document";

      if (req.file.mimetype.startsWith("image/")) {

        attachmentType = "image";

      } else if (req.file.mimetype.startsWith("video/")) {

        attachmentType = "video";

      } else if (req.file.mimetype.startsWith("audio/")) {

        attachmentType = "audio";

      } else if (req.file.mimetype.includes("pdf")) {

        attachmentType = "pdf";

      } else if (
        req.file.mimetype.includes("word")
      ) {

        attachmentType = "word";

      } else if (
        req.file.mimetype.includes("sheet") ||
        req.file.mimetype.includes("excel")
      ) {

        attachmentType = "excel";

      } else if (
        req.file.mimetype.includes("presentation")
      ) {

        attachmentType = "ppt";

      } else if (
        req.file.mimetype.includes("zip") ||
        req.file.mimetype.includes("rar")
      ) {

        attachmentType = "zip";

      }

      const message = await Message.create({

        sender: req.userId,

        receiver: receiverId,

        attachment: {

          url: fileUrl,

          type: attachmentType,

          mimeType: req.file.mimetype,

          fileName: req.file.filename,

          originalName: req.file.originalname,

          size: req.file.size,

        },

      });

      res.status(201).json(message);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Upload failed",
      });

    }
  }
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
