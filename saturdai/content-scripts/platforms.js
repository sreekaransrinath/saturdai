// Platform-specific helper functions
const platforms = {
  twitter: {
    isTwitter: () => window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com'),
    getCommentField: () => {
      // TODO: Implement Twitter-specific comment field selector
      return null;
    }
  },
  linkedin: {
    isLinkedIn: () => window.location.hostname.includes('linkedin.com'),
    getCommentField: () => {
      // TODO: Implement LinkedIn-specific comment field selector
      return null;
    }
  }
};

// Export for use in content-script.js
window.platforms = platforms; 