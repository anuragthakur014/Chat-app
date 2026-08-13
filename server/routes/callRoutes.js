const express = require("express");

const Call = require("../models/Call");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CREATE CALL
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      receiverId,
      type = "video",
    } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver Id is required",
      });
    }

    if (!["voice", "video"].includes(type)) {
      return res.status(400).json({
        message: "Invalid call type",
      });
    }

    const call = await Call.create({
      caller: req.userId,
      receiver: receiverId,
      type,
      status: "ringing",
      startedAt: new Date(),
    });

    const populatedCall = await Call.findById(call._id)
      .populate("caller", "name email profilePic")
      .populate("receiver", "name email profilePic");

    res.status(201).json(populatedCall);
  } catch (error) {
    console.error("Create Call Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// ==========================================
// GET CALL HISTORY
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [
        { caller: req.userId },
        { receiver: req.userId },
      ],
    })
      .populate("caller", "name email profilePic")
      .populate("receiver", "name email profilePic")
      .sort({ createdAt: -1 });

    res.json(calls);
  } catch (error) {
    console.error("Get Call History Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// ==========================================
// UPDATE CALL STATUS
// ==========================================

router.put("/:callId", authMiddleware, async (req, res) => {
  try {
    const {
      status,
      duration,
    } = req.body;

    const allowedStatuses = [
      "ringing",
      "answered",
      "rejected",
      "missed",
      "cancelled",
      "ended",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid call status",
      });
    }

    const call = await Call.findById(req.params.callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
      });
    }

    // Only caller or receiver can update the call
    const userId = String(req.userId);

    if (
      String(call.caller) !== userId &&
      String(call.receiver) !== userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (status) {
      call.status = status;
    }

    if (duration !== undefined) {
      call.duration = Number(duration) || 0;
    }

    // When call is answered
    if (
      status === "answered" &&
      !call.answeredAt
    ) {
      call.answeredAt = new Date();
    }

    // When call ends
    if (
      ["ended", "rejected", "missed", "cancelled"].includes(status)
    ) {
      call.endedAt = new Date();
    }

    await call.save();

    const populatedCall = await Call.findById(call._id)
      .populate("caller", "name email profilePic")
      .populate("receiver", "name email profilePic");

    res.json(populatedCall);
  } catch (error) {
    console.error("Update Call Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// ==========================================
// DELETE ONE CALL
// ==========================================

router.delete("/:callId", authMiddleware, async (req, res) => {
  try {
    const call = await Call.findById(req.params.callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
      });
    }

    const userId = String(req.userId);

    if (
      String(call.caller) !== userId &&
      String(call.receiver) !== userId
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await Call.findByIdAndDelete(req.params.callId);

    res.json({
      success: true,
      message: "Call deleted",
    });
  } catch (error) {
    console.error("Delete Call Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;