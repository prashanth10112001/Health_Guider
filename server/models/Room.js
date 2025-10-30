const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    room_name: {type:String , required:true},
    room_length: { type: Number, required: true },
    room_width: { type: Number, required: true },
    room_height: { type: Number, required: true },

    occupancy: { type: Number, required: true },

    devices: {
      type: [mongoose.Schema.Types.Mixed], // Array of flexible objects
      default: [],
    },

    appliances: {
      type: [mongoose.Schema.Types.Mixed], // Array of flexible objects
      default: [],
    },

    doors: { type: Number, default: 1 },
    windows: { type: Number, default: 1 },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster querying by user + recent rooms
roomSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Room", roomSchema);
