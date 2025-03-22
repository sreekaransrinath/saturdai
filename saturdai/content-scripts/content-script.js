console.log('Content script loaded');

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  console.log('Message type:', message.type);
  
  if (message.type === "GENERATE_RESPONSE") {
    console.log('Processing GENERATE_RESPONSE message');
    console.log('Selected text:', message.selectedText);
    
    // Get the current selection
    const selection = window.getSelection();
    console.log('Current selection:', selection);
    
    if (!selection || selection.rangeCount === 0) {
      console.warn('No text selected');
      return false;
    }
    
    // Get the selection range
    const range = selection.getRangeAt(0);
    console.log('Selection range:', range);
    
    // Get the bounding rectangle of the selection
    const rect = range.getBoundingClientRect();
    console.log('Selection bounds:', {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
    
    // Combine selected text with static string
    const generatedResponse = `${message.selectedText} hello world`;
    console.log('Generated response:', generatedResponse);
    
    // Inject the response into the comment field
    console.log('Attempting to inject response...');
    window.injectResponse(generatedResponse, selection).then(success => {
      console.log('Injection result:', success);
      if (!success) {
        console.warn('Failed to inject response into comment field');
      }
    }).catch(error => {
      console.error('Error during injection:', error);
      console.error('Error stack:', error.stack);
    });
  } else {
    console.log('Ignoring message of type:', message.type);
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
}); 