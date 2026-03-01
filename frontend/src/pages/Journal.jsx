import React, { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

function Journal() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral",
  });

  const token = localStorage.getItem("token");
  const isDark = theme === "dark";

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
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
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
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
      <TopNav />
      <div className="max-w-6xl mx-auto py-6">
        <div
          className={`rounded-3xl border p-5 ${
            isDark
              ? "border-slate-800 bg-slate-900 shadow-[0_24px_80px_rgba(2,6,23,0.55)]"
              : "border-4 border-dashed border-gray-200 bg-transparent"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                My Journals
              </h1>
              <div className="flex items-center">
                <input
                  id="preview-toggle"
                  type="checkbox"
                  checked={showPreview}
                  onChange={() => setShowPreview(!showPreview)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
                />
                <label
                  htmlFor="preview-toggle"
                  className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}
                >
                  Show Preview
                </label>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {showForm ? "Cancel" : "New Entry"}
            </button>
          </div>

          {/* New Entry Form */}
          {showForm && (
            <div
              className={`mb-6 rounded-2xl p-4 ${
                isDark
                  ? "bg-slate-950/70 shadow-[0_18px_40px_rgba(2,6,23,0.45)] ring-1 ring-slate-800"
                  : "bg-white shadow"
              }`}
            >
              <h2 className={`mb-3 text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                Create a Journal Entry
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, title: e.target.value })
                }
                className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    : ""
                }`}
              />
              <textarea
                placeholder="Write your thoughts here..."
                value={newEntry.content}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, content: e.target.value })
                }
                className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    : ""
                }`}
              />
              <label className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                Mood
              </label>
              <select
                value={newEntry.mood}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, mood: e.target.value })
                }
                className={`mb-3 w-full rounded-md border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-100"
                    : ""
                }`}
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
                  className={`rounded-md px-4 py-2 ${
                    isDark
                      ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
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
              <p className={`text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                No journal entries yet! Add one above.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-4 ${
                    isDark
                      ? "bg-slate-950/75 shadow-[0_16px_36px_rgba(2,6,23,0.4)] ring-1 ring-slate-800"
                      : "bg-white shadow"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                        {entry.title}
                      </h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                        {entry.created_at?.split("T")[0]}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      {entry.mood}
                    </span>
                  </div>

                  {showPreview && (
                    <p className={`mt-2 line-clamp-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                      {entry.content}
                    </p>
                  )}

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
