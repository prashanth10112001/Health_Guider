const axios = require("axios");
const Chat = require("../models/Chat.js");

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:5000";

// 🧠 Chat with Python Agent and store the pair {user, agent}
const callPythonAgent = async (req, res) => {
  try {
    const { userId, roomId, message, conversationId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'message' in request body",
      });
    }

    // 🔹 Step 1: Send message to Python /ai/agent
    const pythonRes = await axios.post(`${PYTHON_API_BASE}/ai/agent`, {
      user_input: message,
    });

    const aiResult = pythonRes.data?.result;
    const agentReply =
      aiResult?.message ||
      aiResult?.response ||
      aiResult ||
      "🤖 No response from AI";

    // 🔹 Step 2: Prepare combined message pair
    const combinedMessage = { user: message, agent: agentReply };

    // 🔹 Step 3: Save to MongoDB
    const now = new Date();
    const offsetMs = 5.5 * 60 * 60 * 1000; // for IST
    const istTime = new Date(now.getTime() + offsetMs);
    const timestamp = istTime.toISOString().replace("T", " ").substring(0, 19);

    let chat;

    if (conversationId) {
      // Update existing chat
      chat = await Chat.findOneAndUpdate(
        { _id: conversationId, isDeleted: false },
        {
          $push: { messages: combinedMessage },
       
        },
        { new: true }
      );
    } else {
      // Create a new chat
      chat = new Chat({
        userId,
        roomId: roomId || null,
        messages: [combinedMessage],
        timestamp,
      });
      await chat.save();
    }

    // 🔹 Step 4: Return response to frontend
    res.status(200).json({
      success: true,
      result: combinedMessage,
      chatId: chat._id,
    });
  } catch (error) {
    console.error("❌ Error in callPythonAgent:", error.message);
    if (error.response) {
      console.error("Python response:", error.response.data);
    }
    res.status(500).json({
      success: false,
      message: "Python service error",
      error: error.message,
    });
  }
};



// Add a message to a conversation (always creates new conversation if no conversationId provided)
const addMessageToConversation = async (req, res) => {
  try {
    const { userId, roomId, messageObj, conversationId } = req.body;

    if (
        !messageObj ||
        typeof messageObj.sender !== "string" ||
        typeof messageObj.message !== "string" ||
        !messageObj.message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid message object: must include sender and non-empty message text",
        });
      }

    const now = new Date();
    const offsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins in ms
    const istTime = new Date(now.getTime() + offsetMs);
    const timestamp = istTime.toISOString().replace("T", " ").substring(0, 19);

    let chat;

    if (conversationId) {
      // Append message to existing conversation
      chat = await Chat.findOneAndUpdate({ 
        _id: conversationId, isDeleted: false },
        {
          $push: { messages: { ...messageObj, timestamp } },
          $set: { timestamp },
        },
        { new: true }
      );

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

    } else {
      // Create new conversation
      chat = new Chat({
        userId,
        roomId: roomId || null,
        messages: [{ ...messageObj, timestamp }],
        timestamp,
      });
      await chat.save();
    }

    res.status(201).json({
  success: true,
  message: conversationId ? "Message added to conversation" : "New conversation created",
  chat,
});

  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get conversations for a user (optionally filter by room)
const getConversations = async (req, res) => {
  try {
    const { userId, roomId, page = 1, limit = 5 } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "userId required" });

    const filter = { userId, isDeleted: false };
    if (roomId) filter.roomId = roomId;

    const skip = (page - 1) * limit;

    const conversations = await Chat.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments(filter);

    res.status(200).json({ success: true, total, page, limit, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft delete a conversation
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Conversation ID required" });

    const chat = await Chat.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });

    res
      .status(200)
      .json({ success: true, message: "Conversation soft deleted", chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  callPythonAgent,
  addMessageToConversation,
  getConversations,
  deleteConversation,
};
