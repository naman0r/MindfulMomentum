let focusMode = false;
let blockedSites = [];
let currentSeconds = 25 * 60; // Default 25 minutes in seconds
let timerInterval = null;

chrome.storage.sync.get(["blockedSites"], (result) => {
  blockedSites = result.blockedSites || [];
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue || [];
    updateBlockingRules();
  }
});

async function updateBlockingRules() {
  const rules = blockedSites.map((site, idx) => ({
    id: idx + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { url: "https://mindfulmomentum.vercel.app/blocked/" },
    },
    condition: { urlFilter: `*${site}*`, resourceTypes: ["main_frame"] },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1),
    addRules: focusMode ? rules : [],
  });
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (currentSeconds > 0) {
      currentSeconds--;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      focusMode = false;
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon48.png",
        title: "Focus Session Complete",
        message: "Great job! Your focus session is complete.",
      });
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "START_FOCUS":
      focusMode = true;
      startTimer();
      updateBlockingRules();
      chrome.tabs.query({}, (tabs) =>
        tabs.forEach((tab) =>
          chrome.tabs.sendMessage(tab.id, {
            type: "FOCUS_MODE_CHANGED",
            enabled: true,
          })
        )
      );
      sendResponse({
        success: true,
        timerState: { isRunning: focusMode, timeLeft: currentSeconds },
      });
      break;

    case "END_FOCUS":
      focusMode = false;
      stopTimer();
      updateBlockingRules();
      chrome.tabs.query({}, (tabs) =>
        tabs.forEach((tab) =>
          chrome.tabs.sendMessage(tab.id, {
            type: "FOCUS_MODE_CHANGED",
            enabled: false,
          })
        )
      );
      sendResponse({
        success: true,
        timerState: { isRunning: focusMode, timeLeft: currentSeconds },
      });
      break;

    case "UPDATE_TIMER_DURATION":
      currentSeconds = request.duration;
      sendResponse({
        success: true,
        timerState: { isRunning: focusMode, timeLeft: currentSeconds },
      });
      break;

    case "ADD_BLOCKED_SITE":
      if (!blockedSites.includes(request.site)) {
        blockedSites.push(request.site);
        chrome.storage.sync.set({ blockedSites });
      }
      sendResponse({ success: true });
      break;

    case "REMOVE_BLOCKED_SITE":
      blockedSites = blockedSites.filter((site) => site !== request.site);
      chrome.storage.sync.set({ blockedSites });
      sendResponse({ success: true });
      break;

    case "GET_BLOCKED_SITES":
      sendResponse({ sites: blockedSites });
      break;

    case "GET_STATE":
      sendResponse({
        timerState: {
          isRunning: focusMode,
          timeLeft: currentSeconds,
        },
      });
      break;

    default:
      sendResponse({});
      break;
  }

  // Important for async responses
  return true;
});

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
