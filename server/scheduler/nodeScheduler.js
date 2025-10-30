const cron = require("node-cron");
const fetchAndStoreNodeData = require("../services/fetchNodeData.js");

// Run every 2 minutes
cron.schedule("*/5 * * * *", async () => {
//   console.log("Fetching and storing node data...");
  await fetchAndStoreNodeData();
},
  { timezone: "Asia/Kolkata" });


