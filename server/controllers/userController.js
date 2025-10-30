const User = require("../models/User.js");

// Create User
const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Create User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users (optionally with filters)
const getUsers = async (req, res) => {
  try {
    const filter = req.body.filter || {}; // e.g., { isDeleted: false }
    const users = await User.find(filter);
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get User by ID (from req.body)
const getUserById = async (req, res) => {
  try {
    const { email  } = req.body;
    
    if (!email ) {
      return res
        .status(400)
        .json({ success: false, message: "User email required" });
    }

    const user = await User.findOne({ email : email , isDeleted: false });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User By email Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update User (ID + fields in body)
const updateUser = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateFields,
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User soft deleted", user });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
