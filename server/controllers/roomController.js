const Room = require("../models/Room.js");
const User = require("../models/User.js");

// Create Room
const createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Rooms (with optional filters) + populate user
const getRooms = async (req, res) => {
  try {
    const filter = req.body.filter || { isDeleted: false };

    const rooms = await Room.find(filter)
      .populate("userId") // populate user details
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Room ID required" });

    const room = await Room.findOne({ _id: id, isDeleted: false }).populate(
      "userId"
    );

    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Room
const updateRoom = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Room ID required" });

    const room = await Room.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateFields,
      { new: true }
    ).populate("userId");

    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete Room
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Room ID required" });

    const room = await Room.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });

    res.status(200).json({ success: true, message: "Room soft deleted", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
