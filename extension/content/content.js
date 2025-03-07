// Listen for focus mode changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FOCUS_MODE_CHANGED") {
    if (request.enabled) {
      // Add visual indicator that focus mode is active
      const indicator = document.createElement("div");
      indicator.id = "focus-mode-indicator";
      indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #4f46e5;
        color: white;
        text-align: center;
        padding: 4px;
        z-index: 9999;
      `;
      indicator.textContent = "Focus Mode Active";
      document.body.appendChild(indicator);
    } else {
      // Remove focus mode indicator
      const indicator = document.getElementById("focus-mode-indicator");
      if (indicator) indicator.remove();
    }
  }
});
