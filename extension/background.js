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
// background.js (updated message handler)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "START_FOCUS":
      focusMode = true;
      sendResponse({ success: true });
      break;

    case "END_FOCUS":
      focusMode = false;
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
  }
  return true;
});

// Block sites during focus mode
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!focusMode) return { cancel: false };
    const url = new URL(details.url);
    if (blockedSites.some((site) => url.hostname.includes(site))) {
      return { redirectUrl: "https://mindfulmomentum-frontend.vercel.app/" };
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
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
