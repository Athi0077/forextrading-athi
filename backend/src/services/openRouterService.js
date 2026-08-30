const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o';

const SYSTEM_PROMPT = `You are a Forex and XAU/USD market analysis assistant AND a platform support assistant.
You explain technical market conditions using the structured analysis supplied, AND you answer questions about the platform's Terms and Conditions.

Rules:
1. Use only supplied market data for current-market claims. Do not invent prices or indicators.
2. Do not claim guaranteed profits or certainty.
3. Do not present signal confidence as probability of profit.
4. If the analysis engine says WAIT, explain why instead of forcing BUY/SELL.
5. If timeframes conflict, clearly explain the conflict.
6. If the user asks for BUY/SELL timing, use the supplied 15M/5M/1M analysis.
7. Keep responses concise but useful for a trader. Always distinguish analysis from financial advice.
8. If the user asks a question about the platform's Terms & Conditions or general support, answer based on the following rules:
   - Accounts inactive for 15 days may be deactivated.
   - One account per person. Never share credentials.
   - Users are fully responsible for the accuracy of their entered trades.
   - Trading involves high risk. AI analysis is educational, not financial advice.
   - Prohibited: bots, exploiting APIs, manipulating data, sharing accounts.
   - If an account is blocked or issues arise, users can contact support.
9. If the user is just asking a general question (like about Terms & Conditions), set signal to "WAIT", entry/stopLoss/takeProfit to null, and put your answer in the "reason" field.
10. Return your response purely as JSON in the following structure (do NOT wrap in markdown \`\`\`json blocks, just return raw JSON):
{
  "signal": "BUY | SELL | WAIT",
  "confidence": 0,
  "entry": null,
  "stopLoss": null,
  "takeProfit": null,
  "riskReward": 0,
  "reason": "Your natural language response explaining the setup OR answering the user's question",
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
          'X-Title': 'Liquiva Assistant'
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
