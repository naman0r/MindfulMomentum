import React, { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) return;

    const fetchJournals = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/get/journals`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching journals:", errorData);
          return;
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (Array.isArray(data.journals)) {
          setEntries(data.journals);
        } else {
          console.error("Unexpected API response format:", data);
          setEntries([]);
        }
      } catch (error) {
        console.error("Error fetching journals:", error);
        setEntries([]);
      }
    };

    fetchJournals();
  }, [user, token]);

  const handleAddEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/add/journal`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEntry),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding journal entry:", errorData);
        return;
      }

      const updatedResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get/journals`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedData = await updatedResponse.json();

      if (Array.isArray(updatedData.journals)) {
        setEntries(updatedData.journals);
      }

      setShowForm(false);
      setNewEntry({ title: "", content: "", mood: "neutral" });
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delete/journal/${entryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting journal entry:", errorData);
        return;
      }

      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== entryId)
      );

      console.log(`Deleted entry ${entryId} successfully`);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-6xl mx-auto py-6">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Journal</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {showForm ? "Cancel" : "New Entry"}
            </button>
          </div>

          {/* New Entry Form */}
          {showForm && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Create a Journal Entry
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <textarea
                placeholder="Write your thoughts here..."
                value={newEntry.content}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, content: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <label className="block text-sm font-medium text-gray-700">
                Mood
              </label>
              <select
                value={newEntry.mood}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, mood: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md mb-3 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="neutral">Neutral</option>
                <option value="anxious">Anxious</option>
                <option value="excited">Excited</option>
                <option value="tired">Tired</option>
              </select>
              <div className="flex justify-between">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEntry}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Save Entry
                </button>
              </div>
            </div>
          )}

          {/* Journal Entries List */}
          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-gray-500 text-center">
                No journal entries yet! Add one above.
              </p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {entry.created_at.split("T")[0]}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      {entry.mood}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link
                      to={`/journal/${entry.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Read More
                    </Link>
                    <button
                      className="text-sm text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Journal;
