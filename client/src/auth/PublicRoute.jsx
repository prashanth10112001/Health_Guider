import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Checking authentication...
        </p>
      </div>
    );

  // 🚫 If user is logged in, redirect them to dashboard
  if (user) return <Navigate to="/" replace />;

  return children;
}
