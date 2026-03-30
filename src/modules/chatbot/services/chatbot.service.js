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
}

export default new ChatbotService();