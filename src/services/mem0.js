import axios from 'axios';

const MEM0_API_URL = import.meta.env.VITE_MEM0_API_URL || 'https://api.mem0.ai';
const MEM0_API_KEY = import.meta.env.VITE_MEM0_API_KEY || 'YOUR_MEM0_API_KEY';

const mem0Client = axios.create({
  baseURL: MEM0_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MEM0_API_KEY}`
  }
});

export const saveChat = async (userId, messages) => {
  try {
    await mem0Client.post('/memories', {
      userId,
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
  try {
    const response = await mem0Client.get('/memories', {
      params: {
        userId,
        metadata: JSON.stringify({ type: 'chat_history' }),
        limit: 20,
        order: 'desc',
      },
    });
    
    return response.data?.map(item => ({
      ...item,
      content: JSON.parse(item.content)
    })) || [];
  } catch (error) {
    console.error('Error fetching chat history from Mem0:', error);
    return [];
  }
};
