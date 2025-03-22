// Placeholder for future LLM integration
class LLMService {
  static async generateResponse(selectedText, context) {
    // TODO: Implement actual LLM integration
    console.log('LLM Service: Generating response for:', selectedText);
    return selectedText + ' hello world';
  }
}

// Export for use in other files
window.LLMService = LLMService; 