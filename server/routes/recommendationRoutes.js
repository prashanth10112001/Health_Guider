const express = require("express");
const router = express.Router();
const {
  callPythonScript,
  createRecommendation,
  getRecommendations,
  getLatestRecommendation,
  deleteRecommendation,
} = require("../controllers/recommendationController.js");

router.post("/latest", callPythonScript);
// Create a new recommendation
router.post("/create", createRecommendation);
// Get multiple recommendations with filters, pagination, sorting
router.post("/get", getRecommendations);
// Get the latest recommendation for a room or user
router.post("/getLatest", getLatestRecommendation);
// Soft delete a recommendation
router.post("/delete", deleteRecommendation);

module.exports = router;
