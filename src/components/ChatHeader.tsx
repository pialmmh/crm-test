import React from 'react';
import { MessageCircle, RotateCcw, X } from 'lucide-react';

interface ChatHeaderProps {
  onClearChat: () => void;
  onClose?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat, onClose }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-4 py-3 rounded-t-2xl shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Assistant</h1>
            <p className="text-xs text-blue-100">Ask me anything!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors duration-200"
            title="Clear chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors duration-200"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};