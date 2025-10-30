const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false,
    },
    messages: {
      type: [mongoose.Schema.Types.Mixed], // flexible message objects
      default: [],
    },
    timestamp: {
      type: String, // e.g., "2025-10-27 10:35:00"
      required: true,
      index: true, // for fast sorting/filtering
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast lookup of recent conversations
chatSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Chat", chatSchema);
