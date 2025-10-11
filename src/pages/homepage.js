import React, { useState, useRef, useEffect } from "react";
import { MdCode, MdLightbulbOutline, MdSend, MdCodeOff, MdVisibility } from "react-icons/md";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const Homepage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }
  ]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [activeTab, setActiveTab] = useState("preview");
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = { id: Date.now(), text: message, isUser: true };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
      
      // Simulate AI response with language context
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Collapsible Chat History */}
      <div className={`${showChatHistory ? 'w-56' : 'w-0'} transition-all duration-500 ease-in-out overflow-hidden bg-black border-r border-green-900/50`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-green-400">Chats</h1>
            <button 
              onClick={() => setShowChatHistory(false)}
              className="p-1 hover:bg-green-900/30 rounded transition-colors"
            >
              <FaChevronLeft className="w-3.5 h-3.5 text-green-400" />
            </button>
          </div>
          <div className="space-y-1">
            {[1, 2, 3].map(i => (
              <button 
                key={i} 
                className="w-full text-left p-2 rounded hover:bg-green-900/20 text-sm text-green-300 hover:text-white transition-all duration-200 truncate"
              >
                Chat {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-black">
        {/* Chat History Toggle */}
        {!showChatHistory && (
          <button 
            onClick={() => setShowChatHistory(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-green-900/50 p-1.5 rounded-r hover:bg-green-800/50 transition-all duration-300 z-10"
          >
            <FaChevronRight className="w-3 h-3 text-green-400" />
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Left Section - Chat */}
          <div className="border-r border-green-900/30 flex flex-col h-full">
            <div className="p-2 border-b border-green-900/30">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-black text-green-300 border border-green-900/50 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500/50"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.isUser 
                        ? 'bg-gradient-to-r from-green-700/80 to-green-600/80 text-white' 
                        : 'bg-black/80 text-green-100 border border-green-900/50'
                    }`}
                  >
                    <div className="text-sm">{msg.text}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 border-t border-green-900/30 bg-black/80">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Describe the component you want to create in ${language}...`}
                  rows="2"
                  className="w-full bg-black/50 text-green-100 rounded-lg py-2 px-3 pr-12 focus:outline-none focus:ring-1 focus:ring-green-500/50 border border-green-900/50 resize-none transition-all placeholder-green-900/70"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={`absolute right-2 bottom-2 p-1.5 rounded-full transition-all ${
                    message.trim() 
                      ? 'text-white bg-green-600 hover:bg-green-700' 
                      : 'text-green-900/50 bg-green-900/20'
                  }`}
                >
                  <MdSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Preview/Code */}
          <div className="flex flex-col h-full border-t border-r border-green-900/30 lg:border-t-0">
            <div className="flex border-b border-green-900/30">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-2 text-sm flex items-center justify-center gap-1.5 ${
                  activeTab === "preview"
                    ? "text-green-400 border-b-2 border-green-500"
                    : "text-green-700 hover:text-green-300"
                }`}
              >
                <MdVisibility className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-2 text-sm flex items-center justify-center gap-1.5 ${
                  activeTab === "code"
                    ? "text-green-400 border-b-2 border-green-500"
                    : "text-green-700 hover:text-green-300"
                }`}
              >
                <MdCode className="w-3.5 h-3.5" />
                Code
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-black/80 p-3">
              {activeTab === "preview" ? (
                <div className="h-full flex items-center justify-center text-green-900/50 text-sm">
                  Component preview will appear here
                </div>
              ) : (
                <pre className="bg-black/50 border border-green-900/30 rounded p-3 text-xs text-green-300 overflow-auto h-full">
                  <code>
                    {`// Generated ${language} code will appear here\n// ${new Date().toLocaleString()}`}
                  </code>
                </pre>
              )}
            </div>
            <div className="p-2 bg-black/80 border-t border-green-900/30 text-xxs text-green-800 text-center">
              Generated code will appear here when you describe your component
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
