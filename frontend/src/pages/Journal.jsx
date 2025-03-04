import React, { useState } from "react";
import TopNav from "../components/TopNav";

function Journal() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2024-03-04",
      title: "Morning Reflection",
      content:
        "Today I woke up feeling energized and ready to tackle my goals...",
      mood: "happy",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Journal</h1>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                New Entry
              </button>
            </div>

            {/* Journal Entries List */}
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-gray-500">{entry.date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      {entry.mood}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button className="text-sm text-indigo-600 hover:text-indigo-900">
                      Read More
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Journal;
