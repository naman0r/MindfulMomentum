import React, { useState } from "react";
import TopNav from "../components/TopNav";

function Productivity() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete project presentation",
      dueDate: "2024-03-05",
      priority: "high",
      completed: false,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Productivity Hub
              </h1>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Add Task
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Due: {task.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === "high"
                          ? "text-red-800 bg-red-100"
                          : task.priority === "medium"
                          ? "text-yellow-800 bg-yellow-100"
                          : "text-green-800 bg-green-100"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <button className="text-sm text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Productivity Stats */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Tasks Completed
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">0/1</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Focus Time
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">0h</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Productivity Score
                </h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">0%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productivity;
