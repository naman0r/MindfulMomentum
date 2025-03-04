import React from "react";
import TopNav from "../components/TopNav";

function Habits() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Habits</h1>

            {/* Habit List */}
            <div className="space-y-4">
              {/* Example Habit Card */}
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Morning Meditation
                    </h3>
                    <p className="text-sm text-gray-500">Daily at 7:00 AM</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Streak: 5 days
                    </span>
                    <button className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                      Complete
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${
                          i < 5 ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Add New Habit Button */}
              <button className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add New Habit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Habits;
