import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div
            className={`rounded-2xl p-6 ${
              isDark
                ? "bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.5)] ring-1 ring-slate-800"
                : "bg-white shadow"
            }`}
          >
            <div className="flex items-center space-x-4">
              <img
                src={
                  user?.photoURL ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                }
                alt="Profile"
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  {user?.displayName || "User"}
                </h1>
                <p className={isDark ? "text-slate-400" : "text-gray-500"}>{user?.email}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className={`text-lg font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                Account Information
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Email
                  </label>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-100" : "text-gray-900"}`}>{user?.email}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Account Created
                  </label>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {user?.metadata?.creationTime
                      ? new Date(
                          user.metadata.creationTime
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Last Sign In
                  </label>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {user?.metadata?.lastSignInTime
                      ? new Date(
                          user.metadata.lastSignInTime
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign in/out
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
