import { useEffect, useRef, useState } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatForm from "./components/ChatForm";
import ChatbotIcon from "./components/ChatbotIcon";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef(null);

  const generateBotResponse = async (history) => {
    // Update chat history by removing "Thinking..." and adding bot response
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== "Thinking..."),
        { role: "model", text, isError }
      ]);
    }

    // Format chat history for API request
    history = history.map(({ role, text }) => ({
      role,
      parts: [{ text }]
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };

    try {
      const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`;
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || "Something went wrong!");
      }

      // Extract and clean bot response
      const candidate = data.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const apiResponseText = part?.text?.replace(/\*\*(.*?)\*\*/g, "$1").trim();

      if (!apiResponseText) {
        throw new Error("Invalid response from server");
      }

      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      {/* Toggle button to open/close chatbot */}
      <button
        onClick={() => setShowChatbot(prev => !prev)}
        id="chatbot-toggler"
        aria-label={showChatbot ? "Close chatbot" : "Open chatbot"}
      >
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="chatbot-popup">
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatbot(false)}
            className="material-symbols-outlined"
            aria-label="Close chatbot"
          >
            keyboard_arrow_down
          </button>
        </div>

        {/* Chat messages area */}
        <div ref={chatBodyRef} className="chat-body">
          {/* Initial greeting message */}
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there 👋 <br />
              How can I help you today?
            </p>
          </div>

          {/* Render chat history */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Input form */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;