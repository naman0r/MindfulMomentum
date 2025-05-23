// Tab switching
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.add("hidden"));

    button.classList.add("active");
    document
      .getElementById(`${button.dataset.tab}-tab`)
      .classList.remove("hidden");
  });
});

// Task management
let tasks = [];

async function fetchTasks() {
  try {
    // Get token from chrome.storage instead of localStorage
    chrome.storage.sync.get(["token"], async (result) => {
      const token = result.token;
      console.log("Token:", token); // Debug log

      if (!token) {
        console.error("No token found");
        const tasksList = document.getElementById("tasks-list");
        tasksList.innerHTML = "<p>Please log in to view tasks</p>";
        return;
      }

      const response = await fetch(
        "https://mindfulmomentum-backend-take2-production.up.railway.app/api/get/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) throw new Error("Failed to fetch tasks");

      const data = await response.json();
      console.log("Tasks data:", data); // Debug log

      tasks = data.tasks || [];
      renderTasks();
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    const tasksList = document.getElementById("tasks-list");
    tasksList.innerHTML = "<p>Error loading tasks</p>";
  }
}

function renderTasks() {
  const tasksList = document.getElementById("tasks-list");
  tasksList.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task-item";
    taskElement.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""}>
      <span>${task.title}</span>
    `;

    const checkbox = taskElement.querySelector("input");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    tasksList.appendChild(taskElement);
  });
}

async function toggleTask(taskId) {
  try {
    chrome.storage.sync.get(["token"], async (result) => {
      const token = result.token;
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `https://mindfulmomentum-backend-take2-production.up.railway.app/api/toggle/task/${taskId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to toggle task");
      fetchTasks(); // Refresh tasks after toggle
    });
  } catch (error) {
    console.error("Error toggling task:", error);
  }
}

// Focus mode and Timer
const MIN_SECONDS = 60; // 1 minute
const MAX_SECONDS = 80 * 60; // 80 minutes
let currentSeconds = 25 * 60; // 25 minutes default

function initializeTimer() {
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
    if (response && response.timerState) {
      currentSeconds = response.timerState.timeLeft;
      updateTimerDisplay(currentSeconds);
      updateFocusControls(response.timerState.isRunning);
    }
  });
}

document.getElementById("increase-time").addEventListener("click", () => {
  if (currentSeconds < MAX_SECONDS && !isTimerRunning()) {
    currentSeconds += 60;
    updateTimerDisplay(currentSeconds);
    chrome.runtime.sendMessage({
      type: "UPDATE_TIMER_DURATION",
      duration: currentSeconds,
    });
  }
});

document.getElementById("decrease-time").addEventListener("click", () => {
  if (currentSeconds > MIN_SECONDS && !isTimerRunning()) {
    currentSeconds -= 60;
    updateTimerDisplay(currentSeconds);
    chrome.runtime.sendMessage({
      type: "UPDATE_TIMER_DURATION",
      duration: currentSeconds,
    });
  }
});

function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

  // Update button states
  const isRunning = isTimerRunning();
  document.getElementById("increase-time").disabled =
    seconds >= MAX_SECONDS || isRunning;
  document.getElementById("decrease-time").disabled =
    seconds <= MIN_SECONDS || isRunning;
}

function isTimerRunning() {
  return !document.getElementById("start-focus").disabled;
}

function updateFocusControls(isRunning) {
  document.getElementById("start-focus").disabled = isRunning;
  document.getElementById("stop-focus").disabled = !isRunning;
  document.getElementById("increase-time").disabled = isRunning;
  document.getElementById("decrease-time").disabled = isRunning;
}

// Update timer display every second
const updateInterval = setInterval(() => {
  chrome.runtime.sendMessage({ type: "GET_STATE" }, (response) => {
    if (response && response.timerState) {
      currentSeconds = response.timerState.timeLeft;
      updateTimerDisplay(currentSeconds);
      updateFocusControls(response.timerState.isRunning);
    }
  });
}, 1000);

document.getElementById("start-focus").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "START_FOCUS" }, (response) => {
    if (response && response.timerState) {
      currentSeconds = response.timerState.timeLeft;
      updateTimerDisplay(currentSeconds);
      updateFocusControls(response.timerState.isRunning);
    }
  });
});

document.getElementById("stop-focus").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "END_FOCUS" }, (response) => {
    if (response && response.timerState) {
      currentSeconds = response.timerState.timeLeft;
      updateTimerDisplay(currentSeconds);
      updateFocusControls(response.timerState.isRunning);
    }
  });
});

// Blocked sites management
// popup.js (corrected blocked sites management)
let blockedSites = [];

function loadBlockedSites() {
  chrome.storage.sync.get(["blockedSites"], (result) => {
    blockedSites = result.blockedSites || [];
    renderBlockedSites();
  });
}

function renderBlockedSites() {
  const sitesList = document.getElementById("blocked-sites-list");
  sitesList.innerHTML = "";

  blockedSites.forEach((site) => {
    const siteElement = document.createElement("li");
    siteElement.className = "blocked-site";
    siteElement.innerHTML = `
      <span>${site}</span>
      <button class="remove-site">Remove</button>
    `;
    siteElement
      .querySelector(".remove-site")
      .addEventListener("click", () => removeSite(site));
    sitesList.appendChild(siteElement);
  });
}

document.getElementById("add-site").addEventListener("click", () => {
  const input = document.getElementById("site-input");
  const site = input.value.trim();

  if (site && !blockedSites.includes(site)) {
    chrome.runtime.sendMessage({ type: "ADD_BLOCKED_SITE", site }, () => {
      loadBlockedSites();
      input.value = "";
    });
  }
});

function removeSite(site) {
  chrome.runtime.sendMessage({ type: "REMOVE_BLOCKED_SITE", site }, () => {
    loadBlockedSites();
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
  loadBlockedSites();
  initializeTimer();
});
