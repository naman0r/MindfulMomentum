let focusMode = false;
let blockedSites = [];

// Load blocked sites
chrome.storage.sync.get(["blockedSites"], (result) => {
  blockedSites = result.blockedSites || [];
});

// Listen for changes to blocked sites
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SAVE_TOKEN") {
    chrome.storage.sync.set({ token: request.token }, () => {
      console.log("Token saved in extension storage");
    });
  }
  switch (request.type) {
    case "START_FOCUS":
      focusMode = true;
      break;
    case "END_FOCUS":
      focusMode = false;
      break;
  }
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
    return true; // Required for async response
  }
);
