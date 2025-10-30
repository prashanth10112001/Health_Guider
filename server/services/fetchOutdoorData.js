// ./services/fetchOutdoorData.js
const axios = require("axios");
const OutdoorData = require("../models/OutdoorData.js");

const OUTDOOR_API_URL_1 = process.env.OUTDOOR_API_URL_1;
const OUTDOOR_API_URL_2 = process.env.OUTDOOR_API_URL_2;
// Get current IST time formatted as "YYYY-MM-DD HH:mm:ss"
function getCurrentISTTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // +5:30 in ms
  const istTime = new Date(now.getTime() + istOffset);

  return istTime.toISOString().replace("T", " ").substring(0, 19);
}


async function fetchAndStoreOutdoorData() {
  try {
    console.log("[+][Scheduler] 🌤️ Fetching outdoor data from both APIs...");

    // Fetch data from both APIs
    const [res1, res2] = await Promise.all([
      axios.get(OUTDOOR_API_URL_1),
      axios.get(OUTDOOR_API_URL_2),
    ]);

    const data1 = res1.data?.current;
    const data2 = res2.data?.current;

    if (!data1 || !data2) {
      console.warn("[!][Scheduler] ⚠️ Missing data from one or both APIs");
      return;
    }

   const formattedTimestamp = getCurrentISTTime();


    const activityData = {
      pm10: data1.pm10,
      pm2_5: data1.pm2_5,
      carbon_monoxide: data1.carbon_monoxide,
      dust: data1.dust,
      temperature_2m: data2.temperature_2m,
      relative_humidity_2m: data2.relative_humidity_2m,
    };

    const metaData = {
      wind_speed_10m: data2.wind_speed_10m,
      wind_direction_10m: data2.wind_direction_10m,
      wind_gusts_10m: data2.wind_gusts_10m,
      rain: data2.rain,
      precipitation: data2.precipitation,
      is_day: data2.is_day,
    };

    // ✅ Prepare the record
    const outdoorRecord = new OutdoorData({
      timestamp: formattedTimestamp,
      activityData,
      metaData,
    });

    // ✅ Always insert new record (no update)
    await outdoorRecord.save();

    console.log(
      `[+] ✅ Inserted outdoor data @ ${formattedTimestamp}`
    );
  } catch (error) {
    console.error("[-][Scheduler] ❌ Error fetching outdoor data:", error.message);
  }
}

module.exports = fetchAndStoreOutdoorData;
