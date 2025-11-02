import axios from 'axios';

const MEM0_API_URL = import.meta.env.VITE_MEM0_API_URL || 'https://api.mem0.ai/v1';
const MEM0_API_KEY = import.meta.env.VITE_MEM0_API_KEY || 'YOUR_MEM0_API_KEY';

// Only create client if API key is provided
let mem0Client = null;
if (MEM0_API_KEY && MEM0_API_KEY !== 'YOUR_MEM0_API_KEY') {
  mem0Client = axios.create({
    baseURL: MEM0_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MEM0_API_KEY}`
    }
  });
}

export const saveChat = async (userId, messages) => {
  // If no API key or client, skip saving
  if (!mem0Client) {
    console.warn('Mem0 API key not configured, skipping save');
    return;
  }
  
  try {
    await mem0Client.post('/memories', {
      user_id: userId,
      content: JSON.stringify(messages),
      metadata: {
        type: 'chat_history',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error saving chat to Mem0:', error);
    throw error;
  }
};

export const getChatHistory = async (userId) => {
  // If no API key or client, return empty array
  if (!mem0Client) {
    console.warn('Mem0 API key not configured, returning empty history');
    return [];
  }
  
  try {
    const response = await mem0Client.get(`/memories?user_id=${userId}&metadata={"type":"chat_history"}&limit=20&order=desc`);
    
    return response.data?.map(item => ({
      ...item,
      content: JSON.parse(item.content)
    })) || [];
  } catch (error) {
    console.error('Error fetching chat history from Mem0:', error);
    return [];
  }
};