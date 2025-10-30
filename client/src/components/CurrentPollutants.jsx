import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const CurrentPollutants = ({selectedRoom,selectedDevice}) => {
  const [indoor, setIndoor] = useState(null);
  const [outdoor, setOutdoor] = useState(null);
  const [loading, setLoading] = useState(true);
  
useEffect(() => {
  const fetchPollutants = async () => {
    
    try {
      if (!selectedDevice){ 
        
        return;
      }; // wait until a device is selected

      // 1️⃣ Fetch indoor data (node)
      const indoorRes = await api.get(`/node?nodeValue=${selectedDevice}`);
      const indoorData = indoorRes.data?.data?.[0]?.activityData || {};

      // 2️⃣ Fetch outdoor data
      const outdoorRes = await api.post("/outdoor/get", {});
      const outdoorData = outdoorRes.data?.data?.[0] || {};
        

        setIndoor(indoorData || null);
        setOutdoor(outdoorData || null);
      } catch (err) {
        console.error("Error fetching pollutant data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPollutants();
  }, [selectedDevice]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span className="text-gray-600">Fetching latest pollutant data...</span>
      </div>
    );

  if (!indoor && !outdoor)
    return (
      <div className="text-center text-gray-500">
        No pollutant data available.
      </div>
    );

    

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Indoor Data */}
      <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">
          🏠 Indoor Environment
        </h2>
        {indoor ? (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <strong>Temperature:</strong> {indoor.data?.temperature ?? "N/A"} °C
            </li>
            <li>
              <strong>Humidity:</strong> {indoor.data?.humidity ?? "N/A"} %
            </li>
            <li>
              <strong>PM2.5:</strong> {indoor.data?.pm2_5 ?? "N/A"} µg/m³
            </li>
            <li>
              <strong>PM10:</strong> {indoor.data?.pm10 ?? "N/A"} µg/m³
            </li>
            <li>
              <strong>CO:</strong> {indoor.data?.co ?? "N/A"} ppm
            </li>
            <li>
              <strong>VOC:</strong> {indoor.data?.voc ?? "N/A"} ppm
            </li>
            <li className="mt-2 text-xs text-gray-500">
              Updated at: {indoor.timestamp}
            </li>
          </ul>
        ) : (
          <p className="text-gray-500">No indoor data available</p>
        )}
      </div>

      {/* Outdoor Data */}
      <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">
          🌤️ Outdoor Environment
        </h2>
        {outdoor ? (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <strong>Temperature:</strong>{" "}
              {outdoor.activityData?.temperature_2m ?? "N/A"} °C
            </li>
            <li>
              <strong>Humidity:</strong>{" "}
              {outdoor.activityData?.relative_humidity_2m ?? "N/A"} %
            </li>
            <li>
              <strong>PM2.5:</strong> {outdoor.activityData?.pm2_5 ?? "N/A"} µg/m³
            </li>
            <li>
              <strong>PM10:</strong> {outdoor.activityData?.pm10 ?? "N/A"} µg/m³
            </li>
            <li>
              <strong>CO:</strong>{" "}
              {outdoor.activityData?.carbon_monoxide ?? "N/A"} ppm
            </li>
            <li>
              <strong>Dust:</strong> {outdoor.activityData?.dust ?? "N/A"} µg/m³
            </li>
            <li className="mt-2 text-xs text-gray-500">
              Updated at: {outdoor.timestamp}
            </li>
          </ul>
        ) : (
          <p className="text-gray-500">No outdoor data available</p>
        )}
      </div>
    </div>
  );
};

export default CurrentPollutants;
