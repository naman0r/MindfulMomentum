import React, { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import { useAuth } from "../context/AuthContext";
import { getHabits, addHabit, completeHabit } from "../services/api";

function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadHabits();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading habits for user:", user.uid);
      const userHabits = await getHabits(user.uid);
      console.log("Loaded habits:", userHabits);
      setHabits(userHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
      setError("Failed to load habits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    try {
      setError(null);
      console.log("Adding new habit:", newHabitTitle);
      await addHabit(user.uid, newHabitTitle);
      setNewHabitTitle("");
      setIsAddingHabit(false);
      await loadHabits();
    } catch (error) {
      console.error("Error adding habit:", error);
      setError("Failed to add habit. Please try again.");
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      setError(null);
      console.log("Completing habit:", habitId);
      await completeHabit(habitId);
      await loadHabits();
    } catch (error) {
      console.error("Error completing habit:", error);
      setError("Failed to complete habit. Please try again.");
    }
  };

  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    const sortedDates = completedDates
      .map((date) => new Date(date))
      .sort((a, b) => b - a);

    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const diff =
        (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const renderCompletionCircles = (completedDates) => {
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    return lastSevenDays.map((date, index) => (
      <div
        key={index}
        className={`w-8 h-8 rounded-full ${
          completedDates?.includes(date) ? "bg-green-500" : "bg-gray-200"
        }`}
      />
    ));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Please log in to view your habits
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Habits</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading habits...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No habits yet. Add your first habit to get started!
                  </div>
                ) : (
                  habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {habit.title}
                          </h3>
                          {habit.reminder_time && (
                            <p className="text-sm text-gray-500">
                              Daily at {habit.reminder_time}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                            Streak: {calculateStreak(habit.completed_dates)}{" "}
                            days
                          </span>
                          <button
                            onClick={() => handleCompleteHabit(habit.id)}
                            className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex space-x-1">
                          {renderCompletionCircles(habit.completed_dates)}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Add New Habit Form */}
                {isAddingHabit ? (
                  <form
                    onSubmit={handleAddHabit}
                    className="bg-white shadow rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        placeholder="Enter habit name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingHabit(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingHabit(true)}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add New Habit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Habits;
