// Register context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "writeResponse",
    title: "Write Response",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "writeResponse") {
    chrome.tabs.sendMessage(tab.id, {
      type: "GENERATE_RESPONSE",
      selectedText: info.selectionText
    });
  }
}); 