// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_RESPONSE") {
    // Combine selected text with static string
    const generatedResponse = `${message.selectedText} hello world`;
    
    // Log the generated response
    console.log("Generated response:", generatedResponse);
    
    // TODO: Implement response injection into comment field
    // This will be implemented in the next steps
  }
}); 