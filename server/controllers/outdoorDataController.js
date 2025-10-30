const OutdoorData = require("../models/OutdoorData.js");

// Create Outdoor Data
const createOutdoorData = async (req, res) => {
  try {
    const outdoorData = new OutdoorData(req.body);
    await outdoorData.save();
    res.status(201).json({ success: true, outdoorData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Outdoor Data (optional filter using req.body.filter)
const getOutdoorData = async (req, res) => {
  try {
    const { filter = { isDeleted: false }, page = 1, limit = 10 } = req.body;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const data = await OutdoorData.find(filter)
      .sort({ timestamp: -1 }) // ✅ Newest first
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await OutdoorData.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get by Timestamp
const getOutdoorDataByTimestamp = async (req, res) => {
  try {
    const { timestamp } = req.body;
    if (!timestamp)
      return res
        .status(400)
        .json({ success: false, message: "Timestamp required" });

    const data = await OutdoorData.findOne({ timestamp, isDeleted: false });
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Outdoor Data
const updateOutdoorData = async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;
    if (!id)
      return res.status(400).json({ success: false, message: "ID required" });

    const updated = await OutdoorData.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateFields,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });

    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const deleteOutdoorData = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res.status(400).json({ success: false, message: "ID required" });

    const deleted = await OutdoorData.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });

    res.status(200).json({ success: true, message: "Soft deleted", deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOutdoorData,
  getOutdoorData,
  getOutdoorDataByTimestamp,
  updateOutdoorData,
  deleteOutdoorData,
};
