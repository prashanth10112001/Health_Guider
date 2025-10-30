import React, { useEffect, useState } from "react";
import CurrentPollutants from "../components/CurrentPollutants";
import Recommendation from "../components/Recommendation";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);

  

  // 🟢 Fetch user’s rooms
  useEffect(() => {
     
    const fetchRooms = async () => {
      if (!user) return; // wait until user is loaded
      if (!user._id) return; // ensure user ID exists
      try {
        setLoadingRooms(true);
        const res = await api.post("/room/get", { userId: user._id });
        const userRooms = res.data.rooms || [];
        
        setRooms(userRooms);

        if (userRooms.length > 0) {
          setSelectedRoom(userRooms[0]._id); // ✅ use _id, not name
          setSelectedDevice(userRooms[0]?.devices?.[0] || "");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load rooms.");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [user]);

  // 🟢 Update selected device when selectedRoom changes
  useEffect(() => {
    if (!selectedRoom) return;
    const currentRoom = rooms.find((room) => room._id === selectedRoom);
    if (currentRoom && currentRoom.devices?.length > 0) {
      setSelectedDevice(currentRoom.devices[0]);
    } else {
      setSelectedDevice("");
    }
  }, [selectedRoom, rooms]); // ✅ remove selectedDevice here

  const userId = user?._id || "guest";



  return (
    <div className="p-4 min-h-screen bg-gray-50 flex flex-col mt-20">
      {/* 🏠 Room and Device Selector */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
        {loadingRooms && (
          <p className="text-gray-500 animate-pulse">Loading rooms...</p>
        )}

        {!loadingRooms && rooms.length > 0 &&  (
          <>
            {/* Room Selector */}
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.room_name}
                </option>
              ))}
            </select>

            {/* Device Selector */}
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={!rooms.find((r) => r._id === selectedRoom)?.devices?.length}
            >
              {rooms
                .find((r) => r._id === selectedRoom)
                ?.devices?.map((device, idx) => (
                  <option key={idx} value={device}>
                    Device {device}
                  </option>
                )) || <option>No devices</option>}
            </select>
          </>
        )}
         {!loadingRooms && rooms.length === 0 &&  (
          <p className="text-gray-600 italic">
            No rooms found. Please add one first.
          </p>
        )}
      </div>

      {/* Main Dashboard Layout */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
    {/* Left: Pollutants */}
    <div className="flex flex-col bg-white shadow-md rounded-xl p-4 h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Current Pollutants
      </h2>
      <div className="flex-1 overflow-auto">
        <CurrentPollutants
          selectedRoom={selectedRoom}
          selectedDevice={selectedDevice}
        />
      </div>
    </div>

    {/* Middle: Recommendations */}
    <div className="flex flex-col bg-white shadow-md rounded-xl p-4 h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Recommendations
      </h2>
      <div className="flex-1 overflow-auto">
        <Recommendation
          selectedRoom={selectedRoom}
          selectedDevice={selectedDevice}
          userId={userId}
        />
      </div>
    </div>

    {/* Right: ChatBox */}
    <div className="flex flex-col bg-white shadow-md rounded-xl p-0 h-full">
      <ChatBox userId={userId} roomId={selectedRoom} deviceId={selectedDevice} />
    </div>
  </div>
    </div>
  );
}
