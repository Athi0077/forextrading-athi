const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.ADMIN_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o';

const SYSTEM_PROMPT = `You are the Admin AI Assistant for a Forex Trading Platform. 
You are speaking directly to the platform administrator. 
Your goal is to answer their questions accurately using the system context provided.
Do not hallucinate data. If the admin asks about something not in the context, politely inform them you don't have access to that specific information.
Be concise, professional, and helpful.`;

async function callAdminOpenRouter(messages, adminContext) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Admin OpenRouter API key is missing.');
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (adminContext) {
    formattedMessages.push({
      role: 'system',
      content: `CURRENT SYSTEM STATISTICS:\n${JSON.stringify(adminContext, null, 2)}\nUse this data to answer the admin's questions.`
    });
  }

  messages.forEach(msg => {
    if (['user', 'assistant'].includes(msg.role)) {
      formattedMessages.push({
        role: msg.role,
        content: msg.content
      });
    }
  });

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: AI_MODEL,
        messages: formattedMessages,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5174',
          'X-Title': 'Forex Admin AI Assistant'
        },
        timeout: 25000 
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenRouter.');
    }

    return content;

  } catch (error) {
    console.error('Admin OpenRouter API Error:', error.response?.data || error.message);
    throw new Error('Admin AI is temporarily unavailable. Please try again.');
  }
}

module.exports = {
  callAdminOpenRouter
};
