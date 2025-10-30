// controllers/recommendationController.js
const axios = require("axios");
const User = require("../models/User.js");
const Room = require("../models/Room.js");
const Node = require("../models/Node.js");
const OutdoorData = require("../models/OutdoorData.js");
const Recommendation = require("../models/Recommendation.js"); // optional: for fallback cache
const mongoose = require("mongoose");

const PYTHON_API_BASE = process.env.PYTHON_API_BASE; // e.g. http://localhost:8000

// helper: safe object to return to python (strip mongoose _doc / nested objects)
const toPlain = (doc) => {
  if (!doc) return null;
  if (doc.toObject) return doc.toObject();
  return doc;
};

/**
 * POST /api/recommendation/latest
 * body: { userId, roomId, selectedDevice }   // selectedDevice is nodeValue (number or string)
 */
const callPythonScript = async (req, res) => {
  try {
    const { userId, roomId, selectedDevice } = req.body;

    if (!userId || !roomId) {
      return res.status(400).json({ success: false, message: "userId and roomId required" });
    }

    // Validate ids
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or roomId" });
    }

    // Fetch DB records in parallel
    const [
      userDoc,
      roomDoc,
      latestNodeDoc,
      latestOutdoorDoc,
      latestCachedRecommendation,
    ] = await Promise.all([
      User.findOne({ _id: userId, isDeleted: false }).lean(),
      Room.findOne({ _id: roomId, isDeleted: false }).lean(),
      // latest node reading for device (nodeValue)
      (async () => {
        if (!selectedDevice) return null;
        // nodeValue may be number or string — adjust query type if needed
        return Node.findOne({ nodeValue: selectedDevice, isDeleted: false })
          .sort({ "activityData.timestamp": -1 })
          .lean();
      })(),
      // latest outdoor data
      OutdoorData.findOne({ isDeleted: false }).sort({ timestamp: -1 }).lean(),
      // optional: get last saved recommendation for fallback
      Recommendation.findOne({ roomId, userId, isDeleted: false }).sort({ recommendedAt: -1 }).lean(),
    ]);

    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Build clean payload expected by Python FastAPI
    const payload = {
      user: toPlain(userDoc),
      room: toPlain(roomDoc),
      indoor: toPlain(latestNodeDoc) || null,
      outdoor: toPlain(latestOutdoorDoc) || null,
      meta: {
        requestedAt: new Date().toISOString(),
        clientIp: req.ip,
      },
    };
    

    if (!PYTHON_API_BASE) {
      return res.status(500).json({ success: false, message: "PYTHON_API_BASE not configured" });
    }

    // forward to Python FastAPI
    const pythonUrl = `${PYTHON_API_BASE.replace(/\/$/, "")}/ai/recommend`;
    

    const axiosConfig = {
      timeout: 60_000, // 25s - adjust as needed
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const pythonResp = await axios.post(pythonUrl, payload, axiosConfig);

      const pythonData = pythonResp.data;

      const now = new Date();
      const offsetMs = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins in ms
      const istTime = new Date(now.getTime() + offsetMs);

      const formatted = istTime.toISOString().replace("T", " ").substring(0, 19);

      // ✅ Build the document to save
      const recDoc = {
        roomId,
        userId,
        recommendation: pythonData.recommendation || {},
        conditions: {
          indoor: payload.indoor?.activityData?.data || {},
          outdoor: payload.outdoor?.activityData || {},
          userHealth: payload.user?.health_issues || [],
        },
        recheckAt: pythonData.recommendation?.RECHECK_AT || 5,
        recommendedAt: formatted,
      };

      // ✅ Save to DB
      const saved = await Recommendation.create(recDoc);
      

      // Expect pythonResp.data to be the recommendation object (structured JSON)
      return res.status(200).json({
        success: true,
        source: "python",
        python: pythonResp.data,
        savedRecommendation:saved
      });

    } catch (err) {
      console.error("[-][Recommendation] Python request failed:", err.message || err);

      // Fallback: if we have a cached recommendation in DB, return it (better UX)
      if (latestCachedRecommendation) {
        return res.status(200).json({
          success: true,
          source: "cache",
          recommendation: latestCachedRecommendation,
          warning: "[!] Python service failed; returning last cached recommendation.",
        });
      }

      return res.status(502).json({
        success: false,
        message: "[-]Python service error or timeout",
        error: err.message,
      });
    }

  } catch (err) {
    console.error("[-][Recommendation] Unexpected error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new recommendation
const createRecommendation = async (req, res) => {
  try {
    const recommendation = new Recommendation(req.body);
    await recommendation.save();
    res.status(201).json({ success: true, recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recommendations with filters, pagination, and sorting
const getRecommendations = async (req, res) => {
  try {
    const { filter = {}, page = 1, limit = 10 } = req.body;

    // Ensure soft delete filter
    filter.isDeleted = false;

    const skip = (page - 1) * limit;

    const recommendations = await Recommendation.find(filter)
      .populate("roomId")
      .populate("userId")
      .sort({ recommendedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Recommendation.countDocuments(filter);

    res
      .status(200)
      .json({ success: true, total, page, limit, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get latest recommendation for a room or user
const getLatestRecommendation = async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    if (!roomId && !userId) {
      return res
        .status(400)
        .json({ success: false, message: "roomId or userId required" });
    }

    const filter = { isDeleted: false };
    if (roomId) filter.roomId = roomId;
    if (userId) filter.userId = userId;

    const latest = await Recommendation.findOne(filter)
      .populate("roomId")
      .populate("userId")
      .sort({ recommendedAt: -1 });

   if (!latest) {
      return res.status(200).json({
        success: true,
        latest: null,
        message: "No recommendation found",
      });
    }

    res.status(200).json({ success: true, latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft delete a recommendation
const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Recommendation ID required" });

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!recommendation)
      return res
        .status(404)
        .json({ success: false, message: "Recommendation not found" });

    res.status(200).json({
      success: true,
      message: "Recommendation soft deleted",
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  callPythonScript,
  createRecommendation,
  getRecommendations,
  getLatestRecommendation,
  deleteRecommendation,
};
