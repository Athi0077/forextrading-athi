import { apiCall } from './api';

export const sendChatMessage = async (message, conversationId, symbol) => {
  try {
    const result = await apiCall('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, symbol })
    });
    return result.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

export const getChatHistory = async (conversationId) => {
  try {
    const result = await apiCall(`/conversations/${conversationId}/messages`, {
      method: 'GET'
    });
    return result.data || [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const getConversations = async () => {
  try {
    const result = await apiCall('/conversations', { method: 'GET' });
    return result.data || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const createConversation = async (title = 'New Chat', symbol) => {
  try {
    const result = await apiCall('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, symbol })
    });
    return result.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const result = await apiCall(`/conversations/${conversationId}`, {
      method: 'DELETE'
    });
    return result.success;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};
