import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Settings2, Loader2, AlertCircle } from 'lucide-react';
import { apiCall } from '../../services/api';

export default function AdminAiPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello Admin! I have access to the latest user statistics and trade data. How can I help you manage the platform today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(20);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = { role: 'user', content: inputMessage.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await apiCall('/admin/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          messages: newMessages,
          commissionPercentage 
        })
      });

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Admin AI Error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while analyzing the system data. Please try again.',
          isError: true 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-brand-base relative overflow-hidden">
      
      {/* Header and Settings */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-brand-border bg-brand-surface shrink-0 z-10">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30">
            <Bot className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin AI Assistant</h1>
            <p className="text-xs text-brand-muted">Real-time platform insights</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-brand-elevated px-4 py-2 rounded-lg border border-brand-border">
          <Settings2 className="w-4 h-4 text-brand-muted" />
          <span className="text-sm text-brand-muted font-medium">Commission Setting:</span>
          <select 
            value={commissionPercentage}
            onChange={(e) => setCommissionPercentage(Number(e.target.value))}
            className="bg-transparent text-brand-accent font-bold focus:outline-none cursor-pointer"
          >
            <option value={10}>10%</option>
            <option value={15}>15%</option>
            <option value={20}>20%</option>
            <option value={25}>25%</option>
            <option value={30}>30%</option>
            <option value={50}>50%</option>
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex flex-shrink-0 items-center justify-center mt-1 mr-3 border border-brand-accent/30">
                <Bot className="w-5 h-5 text-brand-accent" />
              </div>
            )}
            
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 ${
              msg.role === 'user' 
                ? 'bg-brand-accent text-white rounded-tr-sm shadow-lg shadow-brand-accent/20' 
                : msg.isError 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-sm'
                  : 'bg-brand-surface text-brand-text border border-brand-border rounded-tl-sm shadow-xl'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {msg.content}
              </div>
              
              {msg.isError && (
                <div className="flex items-center mt-2 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3 mr-1" /> System Error
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-brand-elevated flex flex-shrink-0 items-center justify-center mt-1 ml-3 border border-brand-border">
                <User className="w-5 h-5 text-brand-muted" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start justify-start">
            <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex flex-shrink-0 items-center justify-center mt-1 mr-3 border border-brand-accent/30">
              <Bot className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-2xl rounded-tl-sm px-5 py-4 flex space-x-2 items-center">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-brand-surface border-t border-brand-border z-10 shrink-0">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about users, profits, offline accounts..."
            className="w-full bg-brand-base border border-brand-border rounded-xl pl-4 pr-12 py-4 text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all shadow-inner"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-accent text-white rounded-lg flex items-center justify-center hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

    </div>
  );
}
