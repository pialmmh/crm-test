import React from 'react';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-3 h-3 text-white" />
        </div>
      )}
      
      <div className={`max-w-[200px] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
          }`}
        >
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};