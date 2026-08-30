import { useState, useEffect } from 'react';
import ChatInterface from '../components/Chat/ChatInterface';

export default function AiAssistantPage() {
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    if (!conversationId) {
      const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
      const newId = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16)).toLowerCase();
      setConversationId(newId);
    }
  }, [conversationId]);

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      <div className="w-full h-full max-w-4xl mx-auto border-x border-brand-border flex flex-col">
        <ChatInterface 
          conversationId={conversationId} 
          setConversationId={setConversationId} 
        />
      </div>
    </div>
  );
}
