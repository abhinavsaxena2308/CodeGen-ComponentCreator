import React, { useState, useRef, useEffect } from "react";
import { MdCode, MdSend, MdVisibility } from "react-icons/md";
import { FaChevronRight, FaChevronLeft, FaPlus } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { saveChat, getChatHistory } from '../services/mem0';

const Homepage = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }
  ]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [activeTab, setActiveTab] = useState("preview");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user) {
        try {
          const history = await getChatHistory(user.id);
          setChatHistory(history);
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    };
    loadChatHistory();
  }, [user]);

  // Save chat to Mem0 when messages change
  useEffect(() => {
    const saveCurrentChat = async () => {
      if (user && messages.length > 1) {
        try {
          const chatId = currentChatId || Date.now().toString();
          setCurrentChatId(chatId);

          await saveChat(user.id, messages);

          const newChatHistoryItem = {
            id: chatId,
            title: messages.find(msg => msg.isUser)?.text.substring(0, 30) || "New Chat",
            timestamp: new Date().toISOString(),
            messages: messages
          };

          setChatHistory(prev => {
            const existingIndex = prev.findIndex(item => item.id === chatId);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = newChatHistoryItem;
              return updated;
            }
            return [newChatHistoryItem, ...prev];
          });
        } catch (error) {
          console.error('Error saving chat:', error);
        }
      }
    };

    const timer = setTimeout(saveCurrentChat, 2000);
    return () => clearTimeout(timer);
  }, [messages, user, currentChatId]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = { id: Date.now(), text: message, isUser: true };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: `I'll help you generate a component in ${language}. Please provide more details about what you need.`,
          isUser: false
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setMessages([
      { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }
    ]);
    setCurrentChatId(null);
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowChatHistory(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen mt-16 bg-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-4">
          
          {/* Left Sidebar - Chat History */}
          <div className="relative">
            {/* For small screens (animated slide-in) */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: showChatHistory ? 0 : -300, opacity: showChatHistory ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed inset-y-0 left-0 z-20 w-64 bg-gray-900/90 backdrop-blur-md border-r border-green-900/30 p-4 overflow-y-auto lg:hidden ${
                showChatHistory ? 'block' : 'hidden'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">Chat History</h2>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="p-1.5 hover:bg-gray-800 rounded"
                >
                  <FaChevronLeft className="w-4 h-4 text-green-400" />
                </button>
              </div>

              <button
                onClick={startNewChat}
                className="w-full mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors duration-200 text-sm"
              >
                <FaPlus className="w-4 h-4" />
                New Chat
              </button>

              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 text-green-100 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {chat.title}
                  </button>
                ))}

                {chatHistory.length === 0 && (
                  <div className="text-gray-500 text-sm p-3 text-center">
                    No chat history yet
                  </div>
                )}
              </div>
            </motion.div>

            {/* For large screens (always visible, static) */}
            <div className="hidden lg:block w-64 bg-gray-900/80 backdrop-blur-md border-r border-green-900/30 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">Chat History</h2>
              </div>

              <button
                onClick={startNewChat}
                className="w-full mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors duration-200 text-sm"
              >
                <FaPlus className="w-4 h-4" />
                New Chat
              </button>

              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 text-green-100 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {chat.title}
                  </button>
                ))}

                {chatHistory.length === 0 && (
                  <div className="text-gray-500 text-sm p-3 text-center">
                    No chat history yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-900/50 rounded-xl border border-green-900/30 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-green-900/30 flex items-center justify-between bg-gray-900/80">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  className="lg:hidden p-1.5 hover:bg-gray-800 rounded"
                >
                  <FaChevronRight className="w-4 h-4 text-green-400" />
                </button>
                <h2 className="text-lg font-semibold text-green-300">AI Component Generator</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewChat}
                  className="p-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="New Chat"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 text-green-300 border border-green-900/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500/50"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900/50 to-gray-900/30">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      msg.isUser
                        ? 'bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white'
                        : 'bg-gray-800/80 text-gray-100 border border-gray-700'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-green-900/30 bg-gray-900/80">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Describe the component you want to create in ${language}...`}
                  rows="2"
                  className="w-full bg-gray-800/80 text-gray-100 rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-green-500/50 border border-gray-700 resize-none transition-all placeholder-gray-500"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
                    message.trim()
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-600 bg-gray-700/50'
                  }`}
                >
                  <MdSend className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Preview/Code Panel */}
          <div className="lg:w-1/2 bg-gray-900/50 rounded-xl border border-green-900/30 overflow-hidden flex flex-col">
            <div className="flex border-b border-green-900/30">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === "preview"
                    ? "text-green-400 bg-gray-800/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                } transition-colors`}
              >
                <MdVisibility className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === "code"
                    ? "text-green-400 bg-gray-800/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                } transition-colors`}
              >
                <MdCode className="w-4 h-4" />
                Code
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-900/30 p-4">
              {activeTab === "preview" ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm rounded-lg border-2 border-dashed border-gray-800">
                  Component preview will appear here
                </div>
              ) : (
                <pre className="bg-gray-900/50 rounded-lg p-4 text-xs text-green-300 overflow-auto h-full">
                  <code>
                    {`// Generated ${language} code will appear here\n// ${new Date().toLocaleString()}`}
                  </code>
                </pre>
              )}
            </div>
            <div className="p-2 bg-gray-900/80 border-t border-green-900/30 text-xs text-gray-500 text-center">
              Generated code will appear here when you describe your component
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Homepage;
