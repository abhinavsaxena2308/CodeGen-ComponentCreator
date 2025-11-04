import React, { useState, useRef, useEffect } from "react";
import { MdCode, MdSend, MdVisibility, MdAutoAwesome } from "react-icons/md";
import { FaChevronRight, FaChevronLeft, FaPlus, FaTrash, FaRobot, FaUser, FaCat } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { saveChat, getChatHistory } from '../services/mem0';
import { Link } from "react-router-dom";

const Homepage = () => {
  const { user } = useAuth();
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [language, setLanguage] = useState("none");
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [mem0ErrorCount, setMem0ErrorCount] = useState(0);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false); // Add this state for copied message
  const messagesEndRef = useRef(null);
  const initialMountRef = useRef(true);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const textareaRef = useRef(null);
  const MAX_MEM0_ERRORS = 3;

  // Simplified syntax highlighting function for better code visibility
  const simpleHighlight = (code, lang) => {
    if (!code) return '';
    
    // For now, let's return the code as-is without additional formatting
    // Split into lines and add line numbers
    const lines = code.split('\n');
    
    return lines.map((line, index) => {
      // Escape HTML characters
      const escapedLine = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      return (
        `<div style="display: flex; padding: 0 8px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#2A2D2E'" onmouseout="this.style.backgroundColor='transparent'">
          <span style="color: #858585; width: 24px; flex-shrink: 0; text-align: right; padding-right: 12px; font-size: 12px; line-height: 1.5;">${index + 1}</span>
          <span style="flex: 1; color: #D4D4D4; font-size: 13px; line-height: 1.5;">${escapedLine}</span>
        </div>`
      );
    }).join('');
  };

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputText]);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      // Skip if we've had too many Mem0 errors
      if (mem0ErrorCount >= MAX_MEM0_ERRORS) {
        // Load from localStorage only
        const key = `chatHistory_${user?.id ?? 'guest'}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            setChatHistory(JSON.parse(stored));
          } catch (e) {
            console.warn("Failed to parse local chat history:", e);
          }
        }
        return;
      }

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
          setMem0ErrorCount(prev => prev + 1); // Increment error count
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
  }, [user, mem0ErrorCount]);

  // Save chat to Mem0 when messages change
  useEffect(() => {
    const saveCurrentChat = async () => {
      // Skip if we've had too many Mem0 errors
      if (mem0ErrorCount >= MAX_MEM0_ERRORS) return;
      
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
        if (user && mem0ErrorCount < MAX_MEM0_ERRORS) {
          await saveChat(user.id, messages, chatId);
        }
      } catch (serviceErr) {
        console.warn("saveChat service failed, falling back to localStorage:", serviceErr);
        setMem0ErrorCount(prev => prev + 1); // Increment error count
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
  }, [messages, user, currentChatId, mem0ErrorCount]);

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;

    // Check if language is selected
    if (language === "none") {
      setShowLanguageModal(true);
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsGenerating(true);

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
      if (data.id) {
        setPreviewId(data.id);
        setIsPreviewLoading(true);
      }
      
      // Remove typing indicator and add AI response
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage = {
        id: Date.now() + 2,
        text: `I've generated the component based on your request. You can view the code or preview on the right panel.`,
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
    } finally {
      setIsGenerating(false);
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
    if (user && mem0ErrorCount < MAX_MEM0_ERRORS) {
      saveChat(user.id, [initialMessage], chatId).catch(() => {
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
    setShowChatHistory(false);
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
      if (user && mem0ErrorCount < MAX_MEM0_ERRORS) {
        await saveChat(user.id, [], chatId);
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

  // Format date for chat history items
  const formatChatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log("Iframe loaded");
    setIsPreviewLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.log("Iframe error");
    setIsPreviewLoading(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Desktop Toggle Button */}
      <button
        onClick={() => setShowChatHistory(!showChatHistory)}
        className="hidden md:flex absolute left-0 top-1/2 z-30 -translate-y-1/2 p-2 rounded-r-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-300 shadow-lg"
        title={showChatHistory ? "Collapse sidebar" : "Expand sidebar"}
      >
        <FaChevronLeft className={`w-4 h-4 transition-transform duration-300 ${showChatHistory ? '' : 'rotate-180'}`} />
      </button>

      {/* History Sidebar - ChatGPT Style */}
      <AnimatePresence mode="wait">
        {showChatHistory && (
          <motion.div 
            className="hidden md:flex md:flex-col w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 fixed top-0 left-0 h-full z-20"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col h-full p-3">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-3">
                <h2 className="text-lg font-semibold text-gray-200">History</h2>
              </div>

              {/* New Chat Button - Enhanced */}
              <button
                onClick={startNewChat}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white transition-all duration-300 mb-4 shadow-lg shadow-green-900/20 hover:shadow-green-900/40"
              >
                <FaPlus className="w-4 h-4" />
                <span className="font-medium">New chat</span>
              </button>

              {/* Chat History List - Scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
                <div className="space-y-1 pb-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => loadChat(chat)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex flex-col ${
                          currentChatId === chat.id
                            ? 'bg-gray-700/50 border border-green-900/30'
                            : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="font-medium text-gray-100 truncate text-sm">
                          {chat.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatChatDate(chat.timestamp)}
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete chat"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {chatHistory.length === 0 && (
                    <div className="text-gray-500 text-sm p-4 text-center">
                      No chat history yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile History Sidebar Overlay */}
      <AnimatePresence>
        {showChatHistory && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChatHistory(false)}
            />
            <motion.div 
              className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-700 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col h-full p-3">
                <div className="flex items-center justify-between p-3 mb-2">
                  <h2 className="text-lg font-semibold text-gray-200">History</h2>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <FaChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <button
                  onClick={startNewChat}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white transition-all duration-300 mb-4 shadow-lg shadow-green-900/20"
                >
                  <FaPlus className="w-4 h-4" />
                  <span className="font-medium">New chat</span>
                </button>

                <div className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
                  <div className="space-y-1 pb-2">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className="group relative"
                      >
                        <button
                          onClick={() => { loadChat(chat); setShowChatHistory(false); }}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex flex-col ${
                            currentChatId === chat.id
                              ? 'bg-gray-700/50 border border-green-900/30'
                              : 'hover:bg-gray-800/50'
                          }`}
                        >
                          <div className="font-medium text-gray-100 truncate text-sm">
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatChatDate(chat.timestamp)}
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                          title="Delete chat"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {chatHistory.length === 0 && (
                      <div className="text-gray-500 text-sm p-4 text-center">
                        No chat history yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageModal(false)}
            >
              <motion.div 
                className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Select Language</h3>
                    <button 
                      onClick={() => setShowLanguageModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <FaChevronRight className="w-5 h-5 rotate-45" />
                    </button>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Please select a programming language for your component generation.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto thin-scrollbar mb-6">
                    {[
                      { value: "react", label: "React" },
                      { value: "vue", label: "Vue" },
                      { value: "angular", label: "Angular" },
                      { value: "html", label: "HTML" },
                      { value: "css", label: "CSS" },
                      { value: "html+css", label: "HTML + CSS" },
                      { value: "html+tailwind", label: "HTML + Tailwind" },
                      { value: "javascript", label: "JavaScript" },
                      { value: "typescript", label: "TypeScript" },
                      { value: "python", label: "Python" },
                      { value: "java", label: "Java" }
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => {
                          setLanguage(lang.value);
                          setShowLanguageModal(false);
                          // We need to trigger the send again after setting the language
                          setTimeout(() => {
                            handleSend();
                          }, 100);
                        }}
                        className="p-3 text-left rounded-xl bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-green-500/50 transition-all text-gray-200 hover:text-white"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowLanguageModal(false)}
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${showChatHistory ? 'md:ml-64' : ''}`}>
        {/* Header with Mobile Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setShowChatHistory(true)}
              className="md:hidden p-2 mr-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FaChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <Link
          to={user ? "/" : "/"}
          className="flex items-center group space-x-2"
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 group-hover:rotate-12 transition-transform duration-500">
            <FaCat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300">
            CodeGen
          </span>
        </Link>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800/80 text-gray-200 px-3 py-2 rounded-lg border border-gray-700/50 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 backdrop-blur-sm"
            >
              <option value="none" disabled>Select Language</option>
              <option value="react">React</option>
              <option value="vue">Vue</option>
              <option value="angular">Angular</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="html+css">HTML + CSS</option>
              <option value="html+tailwind">HTML + Tailwind</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={startNewChat}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="New Chat"
            >
              <FaPlus className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Chat Area */}
          <div className="flex flex-col lg:w-3/5 min-h-0">
            {/* Messages Area - Independent Scrolling */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-6 thin-scrollbar">
              <div className="max-w-3xl mx-auto w-full">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`py-5 ${message.isUser ? '' : 'bg-gray-800/30 rounded-2xl'}`}
                  >
                    <div className="flex items-start gap-4 px-4 max-w-3xl mx-auto">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                        message.isUser 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600'
                      }`}>
                        {message.isUser ? (
                          <FaUser className="text-white text-xs" />
                        ) : (
                          <FaRobot className="text-white text-xs" />
                        )}
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
                          <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
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

            {/* Input Area - Fixed at Bottom with Shadow */}
            <div className="sticky bottom-0 bg-gradient-to-b from-gray-900/90 to-gray-900 backdrop-blur-sm border-t border-gray-800/50 p-4 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.3)]">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message Component Generator..."
                    className="w-full bg-gray-800/80 text-gray-200 placeholder-gray-500 rounded-2xl py-4 pl-5 pr-14 resize-none focus:outline-none focus:ring-1 focus:ring-green-500 border border-gray-700/50 backdrop-blur-sm shadow-lg shadow-gray-900/20"
                    rows="1"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isGenerating}
                    className={`absolute right-3 bottom-3.5 p-2 rounded-xl transition-all ${
                      inputText.trim() && !isGenerating
                        ? 'text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/30'
                        : 'text-gray-500 bg-gray-700/50'
                    }`}
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <MdSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-3 text-center text-xs text-gray-500 flex items-center justify-center gap-4">
                  <span>Component Generator v1.0</span>
                  <span>•</span>
                  <span>Press Enter to send, Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview/Code Panel - Right side on large screens, below on small */}
          <div className="lg:w-2/5 border-t lg:border-t-0 lg:border-l border-gray-800/50 flex flex-col bg-gray-900/20 backdrop-blur-sm">
            <div className="flex border-b border-gray-800/50">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === "preview"
                    ? "text-green-400 bg-gray-800/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/20"
                }`}
              >
                <MdVisibility className="w-5 h-5" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  activeTab === "code"
                    ? "text-green-400 bg-gray-800/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/20"
                }`}
              >
                <MdCode className="w-5 h-5" />
                Code
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-900/10 p-4 relative">
              {activeTab === "preview" ? (
                <>
                  {isPreviewLoading && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-300">Loading preview...</span>
                      </div>
                    </div>
                  )}
                  {generatedCode ? (
                    previewId ? (
                      <iframe
                        title="generated-preview"
                        src={`${API_BASE}/preview/${previewId}`}
                        className="w-full h-full border-none rounded-xl"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm rounded-xl border-2 border-dashed border-gray-800/50 p-8 text-center">
                        <MdVisibility className="w-12 h-12 mb-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-400 mb-2">Component Preview</h3>
                        <p className="max-w-md">
                          Preview will appear here once the component is generated.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm rounded-xl border-2 border-dashed border-gray-800/50 p-8 text-center">
                      <MdVisibility className="w-12 h-12 mb-4 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">Component Preview</h3>
                      <p className="max-w-md">
                        Enter a component description and click generate to see the preview here.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                generatedCode ? (
                  <div className="bg-gray-900 rounded-xl overflow-hidden h-full flex flex-col border border-gray-700">
                    <div className="bg-gray-800/90 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2 text-gray-300">{language.toUpperCase()} • {generatedCode.split('\n').length} lines</span>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCode);
                            setShowCopiedMessage(true);
                            setTimeout(() => setShowCopiedMessage(false), 2000);
                          }}
                          className="text-gray-300 hover:text-white text-xs px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors flex items-center gap-1 z-10 relative"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                        {showCopiedMessage && (
                          <div className="absolute top-full mt-1 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg z-20 animate-fadeIn">
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-0 relative bg-gray-900">
                      <pre className="font-mono text-sm m-0 p-0 text-gray-100 bg-gray-900 whitespace-pre-wrap">
                        <code 
                          className="block"
                          dangerouslySetInnerHTML={{ 
                            __html: simpleHighlight(generatedCode, language) || '// No code generated yet' 
                          }}
                        />
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm rounded-xl border-2 border-dashed border-gray-800/50 p-8 text-center">
                    <MdCode className="w-12 h-12 mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">Generated Code</h3>
                    <p className="max-w-md">
                      Enter a component description and click generate to see the code here.
                    </p>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .thin-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
          border-radius: 3px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(75, 85, 99, 0.7);
        }
        
        pre code {
          color: #e0e0e0;
          display: block;
        }
        
        /* Ensure text is visible in code preview */
        .code-preview-container {
          color: #e0e0e0;
        }
        
        .code-line-number {
          color: #858585;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Homepage;