// Platform-specific selectors and injection logic
const PLATFORMS = {
  TWITTER: {
    hostname: 'twitter.com',
    postContainerSelectors: [
      'article[data-testid="tweet"]',
      'article[data-testid="tweet"]:has([data-testid="reply"])',
      'article[data-testid="tweet"]:has([data-testid="tweetText"])'
    ],
    replyButtonSelectors: [
      '[data-testid="reply"]',
      '[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]'
    ],
    commentBoxSelectors: [
      '[data-testid="tweetTextarea_0"]',
      '[data-testid="tweetTextarea_1"]',
      '[data-testid="tweetTextarea_2"]',
      '[data-testid="tweetTextarea_3"]'
    ]
  },
  X: {
    hostname: 'x.com',
    postContainerSelectors: [
      'article[data-testid="tweet"]',
      'article[data-testid="tweet"]:has([data-testid="reply"])',
      'div[data-testid="tweetDetailBottomContainer"]',
      'div[data-testid="cellInnerDiv"]',
      'div[data-testid="primaryColumn"]'
    ],
    replyButtonSelectors: [
      '[data-testid="reply"]',
      '[aria-label*="Reply"]',
      'div[aria-label*="Reply"]'
    ],
    // We need both the contenteditable div and the span inside it
    commentBoxSelectors: [
      // Primary targets - the actual input fields
      'div[data-testid="tweetTextarea_0"]',
      'div[data-testid="tweetTextarea_1"]',
      'div[data-testid="tweetTextarea_0"] div[contenteditable="true"]',
      'div[data-testid="tweetTextarea_1"] div[contenteditable="true"]',
      // Broader selectors
      'div[contenteditable="true"][role="textbox"]',
      'div[role="textbox"][aria-multiline="true"]',
      // Last resorts
      'div[contenteditable="true"]'
    ],
    // Special flags for X.com
    needsDeepSearch: true,
    useClipboardFallback: false
  },
  LINKEDIN: {
    hostname: 'linkedin.com',
    postContainerSelectors: [
      '.feed-shared-update-v2',
      '.feed-shared-update-v2:has([data-control-name="comment_icon"])',
      '.feed-shared-update-v2:has(.feed-shared-update-v2__description)',
      '.comments-comment-item',
      '.comments-comments-list',
      '.comments-container',
      '.feed-shared-social-actions'
    ],
    replyButtonSelectors: [
      '[data-control-name="comment_icon"]',
      '[data-control-name="reply_comment"]',
      '.comments-comment-box__open-box-button',
      'button[aria-label*="comment"]',
      'button[aria-label*="Comment"]',
      'button:has(span:contains("Comment"))',
      'button.artdeco-button:has(li-icon[type="comment-icon"])',
      '.feed-shared-social-action-bar__action-button:has(li-icon[type="comment-icon"])'
    ],
    commentBoxSelectors: [
      '[data-placeholder="Add a comment..."]',
      '[data-placeholder="Write a comment..."]',
      '.ql-editor',
      '[contenteditable="true"][role="textbox"]',
      '[contenteditable="true"][aria-label*="comment"]',
      '.comments-comment-box__content [contenteditable="true"]',
      '.comments-comment-texteditor__content'
    ]
  }
};

// Get the current platform based on hostname
function getCurrentPlatform() {
  console.log('Checking current platform...');
  const hostname = window.location.hostname;
  console.log('Current hostname:', hostname);
  
  if (hostname.includes(PLATFORMS.TWITTER.hostname)) {
    console.log('Detected Twitter platform');
    return PLATFORMS.TWITTER;
  } else if (hostname.includes(PLATFORMS.X.hostname)) {
    console.log('Detected X.com platform');
    return PLATFORMS.X;
  } else if (hostname.includes(PLATFORMS.LINKEDIN.hostname)) {
    console.log('Detected LinkedIn platform');
    return PLATFORMS.LINKEDIN;
  }
  console.log('No supported platform detected');
  return null;
}

// Find the post container that contains the selected text
function findPostContainer(platform, selection) {
  console.log('Finding post container...');
  
  // Get the anchor node from the selection
  const anchorNode = selection.anchorNode;
  console.log('Selection anchor node:', anchorNode);
  
  // First try to find the post container by climbing up the DOM
  let currentNode = anchorNode;
  while (currentNode && currentNode !== document.body) {
    // Check if current node matches any post container selectors
    for (const selector of platform.postContainerSelectors) {
      if (currentNode.matches && currentNode.matches(selector)) {
        console.log('Found post container by DOM traversal:', currentNode);
        return currentNode;
      }
    }
    currentNode = currentNode.parentNode;
  }
  
  // If not found by traversal, try finding by proximity
  console.log('Post container not found by traversal, trying proximity search');
  const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
  const selectionCenter = {
    x: selectionRect.left + selectionRect.width / 2,
    y: selectionRect.top + selectionRect.height / 2
  };
  
  // Find all potential post containers
  for (const selector of platform.postContainerSelectors) {
    const containers = document.querySelectorAll(selector);
    for (const container of containers) {
      const rect = container.getBoundingClientRect();
      const containerCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      // Calculate distance between selection and container
      const distance = Math.sqrt(
        Math.pow(selectionCenter.x - containerCenter.x, 2) +
        Math.pow(selectionCenter.y - containerCenter.y, 2)
      );
      
      // If container is within 500px of selection, consider it a match
      if (distance < 500) {
        console.log('Found post container by proximity:', container);
        return container;
      }
    }
  }
  
  console.log('No post container found');
  return null;
}

// Find and click the reply button within a post container
async function findAndClickReplyButton(platform, postContainer) {
  console.log('Looking for reply button in post container');
  
  for (const selector of platform.replyButtonSelectors) {
    const replyButton = postContainer.querySelector(selector);
    if (replyButton) {
      console.log('Found reply button:', replyButton);
      replyButton.click();
      return true;
    }
  }
  
  console.log('No reply button found');
  return false;
}

// Wait for an element to appear in the DOM
async function waitForElement(selector, timeout = 5000) {
  console.log(`Waiting for element: ${selector}`);
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`Found element: ${selector}`);
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Timeout waiting for element: ${selector}`);
  return null;
}

// Main function to inject text into the comment box
async function injectResponse(text, selection) {
  console.log('Starting text injection...');
  console.log('Text to inject:', text);
  
  const platform = getCurrentPlatform();
  if (!platform) {
    console.warn('Unsupported platform - injection failed');
    return false;
  }

  // Step 1: Find the post container
  const postContainer = findPostContainer(platform, selection);
  if (!postContainer) {
    console.warn('Could not find post container');
    return false;
  }

  // Step 2: Try to find existing comment box
  let commentBox = null;
  for (const selector of platform.commentBoxSelectors) {
    commentBox = postContainer.querySelector(selector);
    if (commentBox) {
      console.log('Found existing comment box:', commentBox);
      break;
    }
  }

  // Step 3: If no comment box found, try to reveal it
  if (!commentBox) {
    console.log('No existing comment box found, trying to reveal it');
    const buttonClicked = await findAndClickReplyButton(platform, postContainer);
    if (buttonClicked) {
      // Wait significantly longer for X.com since its UI takes time to update
      const waitTime = platform === PLATFORMS.X ? 2500 : 500;
      console.log(`Waiting ${waitTime}ms for UI to update...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Wait for comment box to appear - first try to find it within the post container
      for (const selector of platform.commentBoxSelectors) {
        // Try to find the comment box within the post container first
        commentBox = postContainer.querySelector(selector);
        if (commentBox) {
          console.log('Found comment box within post container after clicking reply:', commentBox);
          break;
        }
        
        // If not found in post container, try document-wide search
        commentBox = await waitForElement(selector);
        if (commentBox) {
          console.log('Found comment box in document after clicking reply:', commentBox);
          break;
        }
      }
      
      // Special handling for X.com - sometimes we need to look deeper in the DOM
      if (!commentBox && platform.needsDeepSearch) {
        console.log('Using deep search for X.com');
        
        // Wait a bit more for X.com's UI to fully render
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Look for any contenteditable elements that appeared after clicking
        const editableElements = document.querySelectorAll('div[contenteditable="true"]');
        console.log(`Found ${editableElements.length} contenteditable elements in document`);
        
        // First try to find elements with specific attributes
        for (const element of editableElements) {
          // Check if this element is visible and likely the reply box
          if (element.offsetParent !== null && 
              (element.getAttribute('role') === 'textbox' ||
               element.getAttribute('aria-multiline') === 'true')) {
            commentBox = element;
            console.log('Found X.com reply box through deep search:', commentBox);
            break;
          }
        }
        
        // If still not found, look for any visible contenteditable
        if (!commentBox) {
          console.log('Trying to find any visible contenteditable element');
          for (const element of editableElements) {
            if (element.offsetParent !== null && 
                window.getComputedStyle(element).display !== 'none' &&
                element.clientHeight > 20) { // Must be reasonably sized
              commentBox = element;
              console.log('Found visible contenteditable element:', commentBox);
              break;
            }
          }
        }
        
        // If we found a contenteditable div, check for the specific X.com DOM structure
        if (commentBox) {
          // First check for the initial state with <br data-text="true">
          const brDataText = commentBox.querySelector('br[data-text="true"]');
          if (brDataText) {
            console.log('Found initial state with <br data-text="true">');
            // Store a reference to the parent span and the br element
            const parentSpan = brDataText.parentElement;
            if (parentSpan) {
              commentBox.initialStateSpan = parentSpan;
              commentBox.brDataText = brDataText;
              console.log('Stored reference to parent span and br element');
            }
          } else {
            // Check for the state after typing with span[data-text="true"]
            const textSpan = commentBox.querySelector('span[data-text="true"]');
            if (textSpan) {
              console.log('Found span[data-text="true"] inside the contenteditable div');
              // Store the span reference for later use
              commentBox.textSpan = textSpan;
            }
          }
          
          // Also store a reference to the DraftStyleDefault-block div for later use
          const draftDiv = commentBox.querySelector('.public-DraftStyleDefault-block');
          if (draftDiv) {
            commentBox.draftDiv = draftDiv;
            console.log('Found and stored reference to DraftStyleDefault-block div');
          }
        }
      }
    }
  }

  if (!commentBox) {
    console.warn('Could not find or reveal comment box');
    return false;
  }

  console.log('Found comment box:', commentBox);
  console.log('Comment box tag name:', commentBox.tagName);
  console.log('Comment box type:', commentBox.type);

  try {
    // Special handling for X.com
    if (platform === PLATFORMS.X) {
      console.log('Using X.com text injection logic');
      
      // Verify we have the right element
      if (!commentBox) {
        console.error('No comment box found for X.com');
        return false;
      }
      
      console.log('X.com comment box details:', {
        tagName: commentBox.tagName,
        contentEditable: commentBox.getAttribute('contenteditable'),
        role: commentBox.getAttribute('role'),
        className: commentBox.className
      });
      
      try {
        // Focus the contenteditable element first
        commentBox.focus();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if we're dealing with the initial state (with br[data-text="true"])
        if (commentBox.brDataText && commentBox.initialStateSpan && commentBox.draftDiv) {
          console.log('Handling initial state with <br data-text="true">');
          
          // We need to simulate typing to convert the <br> to a <span>
          // First, focus the element
          commentBox.focus();
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Type a space character to convert the <br> to a <span>
          // This simulates what happens when a user starts typing
          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: ' '
          });
          commentBox.dispatchEvent(inputEvent);
          
          // Wait for the DOM to update
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Now look for the span[data-text="true"] that should have been created
          const textSpan = commentBox.querySelector('span[data-text="true"]');
          
          if (textSpan) {
            console.log('Successfully converted <br> to <span data-text="true">');
            
            // Now we can set the text content
            textSpan.textContent = text;
            
            // Dispatch events
            textSpan.dispatchEvent(new Event('input', { bubbles: true }));
            commentBox.dispatchEvent(new Event('input', { bubbles: true }));
            commentBox.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Verify text was inserted
            const success = textSpan.textContent.includes(text);
            console.log('X.com initial state text injection ' + (success ? 'successful' : 'failed'));
            return success;
          }
          
          // If the span wasn't created, try to modify the DOM structure directly
          console.log('Attempting to directly modify the DOM structure');
          
          // Replace the <br> with a span containing our text
          const newHtml = `<span data-offset-key="${commentBox.initialStateSpan.getAttribute('data-offset-key')}"><span data-text="true">${text}</span></span>`;
          commentBox.draftDiv.innerHTML = newHtml;
          
          // Dispatch events
          commentBox.dispatchEvent(new Event('input', { bubbles: true }));
          commentBox.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Verify text was inserted
          const success = commentBox.textContent.includes(text);
          console.log('X.com DOM structure modification ' + (success ? 'successful' : 'failed'));
          return success;
        }
        
        // Check if we found a span[data-text="true"] inside this contenteditable
        let textSpan = commentBox.textSpan || commentBox.querySelector('span[data-text="true"]');
        
        if (textSpan) {
          console.log('Found span[data-text="true"], using it for text injection');
          
          // Clear existing content
          textSpan.textContent = '';
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Set the text content of the span
          textSpan.textContent = text;
          
          // Dispatch events on both the span and the contenteditable
          textSpan.dispatchEvent(new Event('input', { bubbles: true }));
          commentBox.dispatchEvent(new Event('input', { bubbles: true }));
          commentBox.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Verify text was inserted
          const success = textSpan.textContent.includes(text);
          console.log('X.com span text injection ' + (success ? 'successful' : 'failed'));
          return success;
        }
        
        // Try to find the DraftStyleDefault-block div and work with it
        const draftDiv = commentBox.querySelector('.public-DraftStyleDefault-block');
        if (draftDiv) {
          console.log('Found DraftStyleDefault-block div, trying to work with it');
          
          // Get the data-offset-key from the div
          const offsetKey = draftDiv.getAttribute('data-offset-key');
          
          // Create the proper structure that X.com expects
          draftDiv.innerHTML = `<span data-offset-key="${offsetKey}"><span data-text="true">${text}</span></span>`;
          
          // Dispatch events
          commentBox.dispatchEvent(new Event('input', { bubbles: true }));
          commentBox.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Verify text was inserted
          const success = commentBox.textContent.includes(text);
          console.log('X.com DraftStyleDefault modification ' + (success ? 'successful' : 'failed'));
          return success;
        }
        
        // Last resort - try to create the structure from scratch
        console.log('No suitable elements found, trying to create structure from scratch');
        
        // Generate a random offset key (similar to what X.com does)
        const randomOffsetKey = `x${Math.random().toString(36).substring(2, 8)}-0-0`;
        
        // Create the proper structure
        commentBox.innerHTML = `<div data-offset-key="${randomOffsetKey}" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key="${randomOffsetKey}"><span data-text="true">${text}</span></span></div>`;
        
        // Dispatch events
        commentBox.dispatchEvent(new Event('input', { bubbles: true }));
        commentBox.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Verify text was inserted
        const success = commentBox.textContent.includes(text);
        console.log('X.com structure creation ' + (success ? 'successful' : 'failed'));
        return success;
      } catch (err) {
        console.error('Error injecting text into X.com:', err);
        return false;
      }
    }
    
    // Handle different types of input elements for other platforms
    if (commentBox.tagName === 'INPUT' || commentBox.tagName === 'TEXTAREA') {
      console.log('Setting value for input/textarea element');
      commentBox.value = text;
      // Trigger input event to ensure the platform's UI updates
      console.log('Dispatching input event');
      commentBox.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (commentBox.getAttribute('contenteditable') === 'true') {
      console.log('Setting innerHTML for contenteditable element');
      // Focus first
      commentBox.focus();
      // Clear then set content
      commentBox.innerHTML = '';
      commentBox.textContent = text;
      // Trigger input and change events
      commentBox.dispatchEvent(new Event('input', { bubbles: true }));
      commentBox.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log('Setting textContent for non-input element');
      commentBox.textContent = text;
      // Try to focus the element to ensure platform recognizes the input
      commentBox.focus();
    }
    console.log('Text injection successful');
    return true;
  } catch (error) {
    console.error('Error during text injection:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
}

// Make injectResponse available globally for content-script.js
window.injectResponse = injectResponse; 