const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    let folder = "others";

    const mime = file.mimetype;

    if (mime.startsWith("image/")) {

      folder = "images";

    } else if (mime.startsWith("video/")) {

      folder = "videos";

    } else if (mime.startsWith("audio/")) {

      folder = "audio";

    } else {

      folder = "documents";

    }

    const uploadPath = path.join(
      __dirname,
      "..",
      "uploads",
      folder
    );

    fs.mkdirSync(uploadPath, {
      recursive: true,
    });

    cb(null, uploadPath);

  },

  filename: (req, file, cb) => {

    const fileName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000) +
      path.extname(file.originalname);

    cb(null, fileName);

  },

});

module.exports = multer({
  storage,
});