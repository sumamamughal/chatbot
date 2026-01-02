import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    console.log(userMessage);

    inputRef.current.value = "";

    // Add user's message to chat history
    setChatHistory(h => [...h, { role: "user", text: userMessage }]);

    // After 600ms, show "Thinking..." placeholder
    setTimeout(() => setChatHistory(h => [...h, { role: "model", text: "Thinking..." }]), 600);

    // Generate bot response using updated history
    generateBotResponse([...chatHistory, { role: "user", text: userMessage }]);


  };

  return (
    <form className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button type="submit" className="material-symbols-outlined">
        arrow_upward
      </button>
    </form>
  );
};

export default ChatForm;
