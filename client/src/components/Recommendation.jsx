import React, { useEffect, useState, useRef } from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const Recommendation = ({ selectedRoom, selectedDevice, userId }) => {
  const [recommendation, setRecommendation] = useState();
  const [loading, setLoading] = useState(true);
  const [nextCheckIn, setNextCheckIn] = useState(null); // in seconds
  const recheckIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  // ✅ Fetch latest recommendation
  const fetchRecommendation = async () => {
    if (!selectedRoom || !userId || !selectedDevice) return;

    try {
      setLoading(true);

      const body = {
        roomId: selectedRoom,
        userId: userId,
        selectedDevice: selectedDevice || null,
      };

      const res = await api.post("/recommendation/latest", body);
      console.log(res);
      
      if (res.data?.success) {
        const data =
          res?.data?.source === "python"
            ? res?.data?.python
            : res?.data?.recommendation;

        setRecommendation(data?.recommendation);

        // ✅ Set dynamic recheck interval
        
        const recheckMinutes = Number(data?.recommendation?.RECHECK_AT) || 5;

        const recheckSeconds = recheckMinutes * 60;

        // Clear previous timers if any
        if (recheckIntervalRef.current) clearInterval(recheckIntervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        setNextCheckIn(recheckSeconds);

        // ⏱️ Countdown timer updates every second
        countdownRef.current = setInterval(() => {
          setNextCheckIn((prev) => {
            if (prev === null || prev <= 1) return 0;
            return prev - 1;
          });
        }, 1000);

        // 🔁 Auto recheck at the end
        recheckIntervalRef.current = setInterval(() => {
          fetchRecommendation();
        }, recheckSeconds * 1000);
      } else {
        setRecommendation(null);
        toast.error(res.data?.message || "Failed to get recommendation");
      }
    } catch (err) {
      console.error("❌ Error fetching recommendation:", err);
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Initial Fetch
  useEffect(() => {
    if (!selectedRoom || !userId) return;
    fetchRecommendation();

    // cleanup on unmount
    return () => {
      if (recheckIntervalRef.current) clearInterval(recheckIntervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [selectedRoom, selectedDevice, userId]);

  // Format countdown nicely → “14:32”
  const formatCountdown = (seconds) => {
    if (seconds == null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500 animate-pulse">
        Fetching latest recommendations...
      </div>
    );
  }

  // 🚫 No data found
  if (!recommendation) {
    return (
      <div className="p-4 border rounded bg-white shadow text-gray-600">
        <h2 className="text-lg font-bold mb-2">Recommendation</h2>
        <p className="italic">No recommendations available yet.</p>
      </div>
    );
  }

  // ✅ Render recommendation data
  return (
 <div className="p-4 border rounded bg-white shadow">
  <h2 className="text-lg font-bold mb-2 text-gray-800">
    Latest Recommendation
  </h2>

  <div className="text-sm text-gray-700 space-y-1">
    {Object.entries(recommendation || {}).map(([key, value]) => {
      // Skip 'reason' and 'RECHECK_AT' for now (we'll handle them separately)
      if (key === "reason" || key === "RECHECK_AT") return null;

      return (
        <p key={key}>
          <strong>{key.replaceAll("_", " ")}:</strong>{" "}
          {String(value) || "N/A"}
        </p>
      );
    })}

    {/* 🧠 Show reason nicely formatted */}
    {recommendation.reason && (
      <div className="mt-3">
        <strong>Reason:</strong>
        <p className="text-gray-600 italic">{recommendation.reason}</p>
      </div>
    )}

    {/* ⏳ Recheck time + countdown */}
    <p>
      <strong>Recheck Interval:</strong>{" "}
      {recommendation.RECHECK_AT
        ? `${recommendation.RECHECK_AT} min`
        : "5 min (default)"}
    </p>

    <p>
      <strong>Next Recheck:</strong>{" "}
      {nextCheckIn !== null
        ? `in ${formatCountdown(nextCheckIn)} (mm:ss)`
        : "Calculating..."}
    </p>

    {/* <p>
      <strong>Generated At:</strong>{" "}
      {new Date().toLocaleString()}
    </p> */}
  </div>
</div>

  );
};

export default Recommendation;
