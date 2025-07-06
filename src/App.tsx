import {
  BarChart3,
  Home,
  Menu,
  ShoppingCart,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
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
import { PackagesPage } from './components/PackagesPage';
import { PartnersPage } from './components/PartnersPage';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Sales', path: '/sales', icon: ShoppingCart },
    { name: 'Partners', path: '/partners', icon: Users },
    { name: 'Packages', path: '/packages', icon: Wifi },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        {/* Modern Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-800">ERP/CRM</h1>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? (
                  <Menu className="w-5 h-5 text-gray-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;

                return (
                  <li key={item.name}>
                    <a
                      href={item.path}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                © 2025 ERP/CRM System
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Home className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard
                          </h1>
                          <p className="text-gray-600">
                            Welcome to your ERP/CRM system
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Total Partners
                          </h3>
                          <p className="text-2xl font-bold text-blue-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                          <h3 className="font-semibold text-green-900 mb-2">
                            Active Sales
                          </h3>
                          <p className="text-2xl font-bold text-green-700">0</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                          <h3 className="font-semibold text-purple-900 mb-2">
                            Revenue
                          </h3>
                          <p className="text-2xl font-bold text-purple-700">
                            $0
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">
                            Sales
                          </h1>
                          <p className="text-gray-600">
                            Manage your sales and orders
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Sales functionality will be implemented here.
                      </p>
                    </div>
                  }
                />
                <Route
                  path="/partners"
                  element={
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <PartnersPage />
                    </div>
                  }
                />
                <Route
                  path="/packages"
                  element={
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <PackagesPage />
                    </div>
                  }
                />
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

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow:
                '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              style: {
                border: '1px solid #10b981',
                background: '#f0fdf4',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                border: '1px solid #ef4444',
                background: '#fef2f2',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                border: '1px solid #3b82f6',
                background: '#eff6ff',
              },
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
