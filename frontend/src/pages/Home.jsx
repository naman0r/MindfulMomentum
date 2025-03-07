import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth(); // global state management- at least my attempt at it.
  const [activeHabits, setActiveHabits] = useState(0);
  const [numJournalEntries, setNumEntries] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHabits = async () => {
      if (user?.uid) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/get/habits`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          setActiveHabits(data.length);
        } catch (error) {
          console.error("Error fetching habits:", error);
        }
      }
    };

    fetchHabits();
  }, [user?.uid]); // Re-run when user changes

  useEffect(() => {
    const fetchNumEntries = async () => {
      if (user?.uid) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/get/journals`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          setNumEntries(data.journals.length);
        } catch (error) {
          console.error("Error fetching habits:", error);
        }
      }
    };

    fetchNumEntries();
  }, [user?.uid]); // Re-run when user changes

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome back, {user?.displayName.split(" ")[0] || "Guest"}!
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Track your habits, journal your thoughts, and boost your
            productivity all in one place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Habits Card */}
          <Link
            to="/habits"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Habit Tracking
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Build and maintain positive habits with daily tracking and
                    streaks.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Journal Card */}
          <Link
            to="/journal"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Journaling
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Reflect on your day and track your emotional well-being.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Productivity Card */}
          <Link
            to="/productivity"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Productivity
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Stay focused and organized with task management and
                    productivity tracking.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Habits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeHabits}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Focus Time Today
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0h</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Journal Entries
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {numJournalEntries}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Productivity Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">100%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
