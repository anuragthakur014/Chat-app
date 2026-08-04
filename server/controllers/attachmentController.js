const Attachment = require("../models/Attachment");

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { receiverId } = req.body;

    const folder = req.file.destination.split("uploads")[1].replace(/\\/g, "/");

    const fileUrl =
      `${req.protocol}://${req.get("host")}/uploads${folder}/${req.file.filename}`;

    const attachment = await Attachment.create({
      sender: req.userId,
      receiver: receiverId,

      url: fileUrl,

      fileName: req.file.filename,

      originalName: req.file.originalname,

      mimeType: req.file.mimetype,

      size: req.file.size,

      type: req.file.mimetype.split("/")[0],
    });

    res.status(201).json({
      success: true,
      attachment,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Upload failed",
    });

  }
};