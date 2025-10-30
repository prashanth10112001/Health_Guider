const express = require("express");
const router = express.Router();
const {
  callPythonAgent,
  addMessageToConversation,
  getConversations,
  deleteConversation,
} = require("../controllers/chatController.js");

router.post("/agent", callPythonAgent);
router.post("/add", addMessageToConversation);
router.post("/get", getConversations);
router.post("/delete", deleteConversation);

module.exports = router;
