// ./scheduler/outdoorScheduler.js
const cron = require("node-cron");
const fetchAndStoreOutdoorData = require("../services/fetchOutdoorData.js");

// Run every 2 minutes
cron.schedule("*/10 * * * *", async () => {
//   console.log("🌤️ Fetching and storing outdoor data...");
  await fetchAndStoreOutdoorData();
},
  { timezone: "Asia/Kolkata" });
