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
      'article[data-testid="tweet"]:has([data-testid="tweetText"])'
    ],
    replyButtonSelectors: [
      '[data-testid="reply"]',
      '[aria-label*="Reply"]',
      '[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]'
    ],
    commentBoxSelectors: [
      '[data-testid="tweetTextarea_0"]',
      '[data-testid="tweetTextarea_1"]',
      '[data-testid="tweetTextarea_2"]',
      '[data-testid="tweetTextarea_3"]',
      '[contenteditable="true"][aria-label*="Reply"]',
      '[contenteditable="true"][aria-label*="Tweet"]',
      '[role="textbox"]'
    ]
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
      // Wait for comment box to appear - first try to find it within the post container
      for (const selector of platform.commentBoxSelectors) {
        // Wait a moment for the UI to update after clicking
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
    // Handle different types of input elements
    if (commentBox.tagName === 'INPUT' || commentBox.tagName === 'TEXTAREA') {
      console.log('Setting value for input/textarea element');
      commentBox.value = text;
      // Trigger input event to ensure the platform's UI updates
      console.log('Dispatching input event');
      commentBox.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (commentBox.getAttribute('contenteditable') === 'true') {
      console.log('Setting innerHTML for contenteditable element');
      commentBox.innerHTML = text;
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