const mongoose = require("mongoose");

const outdoorDataSchema = new mongoose.Schema(
  {
    timestamp: {
      type: String, // e.g., "2025-01-27 10:30:00"
      required: true,
      index: true, // ✅ Basic index
    },

    activityData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    metaData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Compound index for optimized recent queries
outdoorDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model("OutdoorData", outdoorDataSchema);
