import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "../api/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful! 🎉");
      navigate("/");
    } catch (err) {
      console.error(err);
      let message = "Failed to login.";
      if (err.code === "auth/invalid-email") message = "Invalid email format.";
      else if (err.code === "auth/user-not-found") message = "User not found.";
      else if (err.code === "auth/wrong-password") message = "Incorrect password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-80">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Login
        </h1>

        <input
          className="border border-gray-300 rounded-lg p-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="border border-gray-300 rounded-lg p-2 mb-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-between text-sm text-blue-500 mb-4">
          <Link to="/forgot-password" className="hover:underline">
            Forgot Password?
          </Link>
          <Link to="/register" className="hover:underline">
            Sign Up
          </Link>
        </div>

        <button
          className={`w-full cursor-pointer py-2 rounded-lg font-medium text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
