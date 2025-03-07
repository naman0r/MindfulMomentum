const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Auth
export const loginUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Journal endpoints
export const getJournals = async (token) => {
  const response = await fetch(`${BASE_URL}/get/journals`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const getJournalById = async (id, token) => {
  const response = await fetch(`${BASE_URL}/get/journal/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const addJournal = async (journalData, token) => {
  const response = await fetch(`${BASE_URL}/add/journal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(journalData),
  });
  return response.json();
};

export const deleteJournal = async (id, token) => {
  const response = await fetch(`${BASE_URL}/delete/journal/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Tasks endpoints
export const getTasks = async (token) => {
  const response = await fetch(`${BASE_URL}/get/tasks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const addTask = async (taskData, token) => {
  const response = await fetch(`${BASE_URL}/add/task`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
  return response.json();
};

export const deleteTask = async (taskId, token) => {
  const response = await fetch(`${BASE_URL}/delete/task/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const toggleTask = async (taskId, token) => {
  const response = await fetch(`${BASE_URL}/toggle/task/${taskId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Habits endpoints
export const getHabits = async (token) => {
  const response = await fetch(`${BASE_URL}/get/habits`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
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
