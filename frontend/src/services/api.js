const BASE_URL = "http://localhost:8000/api"; // Updated port to match backend

// get a user's habits
export const getHabits = async (userId) => {
  try {
    console.log("Fetching habits for user:", userId);
    const response = await fetch(`${BASE_URL}/habits/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Received habits:", data);
    return data;
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw error;
  }
};

// Add a New Habit
export const addHabit = async (userId, title) => {
  try {
    console.log("Adding new habit:", { userId, title });
    const response = await fetch(`${BASE_URL}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Added habit:", data);
    return data;
  } catch (error) {
    console.error("Error adding habit:", error);
    throw error;
  }
};

// Mark Habit as Completed
export const completeHabit = async (habitId) => {
  try {
    console.log("Completing habit:", habitId);
    const response = await fetch(`${BASE_URL}/habits/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habitId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Completed habit:", data);
    return data;
  } catch (error) {
    console.error("Error completing habit:", error);
    throw error;
  }
};

//  Fetch Journal Entries
