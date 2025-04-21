import axios from 'axios';

// API URL configuration
const API_URL = 'http://localhost:8000';

// Response interface
interface ChatResponseData {
  response: string;
  conversationId: string;
}

/**
 * Service for interacting with the AI Tutor chat API
 */
const aiTutorChatService = {
  /**
   * Send a query to the AI tutor and get a response
   * @param query The user's query
   * @param conversationId The ID of the conversation
   * @param studentProfile Optional student profile for personalization
   * @returns Promise with the AI response
   */
  async sendChat(
    query: string, 
    conversationId: string, 
    studentProfile?: any
  ): Promise<string> {
    try {
      const payload = {
        query,
        conversationId,
        studentProfile
      };

      const response = await axios.post(
        `${API_URL}/api/tutoring/chat`,
        payload
      );

      // Explicitly cast response data
      const data = response.data as ChatResponseData;
      return data.response;
    } catch (error) {
      console.error('Error in AI Tutor chat:', error);
      
      // Simple error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const errResponse = (error as any).response;
        throw new Error(`API Error (${errResponse?.status}): ${
          errResponse?.data?.detail || 'Unknown error'
        }`);
      } else {
        throw new Error('Failed to connect to AI Tutor service');
      }
    }
  }
};

export default aiTutorChatService; 