const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController.js");

// All POST requests
router.post("/create", createRoom);
router.post("/get", getRooms);
router.post("/getById", getRoomById);
router.post("/update", updateRoom);
router.post("/delete", deleteRoom);

module.exports = router;
