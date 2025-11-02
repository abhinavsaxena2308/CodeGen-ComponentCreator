import React, { useState, useRef, useEffect } from "react";
import { MdCode, MdSend, MdVisibility } from "react-icons/md";
import { FaChevronRight, FaChevronLeft, FaPlus, FaTrash } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { saveChat, getChatHistory } from '../services/mem0';

const Homepage = () => {
  const { user } = useAuth();
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [language, setLanguage] = useState("react");
  const [activeTab, setActiveTab] = useState("preview");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI component generator. Describe the UI component you'd like me to create.",
      isUser: false
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const messagesEndRef = useRef(null);
  const initialMountRef = useRef(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Auto-scroll to bottom of messages (only after new messages)
  useEffect(() => {
    // On initial mount, keep the view at the top. After that, scroll to bottom on new messages.
    if (initialMountRef.current) {
      const container = messagesEndRef.current?.parentElement;
      if (container) container.scrollTop = 0;
      initialMountRef.current = false;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      const key = `chatHistory_${user?.id ?? 'guest'}`;
      if (user) {
        try {
          const history = await getChatHistory(user.id);
          if (history && history.length) {
            setChatHistory(history);
            return;
          }
        } catch (error) {
          console.error("Error loading chat history from service:", error);
        }
      }
      // localStorage fallback (works for guest or when service fails)
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setChatHistory(JSON.parse(stored));
        } catch (e) {
          console.warn("Failed to parse local chat history:", e);
        }
      }
    };
    loadChatHistory();
  }, [user]);

  // Save chat to Mem0 when messages change
  useEffect(() => {
    const saveCurrentChat = async () => {
      // Do not auto-create a new chat just because the user logged in.
      // Require either an existing chat id (user initiated) OR at least one user-authored message.
      if (messages.length <= 1) return;
      const hasUserMessage = messages.some(m => m.isUser);
      if (!currentChatId && !hasUserMessage) {
        // Nothing user-initiated to save yet — skip auto-creation.
        return;
      }
      const chatId = currentChatId || Date.now().toString();
      setCurrentChatId(chatId);

      const newChatHistoryItem = {
        id: chatId,
        title: messages.find(msg => msg.isUser)?.text?.substring(0, 30) || "New Chat",
        timestamp: new Date().toISOString(),
        messages: messages,
      };

      // Update local state immediately
      setChatHistory((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === chatId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newChatHistoryItem;
          return updated;
        }
        return [newChatHistoryItem, ...prev];
      });

      // Try external service, fall back to localStorage
      const key = `chatHistory_${user?.id ?? 'guest'}`;
      try {
        // try with chatId if service supports it; call without awaiting fallback below will still work
        await (saveChat(user?.id, messages, chatId) || Promise.resolve());
      } catch (serviceErr) {
        console.warn("saveChat service failed, falling back to localStorage:", serviceErr);
        try {
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = [newChatHistoryItem, ...existing.filter((it) => it.id !== chatId)];
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to persist chat to localStorage:", e);
        }
      }
    };
    const timer = setTimeout(saveCurrentChat, 2000);
    return () => clearTimeout(timer);
  }, [messages, user, currentChatId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Show typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      text: "Generating your component...",
      isUser: false,
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Call the generation API
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputText, language }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err || "Generation failed");
      }
      
      const data = await res.json();
      setGeneratedCode(data.code || "");
      if (data.id) setPreviewId(data.id);
      
      // Remove typing indicator and add AI response
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage = {
        id: Date.now() + 2,
        text: `I've generated the component based on your request.`,
        isUser: false,
        hasCode: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage = {
        id: Date.now() + 2,
        text: `Sorry, I encountered an error: ${e.message || 'Unknown error'}. Please try again.`,
        isUser: false,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    const initialMessage = {
      id: Date.now(),
      text: "Hello! I'm your AI component generator. Describe the UI component you'd like me to create.",
      isUser: false
    };
    
    setMessages([initialMessage]);
    setGeneratedCode("");
    setPreviewId(null);
    const chatId = Date.now().toString();
    setCurrentChatId(chatId);

    const newChat = {
      id: chatId,
      title: "New Chat",
      timestamp: new Date().toISOString(),
      messages: [initialMessage],
    };
    setChatHistory((prev) => [newChat, ...prev.filter((it) => it.id !== chatId)]);

    // Persist new chat (service if available; fallback to localStorage)
    const key = `chatHistory_${user?.id ?? 'guest'}`;
    if (user) {
      (saveChat(user.id, [initialMessage], chatId) || Promise.resolve()).catch(() => {
        try {
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const updated = [newChat, ...existing.filter((it) => it.id !== chatId)];
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to persist new chat to localStorage:", e);
        }
      });
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const updated = [newChat, ...existing.filter((it) => it.id !== chatId)];
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist new chat to localStorage:", e);
      }
    }
  };

  const loadChat = (chat) => {
    setMessages(Array.isArray(chat.messages) ? chat.messages : []);
    setGeneratedCode("");
    setPreviewId(null);
    setCurrentChatId(chat.id);
    setShowChatHistory(true);
  };

  // Delete a saved chat (state + persistence fallback)
  const deleteChat = async (chatId) => {
    const key = `chatHistory_${user?.id ?? 'guest'}`;
    // remove from UI immediately
    setChatHistory(prev => prev.filter(item => item.id !== chatId));

    // if currently viewing this chat, start a fresh one
    if (currentChatId === chatId) {
      startNewChat();
    }

    // best-effort: ask service to remove/overwrite this chat; fallback to localStorage
    try {
      // If saveChat supports deletion via empty messages or a dedicated behaviour, attempt it
      if (user) {
        await (saveChat(user.id, [], chatId) || Promise.resolve());
      } else {
        // guest -> just update localStorage below
        throw new Error("guest");
      }
    } catch (err) {
      try {
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const updated = existing.filter(it => it.id !== chatId);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to delete chat from localStorage:", e);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white pt-16">
      {/* History Sidebar */}
      <div className={`hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-700 transition-all duration-300 ${showChatHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-gray-200">History</h2>
          </div>

          <button
            onClick={startNewChat}
            className="w-full mb-3 flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors duration-200 text-xs"
          >
            <FaPlus className="w-3 h-3" />
            New chat
          </button>

          <div className="space-y-0.5 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="w-full flex items-center justify-between group"
              >
                <button
                  onClick={() => loadChat(chat)}
                  className="flex-1 text-left p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors duration-200 text-xs flex items-center gap-2 truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  title="Delete chat"
                  className="ml-1 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ))}

            {chatHistory.length === 0 && (
              <div className="text-gray-500 text-xs p-2 text-center">
                No chat history yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile History Sidebar Overlay */}
      {showChatHistory && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowChatHistory(false)}
            style={{ top: '4rem' }}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-56 bg-gray-900 border-r border-gray-700 p-3 md:hidden"
               style={{ top: '4rem' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-semibold text-gray-200">History</h2>
              <button
                onClick={() => setShowChatHistory(false)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <FaChevronLeft className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            <button
              onClick={startNewChat}
              className="w-full mb-3 flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors duration-200 text-xs"
            >
              <FaPlus className="w-3 h-3" />
              New chat
            </button>

            <div className="space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="w-full flex items-center justify-between group"
                >
                  <button
                    onClick={() => { loadChat(chat); setShowChatHistory(false); }}
                    className="flex-1 text-left p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors duration-200 text-xs flex items-center gap-2 truncate"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    title="Delete chat"
                    className="ml-1 p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {chatHistory.length === 0 && (
                <div className="text-gray-500 text-xs p-2 text-center">
                  No chat history yet
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900 fixed top-16 left-0 right-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-800"
            >
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-semibold text-gray-200">Component Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="react">React</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="html+tailwind">Tailwind</option>
            </select>
            <button
              onClick={startNewChat}
              className="p-2 rounded-md hover:bg-gray-800"
              title="New Chat"
            >
              <FaPlus className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden pt-16">
          {/* Chat Area */}
          <div className="flex flex-col flex-1 lg:w-1/2 xl:w-2/3">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
              <div className="max-w-3xl mx-auto">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`py-4 ${message.isUser ? 'bg-gray-900' : 'bg-gray-800/50'}`}
                  >
                    <div className="flex items-start gap-4 px-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                        message.isUser ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {message.isUser ? 'Y' : 'AI'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {message.isTyping ? (
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span className="text-gray-400">Thinking...</span>
                          </div>
                        ) : (
                          <div className="text-gray-200 whitespace-pre-wrap">
                            {message.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at Bottom */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)]">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message Component Generator..."
                    className="w-full bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-green-500 border border-gray-700"
                    rows="1"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || messages.some(msg => msg.isTyping)}
                    className={`absolute right-3 bottom-3 p-1 rounded-lg transition-all ${
                      inputText.trim() && !messages.some(msg => msg.isTyping)
                        ? 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <MdSend className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-center text-xs text-gray-500">
                  Component Generator v1.0
                </div>
              </div>
            </div>
          </div>

          {/* Preview/Code Panel - Right side on large screens, below on small */}
          <div className="lg:w-1/2 xl:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col">
            <div className="flex border-b border-gray-700">
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
              {generatedCode ? (
                activeTab === "preview" ? (
                  previewId ? (
                    <iframe
                      title="generated-preview"
                      src={`${API_BASE}/preview/${previewId}`}
                      className="w-full h-full border-none rounded-md"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm rounded-lg border-2 border-dashed border-gray-800 p-8 text-center">
                      <MdVisibility className="w-12 h-12 mb-4 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">Component Preview</h3>
                      <p className="max-w-md">
                        Preview will appear here once the component is generated.
                      </p>
                    </div>
                  )
                ) : (
                  <pre className="bg-gray-900/50 rounded-lg p-4 text-xs text-green-300 overflow-auto h-full">
                    <code className="whitespace-pre-wrap">
                      {generatedCode}
                    </code>
                  </pre>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm rounded-lg border-2 border-dashed border-gray-800 p-8 text-center">
                  <MdCode className="w-12 h-12 mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Generated Code</h3>
                  <p className="max-w-md">
                    Enter a component description and click generate to see the code or preview here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;