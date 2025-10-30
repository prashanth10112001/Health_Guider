import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({
    room_name: "",
    room_length: "",
    room_width: "",
    room_height: "",
    occupancy: "",
    doors: 1,
    windows: 1,
    devices: [],
    appliances: [],
  });

  // 🟢 Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await api.post("/room/get", { userId: user?._id });
      
      setRooms(res.data.rooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  // 🟢 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟢 Handle array selection (appliances/devices)
  const handleArrayChange = (key, value) => {
    const arr = form[key];
    if (arr.includes(value)) {
      setForm({ ...form, [key]: arr.filter((v) => v !== value) });
    } else {
      setForm({ ...form, [key]: [...arr, value] });
    }
  };

  // 🟢 Submit new or updated room
  const handleSubmit = async () => {
    try {
      if (editRoom) {
        await api.post("/room/update", { id: editRoom._id, ...form });
        toast.success("Room updated successfully!");
      } else {
        await api.post("/room/create", { ...form, userId: user._id });
        toast.success("Room added successfully!");
      }
      setShowForm(false);
      setEditRoom(null);
      setForm({
        room_name: "",
        room_length: "",
        room_width: "",
        room_height: "",
        occupancy: "",
        doors: 1,
        windows: 1,
        devices: [],
        appliances: [],
      });
      fetchRooms();
    } catch (err) {
      console.error("Error saving room:", err);
    }
  };

  // 🟢 Delete room
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
      try {
        await api.post("/room/delete", { id }); // 🔹 POST instead of DELETE
        fetchRooms(); // Refresh rooms after deletion
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Failed to delete the room. Please try again.");
        }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        🏠 Your Rooms
      </h1>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Room Card */}
        <div
          onClick={() => setShowForm(true)}
          className="flex flex-col justify-center items-center border-2 border-dashed border-gray-400 rounded-xl h-40 hover:bg-gray-100 cursor-pointer transition"
        >
          <span className="text-5xl text-blue-500">+</span>
          <p className="text-gray-600 mt-2">Add Room</p>
        </div>

        {/* Existing Rooms */}
        {rooms && rooms.map((room) => (
          <div
            key={room._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition relative"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {room.room_name}
            </h3>
            <p className="text-sm text-gray-600">
              {room.room_length} × {room.room_width} × {room.room_height} m
            </p>
            <p className="text-sm text-gray-600">Occupancy: {room.occupancy}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setEditRoom(room);
                  setForm(room);
                  setShowForm(true);
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(room._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Room Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editRoom ? "Edit Room" : "Add New Room"}
            </h2>

            {/* Form Inputs */}
            <input
              name="room_name"
              placeholder="Room Name"
              value={form.room_name}
              onChange={handleChange}
              className="border rounded p-2 w-full mb-3"
            />
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input
                name="room_length"
                placeholder="Length"
                value={form.room_length}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
              <input
                name="room_width"
                placeholder="Width"
                value={form.room_width}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
              <input
                name="room_height"
                placeholder="Height"
                value={form.room_height}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
            </div>

            <input
              name="occupancy"
              placeholder="Occupancy"
              value={form.occupancy}
              onChange={handleChange}
              className="border rounded p-2 w-full mb-3"
            />

            {/* Appliances */}
            <div className="mb-3">
              <p className="font-medium text-gray-700 mb-1">Appliances:</p>
              {["AC", "Ceiling Fan", "Window", "Door", "Exhaust Fan"].map((a) => (
                <label key={a} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={form.appliances.includes(a)}
                    onChange={() => handleArrayChange("appliances", a)}
                  />{" "}
                  {a}
                </label>
              ))}
            </div>

            {/* Devices */}
            <div className="mb-3">
              <p className="font-medium text-gray-700 mb-1">Devices:</p>
              {[1192, 1193, 1194,1195,1196,1197,1198,1199,1200,1201,1202,1203].map((d) => (
                <label key={d} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={form.devices.includes(d)}
                    onChange={() => handleArrayChange("devices", d)}
                  />{" "}
                  {d}
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editRoom ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
