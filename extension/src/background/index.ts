// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("GeM-Intel Extension Installed.");
});

// Pass messages if needed, handle auth tokens later.
