import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

function Habits() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-10 m-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center font-mono">
          My Habits
        </h1>

        {/* Habit List */}
        <div className="space-y-4">
          {Array.isArray(habits) && habits.length === 0 ? (
            <p className="text-gray-500 text-center">
              No habits yet! Add one below.
            </p>
          ) : (
            Array.isArray(habits) &&
            habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white shadow-md rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {habit.title}
                  </h3>
                  <p className="text-sm text-gray-500">
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
            className="mt-6 bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add a New Habit
            </h2>

            <label className="block text-sm font-medium text-gray-700">
              Habit Name
            </label>
            <input
              type="text"
              value={habitData.title}
              onChange={(e) =>
                setHabitData({ ...habitData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />

            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={habitData.description}
              onChange={(e) =>
                setHabitData({ ...habitData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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
