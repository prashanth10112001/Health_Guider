const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recommendation: {
      type: mongoose.Schema.Types.Mixed, // e.g., AC_MODE, temp, fan speed, etc.
      required: true,
    },

    conditions: {
      type: mongoose.Schema.Types.Mixed, // e.g., temperature, humidity, CO2, PM2.5, VOC, health info
      default: {},
    },

    recheckAt: {
      type: Number, // minutes until next recommended check
      default: 5,
    },

    recommendedAt: {
      type: String, // store as "YYYY-MM-DD HH:mm:ss"
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fast retrieval
recommendationSchema.index({ recommendedAt: -1 });
recommendationSchema.index({ roomId: 1, userId: 1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);
