// Common utility functions
const utils = {
  // Get the current platform
  getCurrentPlatform: () => {
    const hostname = window.location.hostname;
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    } else if (hostname.includes('linkedin.com')) {
      return 'linkedin';
    }
    return null;
  },

  // Log with consistent formatting
  log: (message, type = 'info') => {
    const prefix = '[My Response Extension]';
    switch (type) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }
};

// Export for use in other files
window.utils = utils; 