import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

function Habits() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [habits, setHabits] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [habitData, setHabitData] = useState({
    title: "",
    description: "",
    frequency: "daily",
    days_of_week: [],
    reminder_time: "",
    goal: 1,
  });

  const token = localStorage.getItem("token"); // Retrieve JWT Token.
  const isDark = theme === "dark";

  useEffect(() => {
    if (user && token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get/habits`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log("Response Status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("API Response:", data); // Debugging API response

          if (Array.isArray(data)) {
            setHabits(data);
          } else {
            console.error("Unexpected API response format:", data);
            setHabits([]); // Default to empty array
          }
        })
        .catch((err) => {
          console.error("Error fetching habits:", err);
          setHabits([]); // Default to empty array on error
        });
    }
  }, [user, token]);

  // ✅ FIX: Delete Habit with JWT
  const handleDeleteHabit = async (habitId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete/habit/${habitId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete habit");

      // Update the state to remove the deleted habit
      setHabits((prevHabits) =>
        prevHabits.filter((habit) => habit.id !== habitId)
      );
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  //  Add Habit with JWT
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!habitData.title.trim()) return;

    console.log("Adding habit:", habitData);
    console.log("JWT Token:", token);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/add/habit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(habitData),
        }
      );

      console.log("Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        return;
      }

      const updatedHabits = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get/habits`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());

      console.log("Updated habits:", updatedHabits);

      setHabits(updatedHabits);
      setHabitData({
        title: "",
        description: "",
        frequency: "daily",
        days_of_week: [],
        reminder_time: "",
        goal: 1,
      });
      setFormVisible(false);
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
      <TopNav />
      <div
        className={`m-10 rounded-3xl p-10 ${
          isDark
            ? "border border-slate-800 bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.5)]"
            : "rounded-lg border-4 border-dashed border-gray-200"
        }`}
      >
        <h1 className={`mb-6 text-center font-mono text-3xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
          My Habits
        </h1>

        {/* Habit List */}
        <div className="space-y-4">
          {Array.isArray(habits) && habits.length === 0 ? (
            <p className={`text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              No habits yet! Add one below.
            </p>
          ) : (
            Array.isArray(habits) &&
            habits.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center justify-between rounded-xl p-4 ${
                  isDark
                    ? "bg-slate-950/70 shadow-[0_16px_36px_rgba(2,6,23,0.42)] ring-1 ring-slate-800"
                    : "bg-white shadow-md"
                }`}
              >
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {habit.title}
                  </h3>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {habit.frequency === "daily"
                      ? "Daily"
                      : `Weekly on ${habit.days_of_week.join(", ")}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                    Streak: {habit.streak} days
                  </span>
                  <button className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Complete
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Habit Button */}
        {!formVisible ? (
          <button
            onClick={() => setFormVisible(true)}
            className="w-full mt-6 py-3 text-lg text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Add New Habit
          </button>
        ) : (
          <form
            onSubmit={handleAddHabit}
            className={`mt-6 rounded-lg p-6 ${
              isDark
                ? "bg-slate-950/70 shadow-[0_18px_40px_rgba(2,6,23,0.45)] ring-1 ring-slate-800"
                : "bg-white shadow-md"
            }`}
          >
            <h2 className={`mb-4 text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
              Add a New Habit
            </h2>

            <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              Habit Name
            </label>
            <input
              type="text"
              value={habitData.title}
              onChange={(e) =>
                setHabitData({ ...habitData, title: e.target.value })
              }
              className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                  : ""
              }`}
              required
            />

            <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
              Description
            </label>
            <input
              type="text"
              value={habitData.description}
              onChange={(e) =>
                setHabitData({ ...habitData, description: e.target.value })
              }
              className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                  : ""
              }`}
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                className={`rounded-md px-4 py-2 ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                onClick={handleAddHabit}
              >
                Save Habit
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Habits;
