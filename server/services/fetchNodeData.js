const axios = require("axios");
const Node = require("../models/Node.js");

const SENSOR_API_URL = process.env.SENSOR_API_URL;



// The body to send with the POST request
const REQUEST_BODY = {
  apiKey: process.env.SENSOR_API_KEY,
};

async function fetchAndStoreNodeData() {
  try {
    console.log("[+][Scheduler] 🔁 Fetching Node data from sensor API...");

    // ✅ POST request with body + headers
    const response = await axios.post(SENSOR_API_URL, REQUEST_BODY, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ✅ Extract array safely
    const data = response.data?.data;
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("[Scheduler] ⚠️ No valid data received from API.");
      return;
    }

    // ✅ Prepare docs for insertion
    const nodesToInsert = data.map((item) => {
      const activity = item.data;
      const timestamp = new Date(activity.timestamp.replace(" ", "T") + "Z"); // normalize time

      return {
        nodeValue: item._id,
        activityData: activity,
        timestampArr: [timestamp],
      };
    });

    // ✅ Always insert new records
    await Node.insertMany(nodesToInsert);
    console.log(
      `[+] ✅ Inserted ${nodesToInsert.length} node records.`
    );
  } catch (error) {
    console.error("[-][Scheduler] ❌ Error fetching node data:", error.message);
  }
}

module.exports = fetchAndStoreNodeData;
