import React, { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Productivity() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "3000-04-20", // make default something ridiculous
    priority: 5,
  });

  const token = localStorage.getItem("token");
  const isDark = theme === "dark";

  useEffect(() => {
    if (!user || !token) return;

    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/get/tasks`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Error fetching tasks");
          return;
        }

        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [user, token]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/add/task`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        }
      );

      if (!response.ok) {
        console.error("Error adding task");
        return;
      }

      const updatedTasks = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get/tasks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());

      setTasks(updatedTasks.tasks || []);
      setShowForm(false);
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: 5,
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete/task/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Error deleting task");
        return;
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/toggle/task/${taskId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Error toggling task completion");
        return;
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  // Compute Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const productivityScore =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div
            className={`rounded-3xl p-4 ${
              isDark
                ? "border border-slate-800 bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.5)]"
                : "rounded-lg border-4 border-dashed border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                Productivity Hub
              </h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {showForm ? "Cancel" : "Add Task"}
              </button>
            </div>

            {/* Task Form */}
            {showForm && (
              <div
                className={`mb-6 rounded-lg p-4 ${
                  isDark
                    ? "bg-slate-950/70 shadow-[0_18px_40px_rgba(2,6,23,0.45)] ring-1 ring-slate-800"
                    : "bg-white shadow"
                }`}
              >
                <h2 className={`mb-3 text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  Create a Task
                </h2>
                <input
                  type="text"
                  placeholder="Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                      : ""
                  }`}
                />
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                      : ""
                  }`}
                />
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100"
                      : ""
                  }`}
                />

                <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newTask.priority}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const priority = Math.min(10, Math.max(1, value || 1)); // Ensure value is between 1 and 10
                    setNewTask({ ...newTask, priority: priority });
                  }}
                  className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100"
                      : ""
                  }`}
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => setShowForm(false)}
                    className={`rounded-md px-4 py-2 ${
                      isDark
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between rounded-lg p-4 ${
                    isDark
                      ? "bg-slate-950/70 shadow-[0_16px_36px_rgba(2,6,23,0.42)] ring-1 ring-slate-800"
                      : "bg-white shadow"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className={`h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 ${
                        isDark ? "border-slate-700 bg-slate-900" : "border-gray-300"
                      }`}
                    />
                    <div>
                      <h3 className={`text-lg font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                        Due: {task.due_date}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div
                className={`rounded-lg p-4 ${
                  isDark
                    ? "bg-slate-950/70 shadow-[0_16px_36px_rgba(2,6,23,0.42)] ring-1 ring-slate-800"
                    : "bg-white shadow"
                }`}
              >
                <h3 className={`text-lg font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  Tasks Completed
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {completedTasks}/{totalTasks}
                </p>
              </div>

              <div
                className={`overflow-hidden rounded-lg ${
                  isDark
                    ? "bg-slate-950/70 shadow-[0_16px_36px_rgba(2,6,23,0.42)] ring-1 ring-slate-800"
                    : "bg-white shadow"
                }`}
              >
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
                        <dt className={`font-medium truncate ${isDark ? "text-slate-100" : "text-black"}`}>
                          Focus Time Today
                        </dt>
                        <dd className="mt-2 text-3xl font-bold text-indigo-600">
                          0h
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden rounded-lg ${
                  isDark
                    ? "bg-slate-950/70 shadow-[0_16px_36px_rgba(2,6,23,0.42)] ring-1 ring-slate-800"
                    : "bg-white shadow"
                }`}
              >
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
                        <dt className={`text-sm font-medium truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                          Productivity Score
                        </dt>
                        <dd className="mt-2 text-3xl font-bold text-indigo-600">
                          100%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productivity;
