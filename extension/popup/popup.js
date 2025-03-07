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

      const response = await fetch("http://localhost:8000/api/get/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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
        `http://localhost:8000/api/toggle/task/${taskId}`,
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

// Focus mode
let focusTimer;
let timeLeft = 25 * 60; // 25 minutes in seconds

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

document.getElementById("start-focus").addEventListener("click", () => {
  document.getElementById("start-focus").disabled = true;
  document.getElementById("stop-focus").disabled = false;

  chrome.runtime.sendMessage({ type: "START_FOCUS" });

  focusTimer = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(focusTimer);
      chrome.runtime.sendMessage({ type: "END_FOCUS" });
      resetTimer();
    }
  }, 1000);
});

document.getElementById("stop-focus").addEventListener("click", () => {
  clearInterval(focusTimer);
  chrome.runtime.sendMessage({ type: "END_FOCUS" });
  resetTimer();
});

function resetTimer() {
  timeLeft = 25 * 60;
  updateTimer();
  document.getElementById("start-focus").disabled = false;
  document.getElementById("stop-focus").disabled = true;
}

// Blocked sites management
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
    blockedSites.push(site);
    chrome.storage.sync.set({ blockedSites });
    renderBlockedSites();
    input.value = "";
  }
});

function removeSite(site) {
  blockedSites = blockedSites.filter((s) => s !== site);
  chrome.storage.sync.set({ blockedSites });
  renderBlockedSites();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
  loadBlockedSites();
  updateTimer();
});
