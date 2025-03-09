chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "FOCUS_MODE_CHANGED") {
    if (request.enabled && !document.getElementById("focus-mode-indicator")) {
      console.log("focus mode started. ");
    } else if (!request.enabled) {
      console.log("focus mode stopped. ");
    }
  }
});
