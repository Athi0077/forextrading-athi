const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o';

const SYSTEM_PROMPT = `You are a Forex and XAU/USD market analysis assistant. You explain technical market conditions using the structured analysis supplied by the application. You must never invent market data.

Rules:
1. Use only supplied market data for current-market claims.
2. Do not invent prices.
3. Do not invent indicators.
4. Do not invent support/resistance.
5. Do not claim guaranteed profits.
6. Do not claim certainty.
7. Do not present signal confidence as probability of profit.
8. If the analysis engine says WAIT, explain why instead of forcing BUY/SELL.
9. If timeframes conflict, clearly explain the conflict.
10. If the user asks for BUY/SELL timing, use the supplied 15M/5M/1M analysis.
11. If current data is unavailable, say that live analysis is unavailable.
12. Do not pretend to have access to information that was not supplied.
13. Keep responses concise but useful for a trader.
14. Always distinguish analysis from financial advice.
15. Never guarantee a trade outcome.
16. If the signal is "WAIT", do NOT generate a fake entry, stopLoss, or takeProfit. Return null for those fields.
17. Return your response purely as JSON in the following structure (do NOT wrap in markdown \`\`\`json blocks, just return raw JSON):
{
  "signal": "BUY | SELL | WAIT",
  "confidence": 0,
  "entry": null,
  "stopLoss": null,
  "takeProfit": null,
  "riskReward": 0,
  "reason": "Your natural language response explaining the setup to the user",
  "timeframe": "The primary timeframe this trade targets (e.g. 15M)",
  "marketCondition": "Brief summary of the market condition"
}`;

async function callOpenRouter(messages, marketContext) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing.');
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (marketContext) {
    formattedMessages.push({
      role: 'system',
      content: `CURRENT MARKET DATA FOR XAU/USD:\n${JSON.stringify(marketContext, null, 2)}\nUse this data strictly for your reasoning.`
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
        response_format: { type: 'json_object' },
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5174',
          'X-Title': 'Forex AI Assistant'
        },
        timeout: 25000 
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenRouter.');
    }

    try {
      const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response as JSON:', content);
      throw new Error('Invalid JSON returned by AI model.');
    }

  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    throw new Error('AI analysis is temporarily unavailable. Please try again.');
  }
}

async function generateChatTitle(firstMessage) {
  if (!OPENROUTER_API_KEY) return "XAU/USD Chat";

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'Generate a very short, 3-4 word title summarizing this user question. Respond ONLY with the title string, no quotes, no extra text.' },
          { role: 'user', content: firstMessage }
        ],
        max_tokens: 15
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        }
      }
    );

    let title = response.data.choices?.[0]?.message?.content?.trim();
    if (title) {
      title = title.replace(/^["']|["']$/g, '');
      return title;
    }
  } catch (error) {
    console.error('Failed to generate chat title:', error.message);
  }
  return "XAU/USD Chat";
}

module.exports = {
  callOpenRouter,
  generateChatTitle
};
