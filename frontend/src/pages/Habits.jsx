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

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:8000/api/get/habits/${user.uid}`)
        .then((res) => res.json())
        .then(setHabits)
        .catch((err) => console.error("Error fetching habits:", err));
    }
  }, [user]);

  // delete habit function
  const handleDeleteHabit = async (habitId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/delete/habit/${user.uid}/${habitId}`,
        {
          method: "DELETE",
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

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!habitData.title.trim()) return;

    const habitPayload = {
      google_id: user.uid,
      ...habitData,
    };

    try {
      const response = await fetch("http://localhost:8000/api/add/habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitPayload),
      });

      if (response.ok) {
        const updatedHabits = await fetch(
          `http://localhost:8000/api/get/habits/${user.uid}`
        ).then((res) => res.json());
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
      }
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
          {habits.length === 0 ? (
            <p className="text-gray-500 text-center">
              No habits yet! Add one below.
            </p>
          ) : (
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

            <label className="block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <select
              value={habitData.frequency}
              onChange={(e) =>
                setHabitData({ ...habitData, frequency: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>

            {habitData.frequency === "weekly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Days
                </label>
                <div className="flex space-x-2 mb-3">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`px-2 py-1 rounded-md ${
                        habitData.days_of_week.includes(day)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() =>
                        setHabitData((prev) => ({
                          ...prev,
                          days_of_week: prev.days_of_week.includes(day)
                            ? prev.days_of_week.filter((d) => d !== day)
                            : [...prev.days_of_week, day],
                        }))
                      }
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700">
              Reminder Time
            </label>
            <input
              type="time"
              value={habitData.reminder_time}
              onChange={(e) =>
                setHabitData({ ...habitData, reminder_time: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <label className="block text-sm font-medium text-gray-700">
              Daily Goal
            </label>
            <input
              type="number"
              min="1"
              value={habitData.goal}
              onChange={(e) =>
                setHabitData({ ...habitData, goal: parseInt(e.target.value) })
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
