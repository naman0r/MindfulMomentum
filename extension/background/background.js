let focusMode = false;
let blockedSites = [];
let timerState = {
  timeLeft: 25 * 60,
  isRunning: false,
  endTime: null,
};

// Load blocked sites and timer state
chrome.storage.sync.get(["blockedSites", "timerState"], (result) => {
  blockedSites = result.blockedSites || [];

  // Restore timer state if it exists
  if (result.timerState) {
    if (result.timerState.isRunning && result.timerState.endTime) {
      const now = Date.now();
      const timeLeft = Math.max(
        0,
        Math.ceil((result.timerState.endTime - now) / 1000)
      );
      if (timeLeft > 0) {
        timerState = result.timerState;
        focusMode = true;
      }
    } else {
      timerState.timeLeft = result.timerState.timeLeft;
    }
  }
});

// Listen for changes to blocked sites
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
  }
});

function updateTimer() {
  if (timerState.isRunning && timerState.endTime) {
    const now = Date.now();
    const timeLeft = Math.max(0, Math.ceil((timerState.endTime - now) / 1000));

    if (timeLeft === 0) {
      // Timer completed
      timerState.isRunning = false;
      timerState.endTime = null;
      focusMode = false;

      // Save state
      chrome.storage.sync.set({ timerState });

      // Notify user
      chrome.notifications.create({
        type: "basic",
        iconUrl: "/icons/icon48.png",
        title: "Focus Session Complete!",
        message: "Great job! Your focus session has ended.",
      });
    } else {
      timerState.timeLeft = timeLeft;
    }
  }
}

// Update timer every second
let timerInterval = setInterval(updateTimer, 1000);

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "START_FOCUS":
      focusMode = true;
      timerState.isRunning = true;
      timerState.endTime = Date.now() + timerState.timeLeft * 1000;
      chrome.storage.sync.set({ timerState });
      sendResponse({ timerState, focusMode });
      break;

    case "END_FOCUS":
      focusMode = false;
      timerState.isRunning = false;
      timerState.endTime = null;
      chrome.storage.sync.set({ timerState });
      sendResponse({ timerState, focusMode });
      break;

    case "GET_STATE":
      updateTimer();
      sendResponse({ timerState, focusMode });
      break;

    case "UPDATE_TIMER_DURATION":
      if (!timerState.isRunning) {
        timerState.timeLeft = request.duration;
        chrome.storage.sync.set({ timerState });
        sendResponse({ timerState, focusMode });
      }
      break;

    case "SAVE_TOKEN":
      chrome.storage.sync.set({ token: request.token }, () => {
        console.log("Token saved in extension storage");
        sendResponse({ success: true });
      });
      break;
  }
  return true;
});

// Block sites during focus mode
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!focusMode) return { cancel: false };

    const url = new URL(details.url);
    const domain = url.hostname;

    if (blockedSites.some((site) => domain.includes(site))) {
      return {
        redirectUrl: chrome.runtime.getURL("blocked.html"),
      };
    }

    return { cancel: false };
  },
  {
    urls: ["<all_urls>"],
  },
  ["blocking"]
);

// Handle external messages (from the web app)
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log("Received external message:", request);
    if (request.type === "SAVE_TOKEN") {
      try {
        chrome.storage.sync.set({ token: request.token }, () => {
          console.log("Token saved in extension storage");
          sendResponse({ success: true });
        });
      } catch (error) {
        console.error("Error saving token:", error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true;
  }
);
