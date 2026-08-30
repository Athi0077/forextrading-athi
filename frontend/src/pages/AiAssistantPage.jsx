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
    <div className="flex h-full min-h-[calc(100vh-4rem)] lg:min-h-screen w-full">
      <div className="w-full h-full flex flex-col">
        <ChatInterface 
          conversationId={conversationId} 
          setConversationId={setConversationId} 
        />
      </div>
    </div>
  );
}
