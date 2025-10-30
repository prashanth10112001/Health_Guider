import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { firebaseApp } from "../api/firebaseConfig";
import toast from "react-hot-toast";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to logout. Try again.");
    }
  };

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight hover:opacity-90 transition"
          >
            {/* ✅ Logo Icon */}
            <img
              src={logo}
              alt="Indoor AI Logo"
              className="w-8 h-8 object-contain"
            />
            Indoor<span className="text-yellow-300">AI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && user && (
              <>
                <Link
                  to="/"
                  className={`hover:text-yellow-300 transition ${
                    location.pathname === "/" ? "text-yellow-300" : ""
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/rooms"
                  className={`hover:text-yellow-300 transition ${
                    location.pathname === "/rooms" ? "text-yellow-300" : ""
                  }`}
                >
                  Rooms
                </Link>
              </>
            )}
          </div>

          {/* Right - Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <span className="animate-pulse text-gray-200">Loading...</span>
            ) : !user ? (
              <>
                {isLoginPage ? (
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    Sign Up
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    Login
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 bg-opacity-95 backdrop-blur-md px-4 py-3 space-y-2 shadow-inner animate-fadeIn">
          {!loading && user && (
            <>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium hover:text-yellow-300"
              >
                Dashboard
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium hover:text-yellow-300"
              >
                Rooms
              </Link>
            </>
          )}

          {!loading && (
            <>
              {!user ? (
                <>
                  {isLoginPage ? (
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-sm font-medium bg-white text-blue-700 rounded-lg px-3 text-center hover:bg-gray-100 transition"
                    >
                      Sign Up
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-sm font-medium bg-white text-blue-700 rounded-lg px-3 text-center hover:bg-gray-100 transition"
                    >
                      Login
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block w-full py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
