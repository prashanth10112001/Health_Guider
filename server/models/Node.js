const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const nodeSchema = new Schema(
  {
    nodeValue: {
      type: Number,
      required: true,
    },
    activityData: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    timestampArr: {
      type: [Date], // Assuming it's an array of timestamps
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

// Adding necessary indexes for fast querying
nodeSchema.index({ createdAt: -1 }); // Index createdAt for fast sorting by timestamp
nodeSchema.index({ isDeleted: 1 }); // Index for faster filtering on isDeleted

const Node = mongoose.model("Node", nodeSchema);
module.exports = Node;
