const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  uploadAttachment,
} = require("../controllers/attachmentController");

router.post(
  "/upload",
  authMiddleware,
  upload.single("attachment"),
  uploadAttachment
);

module.exports = router;