import api from '../../../api/api';

class ChatbotService {
  async sendMessage(message) {
    try {
      const response = await api.post('/chatbot/message', { message });
      return { success: true, reply: response.data.reply };
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        success: false,
        reply: "I'm having trouble connecting. Please try again later.",
      };
    }
  }

  async getSuggestions(context = '') {
    try {
      const response = await api.get('/chatbot/suggestions', { params: { context } });
      return { success: true, suggestions: response.data };
    } catch (error) {
      return { success: false, suggestions: [] };
    }
  }

  // Mock responses for demo
  getMockResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('recipe') || lowerMsg.includes('cook')) {
      return "I can help you find recipes! Try scanning ingredients or searching by name. What would you like to cook?";
    } else if (lowerMsg.includes('ingredient')) {
      return "You can scan ingredients using the camera in the Find Recipes screen. It will suggest recipes based on what you have!";
    } else if (lowerMsg.includes('save') || lowerMsg.includes('favorite')) {
      return "You can save recipes by tapping the bookmark icon on any recipe card. Your saved recipes appear in the Saved tab.";
    } else if (lowerMsg.includes('adobo') || lowerMsg.includes('sinigang')) {
      return `Filipino dishes are amazing! ${message.charAt(0).toUpperCase() + message.slice(1)} is a classic. Would you like me to help you find a recipe for it?`;
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return "Hello! I'm your cooking assistant. I can help you find recipes, answer cooking questions, or suggest dishes based on your ingredients. How can I help you today?";
    } else if (lowerMsg.includes('help')) {
      return "Here's what I can help with:\n🔍 Find recipes by name\n📸 Scan ingredients with camera\n💾 Save favorite recipes\n🍽️ Get cooking tips\n🇵🇭 Discover Filipino dishes\n\nJust ask me anything!";
    } else {
      return "That's interesting! I'm here to help with recipes and cooking. Try asking me about a specific dish, ingredients you have, or cooking tips!";
    }
  }
}

export default new ChatbotService();