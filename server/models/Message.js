const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    // ===========================
    // UNIVERSAL ATTACHMENT
    // ===========================

    attachment: {
      url: {
        type: String,
        default: "",
      },

      type: {
        type: String,
        default: "",
      },

      mimeType: {
        type: String,
        default: "",
      },

      fileName: {
        type: String,
        default: "",
      },

      originalName: {
        type: String,
        default: "",
      },

      size: {
        type: Number,
        default: 0,
      },
    },

    // ===========================
    // OLD SUPPORT
    // (Don't remove yet)
    // ===========================

    image: {
      type: String,
      default: "",
    },

    audio: {
      type: String,
      default: "",
    },

    // ===========================

    seen: {
      type: Boolean,
      default: false,
    },

    delivered: {
      type: Boolean,
      default: false,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);