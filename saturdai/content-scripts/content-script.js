// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_RESPONSE") {
    // Log the selected text for now
    console.log("Selected text:", message.selectedText);
    
    // TODO: Implement response generation and injection
    // This will be implemented in the next steps
  }
}); 