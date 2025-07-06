import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { Message } from '../hooks/useChat';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading, error }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-3 space-y-3">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">AI Assistant</h3>
            <p className="text-xs text-gray-600">Start a conversation!</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message.text}
          isUser={message.isUser}
          timestamp={message.timestamp}
        />
      ))}

      {isLoading && <LoadingIndicator />}
      
      {error && (
        <div className="flex justify-center">
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};