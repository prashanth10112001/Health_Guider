const express = require("express");
const {
  createOutdoorData,
  getOutdoorData,
  getOutdoorDataByTimestamp,
  updateOutdoorData,
  deleteOutdoorData,
} = require("../controllers/outdoorDataController.js");

const router = express.Router();

// All routes are POST as requested
router.post("/create", createOutdoorData);
router.post("/get", getOutdoorData);
router.post("/getByTimestamp", getOutdoorDataByTimestamp);
router.post("/update", updateOutdoorData);
router.post("/delete", deleteOutdoorData);

module.exports = router;
