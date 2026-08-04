const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const ChatWallpaper = require("../models/ChatWallpaper");

// =========================
// MULTER STORAGE
// =========================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/chat-wallpapers/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

// =========================
// UPLOAD / CHANGE WALLPAPER
// =========================

router.post(
  "/upload",
  authMiddleware,
  upload.single("wallpaper"),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);
      console.log("USER:", req.userId);
      const { receiverId } = req.body;

      if (!receiverId) {
        return res.status(400).json({
          message: "Receiver Id is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Wallpaper image is required",
        });
      }

      // Always store users in sorted order
      const users = [req.userId.toString(), receiverId.toString()].sort();

      const wallpaperUrl = `https://${req.get("host")}/uploads/chat-wallpapers/${req.file.filename}`;

      let wallpaper = await ChatWallpaper.findOne({
  users: {
    $all: users,
    $size: 2,
  },
});

if (wallpaper) {
  wallpaper.wallpaper = wallpaperUrl;
  wallpaper.updatedBy = req.userId;

  await wallpaper.save();
} else {
  wallpaper = await ChatWallpaper.create({
    users,
    wallpaper: wallpaperUrl,
    updatedBy: req.userId,
  });
}

res.json({
  success: true,
  wallpaper,
});

    } catch (error) {
      console.error("Wallpaper Upload Error:");
      console.error(error);

      res.status(500).json({
        message: error.message,
        stack: error.stack,
      });
    }
  },
);

// =========================
// GET WALLPAPER
// =========================

router.get("/:receiverId", authMiddleware, async (req, res) => {
  try {
    const users = [
      req.userId.toString(),
      req.params.receiverId.toString(),
    ].sort();

    const wallpaper = await ChatWallpaper.findOne({
      users: {
        $all: users,
        $size: 2,
      },
    });

    res.json(wallpaper);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =========================
// REMOVE WALLPAPER
// =========================

router.delete("/:receiverId", authMiddleware, async (req, res) => {
  try {
    const users = [
      req.userId.toString(),
      req.params.receiverId.toString(),
    ].sort();

    await ChatWallpaper.findOneAndDelete({
      users: {
        $all: users,
        $size: 2,
      },
    });

    res.json({
      success: true,
      message: "Wallpaper removed",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;
