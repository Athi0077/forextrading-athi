const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o';
const OPENROUTER_MAX_TOKENS = parseInt(process.env.OPENROUTER_MAX_TOKENS) || 700;

const SYSTEM_PROMPT = `You are a Forex market analysis assistant, a platform support assistant, and a Trade Journal assistant.
You explain technical market conditions using the structured analysis supplied, you answer questions about the platform's Terms and Conditions, and you answer questions about the user's trading performance based on the supplied user trading data.

Rules:
1. The user is asking about the currently selected Forex market. Use the provided CURRENT MARKET DATA when answering. Do not assume a different market. If the provided data is unavailable or stale, clearly state that.
2. Never assume the market is XAU/USD unless explicitly provided in the CURRENT MARKET DATA.
3. If the user asks about another market that is different from the selected symbol, explain that they need to select that market from the dropdown before requesting analysis. Do not invent data.
4. Use only supplied market data for current-market claims. Do not invent prices or indicators.
5. Do not claim guaranteed profits or certainty.
6. Do not present signal confidence as probability of profit.
7. If the analysis engine says WAIT, explain why instead of forcing BUY/SELL.
8. If timeframes conflict, clearly explain the conflict.
9. If the user asks for BUY/SELL timing, use the supplied 15M/5M/1M analysis.
10. Keep responses concise but useful for a trader. Always distinguish analysis from financial advice.
8. If the user asks a question about the platform's Terms & Conditions or general support, answer based on the following rules:
   - Accounts inactive for 15 days may be deactivated.
   - One account per person. Never share credentials.
   - Users are fully responsible for the accuracy of their entered trades.
   - Trading involves high risk. AI analysis is educational, not financial advice.
   - Prohibited: bots, exploiting APIs, manipulating data, sharing accounts.
   - If an account is blocked or issues arise, users can contact support.
9. If the user asks about their trade journal, total balance, P&L, or recent trades, use the supplied USER TRADING DATA to answer their questions. Keep the tone helpful and encouraging.
10. If the user is only asking a general, educational, conversational, platform-support, or trade journal question, set showTradePlan to false.
11. If the user explicitly asks for trading analysis, a trading setup, entry timing, BUY/SELL decision, entry price, stop loss, take profit, or asks to analyze the market/timeframes, set showTradePlan to true.
12. If showTradePlan is false: signal must be WAIT, entry must be null, stopLoss must be null, takeProfit must be null, riskReward must be 0, and answer the user's question naturally in the reason field.
13. If showTradePlan is true: perform the requested market analysis using the supplied 15M/5M/1M market data, return BUY, SELL, or WAIT based on the analysis, provide entry, stopLoss, takeProfit and riskReward when a valid BUY/SELL setup exists (if WAIT, entry/stopLoss/takeProfit may be null). Never invent prices.
14. Return your response purely as JSON in the following structure (do NOT wrap in markdown \`\`\`json blocks, just return raw JSON):
{
  "symbol": "The symbol you analyzed, e.g. EUR/USD",
  "signal": "BUY | SELL | WAIT",
  "confidence": 0,
  "entry": null,
  "stopLoss": null,
  "takeProfit": null,
  "riskReward": 0,
  "reason": "Your natural language response explaining the setup OR answering the user's question",
  "timeframe": "The primary timeframe this trade targets (e.g. 15M)",
  "marketCondition": "Brief summary of the market condition",
  "showTradePlan": false
}`;

async function callOpenRouter(messages, marketContext, userDataContext = null) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing.');
  }

  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (marketContext) {
    formattedMessages.push({
      role: 'system',
      content: `CURRENT MARKET DATA FOR ${marketContext.symbol}:\n${JSON.stringify(marketContext)}\nUse this data strictly for your reasoning.`
    });
  }

  if (userDataContext) {
    formattedMessages.push({
      role: 'system',
      content: `USER TRADING DATA:\n${JSON.stringify(userDataContext)}\nUse this data to answer questions about the user's balance, P&L, and trade history.`
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
        max_tokens: OPENROUTER_MAX_TOKENS,
        temperature: 0.3
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
      const cleanContent = content.replace(/```json\s*/ig, '').replace(/```\s*$/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response as JSON:', content);
      throw new Error('invalid_json');
    }

  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    
    if (error.message === 'invalid_json') {
      throw new Error('AI analysis is temporarily unavailable due to a formatting error. Please try again.');
    }
    
    if (error.response?.status === 402 || error.response?.data?.error?.code === 402 || (error.response?.data?.error?.message && error.response.data.error.message.includes('insufficient credits'))) {
      console.warn("OpenRouter 402 Insufficient Credits - returning MOCK response.");
      return {
        symbol: marketContext?.symbol || "Mock Symbol",
        signal: "WAIT",
        confidence: 0,
        entry: null,
        stopLoss: null,
        takeProfit: null,
        riskReward: 0,
        reason: userDataContext 
          ? `[MOCK RESPONSE - API Out of Credits] Your trade journal integration works! Your current balance is $${userDataContext.currentBalance} and your total P&L is $${userDataContext.totalPnL}. You have ${userDataContext.totalTrades} closed trades with a win rate of ${userDataContext.winRate}.` 
          : "[MOCK RESPONSE - API Out of Credits] The AI analysis is temporarily mocked because your OpenRouter API key has insufficient credits.",
        timeframe: "15M",
        marketCondition: "Mocked",
        showTradePlan: false
      };
    }
    
    if (error.response?.status === 401) {
      throw new Error('AI analysis is temporarily unavailable due to invalid API configuration.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('AI analysis is temporarily unavailable due to rate limits. Please try again in a few moments.');
    }

    throw new Error('AI analysis is temporarily unavailable. Please try again later.');
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
        max_tokens: 20,
        temperature: 0.2
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
