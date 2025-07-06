import { useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { ChatBubble } from './components/ChatBubble';
import { ChatContainer } from './components/ChatContainer';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { PartnersPage } from './components/PartnersPage';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Side Menu Bar */}
        <div className="w-20 sm:w-24 md:w-32 bg-gray-800 text-white flex flex-col p-1 min-h-screen">
          <h3 className="text-xs sm:text-sm font-semibold mb-1 mt-1 px-1">
            ERP/CRM
          </h3>
          <ul className="space-y-0.5">
            <li>
              <a
                href="/dashboard"
                className={`w-full block text-left hover:text-gray-300 px-1 py-0.5 ${
                  window.location.pathname === '/dashboard'
                    ? 'font-bold underline'
                    : ''
                } text-xs`}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/sales"
                className={`w-full block text-left hover:text-gray-300 px-1 py-0.5 ${
                  window.location.pathname === '/sales'
                    ? 'font-bold underline'
                    : ''
                } text-xs`}
              >
                Sales
              </a>
            </li>
            <li>
              <a
                href="/partners"
                className={`w-full block text-left hover:text-gray-300 px-1 py-0.5 ${
                  window.location.pathname === '/partners'
                    ? 'font-bold underline'
                    : ''
                } text-xs`}
              >
                Partners
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-md mt-8">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <>
                      <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Dashboard
                      </h1>
                      <p>Welcome to your ERP/CRM system dashboard.</p>
                    </>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <>
                      <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Sales
                      </h1>
                      <p>Sales functionality goes here.</p>
                    </>
                  }
                />
                <Route path="/partners" element={<PartnersPage />} />
              </Routes>
            </div>
          </div>
        </div>

        {/* Floating Chat Interface */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-4 w-[480px] h-[650px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
            <ChatHeader onClearChat={clearMessages} onClose={toggleChat} />
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              error={error}
            />
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        )}

        {/* Chat Bubble Button */}
        <ChatBubble onClick={toggleChat} isOpen={isChatOpen} />
      </div>
    </Router>
  );
}

export default App;
