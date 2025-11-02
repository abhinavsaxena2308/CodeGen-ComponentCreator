import React, { useState, useRef, useEffect } from "react";
import { MdCode, MdSend, MdVisibility, MdHistory } from "react-icons/md";
import { FaChevronRight, FaChevronLeft, FaPlus, FaTrash } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { saveChat, getChatHistory } from '../services/mem0';

const Homepage = () => {
  const { user } = useAuth();
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [language, setLanguage] = useState("react");
  const [activeTab, setActiveTab] = useState("preview");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [promptText, setPromptText] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [genError, setGenError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      if (!currentChatId) {
        // Nothing user-initiated to save yet — skip auto-creation.
        return;
      }
      const chatId = currentChatId;

      const newChatHistoryItem = {
        id: chatId,
        title: promptText?.substring(0, 30) || "New Component",
        timestamp: new Date().toISOString(),
        prompt: promptText,
        language: language,
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
        await (saveChat(user?.id, [{text: promptText, isUser: true}], chatId) || Promise.resolve());
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
  }, [promptText, language, user, currentChatId]);

  const startNewChat = () => {
    setPromptText("");
    setGeneratedCode("");
    setPreviewId(null);
    setGenError(null);
    const chatId = Date.now().toString();
    setCurrentChatId(chatId);

    const newChat = {
      id: chatId,
      title: "New Component",
      timestamp: new Date().toISOString(),
      prompt: "",
      language: "react",
    };
    setChatHistory((prev) => [newChat, ...prev.filter((it) => it.id !== chatId)]);

    // Persist new chat (service if available; fallback to localStorage)
    const key = `chatHistory_${user?.id ?? 'guest'}`;
    if (user) {
      (saveChat(user.id, [], chatId) || Promise.resolve()).catch(() => {
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
    setPromptText(chat.prompt || "");
    setLanguage(chat.language || "react");
    setGeneratedCode("");
    setPreviewId(null);
    setGenError(null);
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

  const generate = async () => {
    if (!promptText.trim()) return;
    setLoadingGenerate(true);
    setGenError(null);
    setGeneratedCode("");
    setPreviewId(null);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, language }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err || "Generation failed");
      }
      const data = await res.json();
      setGeneratedCode(data.code || "");
      if (data.id) setPreviewId(data.id);
      // switch right panel to show code by default
      setActiveTab("code");
    } catch (e) {
      setGenError(String(e.message || e));
    } finally {
      setLoadingGenerate(false);
    }
  };

  useEffect(() => {
    // clear generated results when language changes
    setGeneratedCode("");
    setPreviewId(null);
  }, [language]);

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-br from-gray-900 to-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* History Sidebar Popup Overlay */}
        {showChatHistory && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowChatHistory(false)}
          />
        )}

        {/* History Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: showChatHistory ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-md border-r border-green-900/30 p-4 overflow-y-auto lg:z-0 lg:static lg:w-64 lg:bg-gray-900/90 lg:backdrop-blur-none lg:border-r lg:border-green-900/30 lg:p-4 lg:rounded-xl ${
            showChatHistory ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-green-400">History</h2>
            <button
              onClick={() => setShowChatHistory(false)}
              className="p-1.5 hover:bg-gray-800 rounded lg:hidden"
            >
              <FaChevronLeft className="w-4 h-4 text-green-400" />
            </button>
          </div>

          <button
            onClick={startNewChat}
            className="w-full mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors duration-200 text-sm"
          >
            <FaPlus className="w-4 h-4" />
            New Component
          </button>

          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="w-full flex items-center justify-between p-1 group"
              >
                <button
                  onClick={() => loadChat(chat)}
                  className="flex-1 text-left p-3 rounded-lg hover:bg-gray-800/50 text-green-100 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 truncate"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  title="Delete component"
                  className="ml-2 p-2 rounded-md text-red-400 hover:bg-red-600/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}

            {chatHistory.length === 0 && (
              <div className="text-gray-500 text-sm p-3 text-center">
                No component history yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className={`lg:ml-4 flex-1 transition-all duration-300 ${showChatHistory ? 'lg:ml-68' : ''}`}>
          {/* History Toggle Button (visible on all screens) */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MdHistory className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">History</span>
            </button>
          </div>

          {/* Generator UI */}
          <div className="bg-gray-900/80 rounded-xl border border-green-900/30 overflow-hidden">
            <div className="p-6 border-b border-green-900/20 bg-gray-900/70">
              <h2 className="text-2xl font-bold text-green-300 mb-4">AI Component Generator</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe the component you want to create
                  </label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder='e.g. "Create a login form with email and password fields" or "Build a responsive navbar with logo and menu items"'
                    className="w-full min-h-[100px] resize-none bg-transparent text-white placeholder-gray-400 p-4 rounded-lg border border-gray-800 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Framework/Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                    >
                      <option value="react">ReactJS</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML + CSS</option>
                      <option value="html+tailwind">HTML + Tailwind</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={generate}
                      disabled={loadingGenerate || !promptText.trim()}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-all ${
                        loadingGenerate || !promptText.trim()
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                      }`}
                    >
                      {loadingGenerate ? "Generating..." : "Generate Component"}
                    </button>
                  </div>
                </div>
                {genError && <div className="mt-3 text-sm text-red-400">{genError}</div>}
              </div>
            </div>
          </div>

          {/* Preview/Code Panel */}
          <div className="mt-4 bg-gray-900/80 rounded-xl border border-green-900/30 overflow-hidden flex flex-col">
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
                      Enter a description of the component you want to create and click "Generate Component".
                      The live preview will appear here once generated.
                    </p>
                  </div>
                )
              ) : (
                <pre className="bg-gray-900/50 rounded-lg p-4 text-xs text-green-300 overflow-auto h-full">
                  <code className="whitespace-pre-wrap">
                    {generatedCode || `// Generated ${language} code will appear here\n// ${new Date().toLocaleString()}`}
                  </code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Homepage;