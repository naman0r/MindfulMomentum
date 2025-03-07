import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useAuth } from "../context/AuthContext";

function JournalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user?.uid) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get/journal/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch journal entry");
        }

        const data = await response.json();
        setEntry(data.journal);
      } catch (error) {
        console.error("Error fetching journal entry:", error);
        navigate("/journal");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id, user?.uid, navigate]);

  const handleDeleteEntry = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/delete/journal/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting journal entry:", errorData);
        return;
      }

      navigate("/journal");
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="max-w-3xl mx-auto py-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-5xl mx-auto py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {entry.title}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">
              {entry.mood}
            </span>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={console.log("update functionality not implemented")}
              className="px-4 py-2 text-gray-900 bg-blue-200 rounded-md hover:bg-gray-300"
            >
              Update
            </button>
            <button
              onClick={() => navigate("/journal")}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Back to Journal
            </button>
            <button
              onClick={() => {
                // Add delete functionality here
                navigate("/journal");
              }}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalView;
