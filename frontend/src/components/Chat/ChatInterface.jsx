import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Activity, Plus, History, ArrowLeft, MessageSquare as ChatIcon, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { sendChatMessage, getChatHistory, getConversations, deleteConversation } from '../../services/chatService';
import ReactMarkdown from 'react-markdown';

const STARTER_QUESTIONS = [
  "What's the current XAU/USD trend?",
  "Should I buy or sell?",
  "When should I enter?",
  "What are the support and resistance levels?",
  "Analyze 1M, 5M and 15M."
];

export default function ChatInterface({ conversationId, setConversationId, onSyncChart, onPlotChart }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      setIsHistoryLoaded(false);
      if (conversationId) {
        const history = await getChatHistory(conversationId);
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([{
            id: 1,
            role: 'assistant',
            content: 'Hello! I am your Liquiva Assistant. How can I help you analyze XAU/USD today?',
            isInitial: true
          }]);
        }
        setIsHistoryLoaded(true);
      }
    };
    if (viewMode === 'chat') {
      loadHistory();
    }
  }, [conversationId, viewMode]);

  const handleLoadHistory = async () => {
    setViewMode('history');
    const convos = await getConversations();
    setConversations(convos || []);
  };

  const handleNewChat = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const newId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16)).toLowerCase();
    setConversationId(newId);
    setViewMode('chat');
    if (onSyncChart) onSyncChart(null);
    if (onPlotChart) onPlotChart(null);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (id === conversationId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (onSyncChart) onSyncChart(null);
    if (onPlotChart) onPlotChart(null);

    try {
      const response = await sendChatMessage(text, conversationId);
      
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        ...response
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.message || 'AI service is temporarily unavailable. Please try again.',
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderTradingCard = (msg) => {
    if (!msg.signal) return null;
    
    const isWait = msg.signal === 'WAIT';

    return (
      <div className="mt-4 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-sm w-full shadow-lg group relative">
        <div className={cn(
          "px-4 py-2 flex items-center justify-between font-bold text-xs uppercase tracking-wider",
          msg.signal === 'BUY' ? "bg-green-500/20 text-green-400" :
          msg.signal === 'SELL' ? "bg-red-500/20 text-red-400" :
          "bg-yellow-500/20 text-yellow-400"
        )}>
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> SIGNAL</span>
          <span>{msg.signal}</span>
        </div>
        
        <div className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          {onPlotChart && msg.tradePlan && !isWait && (
            <button 
              onClick={() => onPlotChart(msg.tradePlan)}
              className="bg-brand-gold text-brand-darker px-2 py-0.5 rounded text-[10px] font-bold shadow hover:bg-brand-goldHover"
            >
              Plot on Chart
            </button>
          )}
          {onSyncChart && msg.createdAt && (
            <button 
              onClick={() => onSyncChart(msg.createdAt)}
              className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold shadow hover:bg-slate-600 border border-slate-600"
            >
              Locate
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {msg.analysis && (
            <div className="grid grid-cols-3 gap-2 text-xs mb-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-500 block mb-0.5">15M</span>
                <span className="text-slate-300 line-clamp-3">{msg.analysis.trend15m || msg.analysis.timeframe || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">5M</span>
                <span className="text-slate-300 line-clamp-3">{msg.analysis.setup5m || msg.analysis.marketCondition || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">1M</span>
                <span className="text-slate-300 line-clamp-3">{msg.analysis.entry1m || '—'}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center bg-slate-800/50 p-1.5 rounded">
              <span className="text-slate-400">{isWait ? 'Current Price:' : 'Entry:'}</span>
              <span className="font-semibold text-slate-200">{isWait ? (msg.tradePlan?.currentPrice || '—') : (msg.tradePlan?.entry || '—')}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/50 p-1.5 rounded">
              <span className="text-slate-400">Stop Loss:</span>
              <span className="font-semibold text-red-400">{isWait ? '—' : (msg.tradePlan?.stopLoss || '—')}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/50 p-1.5 rounded">
              <span className="text-slate-400">Take Profit:</span>
              <span className="font-semibold text-green-400">{isWait ? '—' : (msg.tradePlan?.takeProfit || msg.tradePlan?.takeProfit1 || '—')}</span>
            </div>
          </div>
          
          {msg.warnings && msg.warnings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-orange-400 font-medium uppercase mb-1.5 block">Warnings</span>
              <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                {msg.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isHistoryLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-elevated">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-brand-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-elevated overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-brand-surface">
        <button 
          onClick={handleNewChat}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-gold text-brand-darker text-sm font-semibold hover:bg-brand-goldHover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        {viewMode === 'chat' ? (
          <button 
            onClick={handleLoadHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <History className="w-4 h-4" />
            History
          </button>
        ) : (
          <button 
            onClick={() => setViewMode('chat')}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      {viewMode === 'history' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">Your Conversations</h3>
          {conversations.length === 0 ? (
            <p className="text-slate-500 text-sm italic px-1">No past conversations found.</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv._id}
                onClick={() => {
                  setConversationId(conv._id);
                  setViewMode('chat');
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                  conv._id === conversationId 
                    ? "border-brand-gold bg-brand-gold/10 text-brand-gold" 
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                )}
              >
                <ChatIcon className="w-5 h-5 opacity-70 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{conv.title || 'Chat'}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(conv.updatedAt).toLocaleDateString()} {new Date(conv.updatedAt).toLocaleTimeString()}</p>
                </div>
                <div 
                  onClick={(e) => handleDeleteConversation(e, conv._id)}
                  className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "flex max-w-[90%] rounded-2xl px-4 py-3 flex-col",
              msg.role === 'user' 
                ? "bg-brand-gold text-brand-darker rounded-br-none" 
                : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
            )}>
              <div className="flex">
                <div className="flex-shrink-0 mr-3 mt-1">
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 opacity-70" />
                  ) : (
                    <Bot className={cn("w-4 h-4", msg.isError ? "text-red-400" : "text-brand-gold")} />
                  )}
                </div>
                <div className="text-sm leading-relaxed flex-1">
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.answer || msg.content}</div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        strong: ({node, ...props}) => <span className="font-bold text-brand-gold" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-300 ml-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />
                      }}
                    >
                      {msg.answer || msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
              
              {msg.role === 'assistant' && !msg.isInitial && !msg.isError && msg.showTradePlan === true && renderTradingCard(msg)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-brand-gold mr-2" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions / Starter Questions */}
      <div className="px-4 py-3 flex overflow-x-auto space-x-2 border-t border-slate-800 bg-brand-surface scrollbar-hide">
        {STARTER_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={isTyping}
            className="flex-shrink-0 whitespace-nowrap text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 pb-[100px] bg-brand-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask about XAU/USD..."
            className="flex-1 bg-slate-900 border border-slate-700 text-brand-text rounded-full px-5 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-brand-gold text-brand-darker rounded-full p-3 hover:bg-brand-goldHover focus:outline-none transition-colors disabled:opacity-50 flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
      </>)}
    </div>
  );
}
