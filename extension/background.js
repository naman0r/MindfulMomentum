let focusMode = false;
let blockedSites = [];

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
      redirect: { url: "https://mindfulmomentum-frontend.vercel.app/" },
    },
    condition: { urlFilter: `*${site}*`, resourceTypes: ["main_frame"] },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1),
    addRules: focusMode ? rules : [],
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "START_FOCUS":
      focusMode = true;
      updateBlockingRules();
      chrome.tabs.query({}, (tabs) =>
        tabs.forEach((tab) =>
          chrome.tabs.sendMessage(tab.id, {
            type: "FOCUS_MODE_CHANGED",
            enabled: true,
          })
        )
      );
      sendResponse({ success: true });
      break;

    case "END_FOCUS":
      focusMode = false;
      updateBlockingRules();
      chrome.tabs.query({}, (tabs) =>
        tabs.forEach((tab) =>
          chrome.tabs.sendMessage(tab.id, {
            type: "FOCUS_MODE_CHANGED",
            enabled: false,
          })
        )
      );
      sendResponse({ success: true });
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

    default:
      sendResponse({});
      break;
  }
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
