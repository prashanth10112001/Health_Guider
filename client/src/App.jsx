import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import PublicRoute from "./auth/PublicRoute";
import { Toaster } from "react-hot-toast";

import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <PrivateRoute>
                  <Rooms />
                </PrivateRoute>
              }
            />
             <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
    </>
  );
}


export default App;
