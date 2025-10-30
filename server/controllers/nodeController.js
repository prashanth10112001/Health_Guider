const Node = require("../models/Node.js");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all Nodes with Pagination
const index = async (req, res) => {
  try {
    console.log("[+]Fetching all nodes...");
    const { page = 1, limit = 10, nodeValue } = req.query; // Get page and limit from query parameters
    const istNowStr = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .substring(0, 19); //This fix is to avoid any garbage while fetching
    const nodes = await Node.find({
      isDeleted: { $ne: true },
      nodeValue: nodeValue,
      "activityData.timestamp": { $lt: istNowStr },
    })
      .sort({ "activityData.timestamp": -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const totalNodes = await Node.countDocuments({
      isDeleted: { $ne: true },
      nodeValue: nodeValue,
    });
    // const totalPages = Math.min(Math.ceil(totalNodes / limit), 5); // Limit total pages to 10
    const totalPages = Math.ceil(totalNodes / limit); // Limit total pages to 10

    res.status(200).json({
      data: nodes,
      currentPage: page,
      // totalPages: Math.ceil(totalNodes / limit),
      totalPages: totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred: ${err.message}" });
  }
};

// Get a Single Node by ID
const show = async (req, res) => {
  try {
    console.log("Fetching node details...");
    const { _id } = req.body;

    if (!isValidObjectId(_id)) {
      return res.status(400).json({ message: "Invalid node ID" });
    }

    const node = await Node.findOne({ _id, isDeleted: { $ne: true } }).lean();
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json(node);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
};

const convertToCustomFormat = (dateTimeString, isEndDate = false) => {
  const date = new Date(dateTimeString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = isEndDate ? "59" : "00"; // Set seconds to 59 for end date and 00 for start date
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Filter Nodes by Timestamp and nodeValue
const filterByTimestamp = async (req, res) => {
  console.log("Filtering by timestamps and nodeValue...");
  const { startDate: start, endDate: end, nodeValue } = req.body;
  const { page = 1, limit = 10 } = req.query;

  if (!start || !end || !nodeValue) {
    return res.status(400).json({
      message:
        "start, end, and nodeValue are required fields in the format dd/mm/yyyy hh:mm:ss",
    });
  }

  const parseDateTime = (dateTimeString) => {
    const [datePart, timePart] = dateTimeString.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  try {
    const startDate = convertToCustomFormat(start);
    const endDate = convertToCustomFormat(end);
    console.log(startDate);
    console.log(endDate);
    let nodes = await Node.find({
      nodeValue: nodeValue,
      "activityData.timestamp": { $gte: startDate, $lte: endDate },
      isDeleted: { $ne: true },
    })
      .sort({ "activityData.timestamp": -1 })
      .lean();

    console.log("Page:", page, "Limit:", limit);
    console.log(
      "Start Date:",
      startDate,
      "End Date:",
      endDate,
      "Node Value:",
      nodeValue
    );

    if (!(page == -1 && limit == -1)) {
      nodes = nodes.slice((page - 1) * limit, page * limit);
    }

    const totalNodes = await Node.countDocuments({
      nodeValue: nodeValue,
      "activityData.timestamp": { $gte: startDate, $lte: endDate },
      isDeleted: { $ne: true },
    });

    console.log("Total matching records before pagination:", totalNodes);
    console.log("Nodes fetched after pagination:", nodes.length);

    const totalPages = Math.ceil(totalNodes / limit);

    res.status(200).json({
      data: nodes,
      currentPage: Number(page),
      totalPages: page == -1 || limit == -1 ? 1 : totalPages,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Invalid date format. Please use dd/mm/yyyy hh:mm:ss",
      error: err,
    });
  }
};

const getAllLastRecords = async (req, res) => {
  console.log("Getting the Last Records...");
  const { apiKey: apiKey } = req.body;
  const apiKey_real = "IPOLLUSENSE_ROCKS";
  if (apiKey != apiKey_real) {
    return res.status(500).json({
      message: "Enter valid API Key. Ask someone in charge.",
    });
  }

  try {
    const result = await Node.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          "activityData.timestamp": {
            $gte: new Date(
              Date.now() + 5.5 * 60 * 60 * 1000 - 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .replace("T", " ")
              .substring(0, 19),
            $lte: new Date(Date.now() + 5.5 * 60 * 60 * 1000)
              .toISOString()
              .replace("T", " ")
              .substring(0, 19),
          },
        },
      },
      {
        $sort: { nodeValue: 1, "activityData.timestamp": -1 },
      },
      {
        $group: {
          _id: "$nodeValue",
          data: { $first: "$activityData" },
        },
      },
      {
        $sort: { "data.timestamp": -1 },
      },
    ]);
    res.status(200).json({
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Some error occured",
      error: err,
    });
  }
};

const filterByTimeRange = async (req, res) => {
  console.log("Filtering by timerange and nodeValue...");
  const { timeRange, nodeValue, startDate: start, endDate: end } = req.body; // Accept timeRange from the request body
  // const { page = 1, limit = 10 } = req.query; // Pagination parameters

  console.log("startdate and enddate", start, end, nodeValue);

  if (!timeRange || !nodeValue) {
    return res.status(400).json({
      message: "timeRange and nodeValue are required fields",
    });
  }

  if (start && end && timeRange) {
    console.log("inside start and end", start, end, timeRange);

    try {
      const endDate = convertToCustomFormat(end, true);
      let startDate;

      switch (timeRange) {
        case "1h":
          startDate = convertToCustomFormat(
            new Date(new Date(end).getTime() - 1 * 60 * 60 * 1000)
          );
          break;
        case "5h":
          startDate = convertToCustomFormat(
            new Date(new Date(end).getTime() - 5 * 60 * 60 * 1000)
          );
          break;
        case "1d":
          startDate = convertToCustomFormat(
            new Date(new Date(end).getTime() - 24 * 60 * 60 * 1000)
          );
          break;
        default:
          return res.status(400).json({ message: "Invalid timeRange value" });
      }

      console.log("after converting start end", startDate, endDate);

      // console.log("after converting start end", start, end);

      const query = {
        nodeValue: nodeValue,
        "activityData.timestamp": { $gte: startDate, $lte: endDate },
        isDeleted: { $ne: true },
      };

      console.log("Query Parameters:", {
        timeRange,
        nodeValue,
        startDate,
        endDate,
      });

      console.log("MongoDB Query:", query);

      const nodes = await Node.find(query)
        .sort({ "activityData.timestamp": -1 })
        .lean();

      console.log("Query Results:", nodes.length, "records found.");

      res.status(200).json({ data: nodes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: `An error occurred: ${err.message}` });
    }
  } else {
    console.log("inside else", start, end, timeRange);

    let calcStartDate;
    // let calcEndDate = new Date();
    let calcEndDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    let now = new Date();

    switch (timeRange) {
      case "1h":
        calcStartDate = new Date(calcEndDate.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

        break;
      case "5h":
        calcStartDate = new Date(calcEndDate.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago

        break;
      case "1d":
        calcStartDate = new Date(calcEndDate.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

        break;
      default:
        return res.status(400).json({ message: "Invalid timeRange value" });
    }

    // Format the dates after calculations
    const formattedStartDate = convertToCustomFormat(calcStartDate);
    const formattedEndDate = convertToCustomFormat(calcEndDate);

    console.log(
      "inside else calcEndDate:",
      calcEndDate,
      "calcStartDate:",
      calcStartDate,
      "formattedStartDate",
      formattedStartDate,
      "formattedEndDate",
      formattedEndDate,
      timeRange
    );

    const query = {
      nodeValue: nodeValue,
      "activityData.timestamp": {
        $gte: formattedStartDate,
        $lte: formattedEndDate,
      },
      isDeleted: { $ne: true },
    };

    // console.log("MongoDB Query:", query);

    try {
      const nodes = await Node.find(query)
        .sort({ "activityData.timestamp": -1 })
        .lean();

      // console.log("Query Results:", nodes.length, "records found.");

      res.status(200).json({ data: nodes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: `An error occurred: ${err.message}` });
    }
  }
};

const fireBaseData = async (req, res) => {
  const { deviceIds, startDate, endDate } = req.body;

  try {
    let query = db.collection("devices").orderBy("timestamp", "desc");

    // Apply filters
    if (startDate) query = query.where("timestamp", ">=", new Date(startDate));
    if (endDate) query = query.where("timestamp", "<=", new Date(endDate));

    const snapshot = await query.get();
    let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Filter by device IDs if provided
    if (deviceIds?.length) {
      data = data.filter((item) =>
        deviceIds.some((id) => item.device_ids?.includes(id))
      );
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching data from Firebase:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};
// fetching data from Firebase on 10-04-2025

// Add a New Node
const store = async (req, res) => {
  try {
    console.log("Saving new node...");
    const { activityData, nodeValue } = req.body;

    // const count = await Node.countDocuments();
    // const newId = count + 1; // Assign a unique ID

    // const newNode = new Node({ _id: newId, activityData, nodeValue });
    const newNode = new Node({ activityData, nodeValue });
    await newNode.save();

    res.status(201).json({ message: "Node saved successfully", node: newNode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
};

// Update Node Details
const update = async (req, res) => {
  try {
    console.log("Updating node details...");
    const { _id, activityData, nodeValue } = req.body;

    if (!isValidObjectId(_id)) {
      return res.status(400).json({ message: "Invalid node ID" });
    }

    const updatedNode = await Node.findByIdAndUpdate(
      _id,
      { $set: { activityData, nodeValue } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedNode) {
      return res.status(404).json({ message: "Node not found" });
    }

    res
      .status(200)
      .json({ message: "Node updated successfully", node: updatedNode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
};

// Soft Delete a Node
const destroy = async (req, res) => {
  try {
    console.log("Soft deleting node...");
    const { _id } = req.body;

    if (!isValidObjectId(_id)) {
      return res.status(400).json({ message: "Invalid node ID" });
    }

    const deletedNode = await Node.findByIdAndUpdate(
      _id,
      { $set: { isDeleted: true } },
      { new: true }
    ).lean();

    if (!deletedNode) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json({ message: "Node marked as deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
};

module.exports = {
  index,
  show,
  getAllLastRecords,
  store,
  update,
  destroy,
  filterByTimestamp,
  filterByTimeRange,
  fireBaseData,
};
