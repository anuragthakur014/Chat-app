const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["voice", "video"],
      default: "video",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "ringing",
        "answered",
        "rejected",
        "missed",
        "cancelled",
        "ended",
      ],
      default: "ringing",
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    answeredAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Call", callSchema);