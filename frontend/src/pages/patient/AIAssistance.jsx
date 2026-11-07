
import { useState, useRef, useEffect } from "react";
import "../../App.css";

function AIAssistance() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! Welcome to DentalSmart! 🦷 I'm your AI Appointment Assistant. I can help you find available dentists and book your dental appointment. What date would you prefer?"
    }
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  const sendMessage = async (e, quickMessage = null) => {
    if (e) e.preventDefault();

    const userMessage = (quickMessage || message).trim();

    if (!userMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/ai-book-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message: userMessage
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.reply || data.message || "Unable to process your request."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "Please try again."
        }
      ]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: error.message || "Unable to connect to DentalSmart server."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Show available appointments",
    "I want to book tomorrow",
    "How can I book an appointment?"
  ];

  return (
    <div className="dental-ai-page">

      {/* PAGE HEADER */}

      <div className="dental-ai-heading">
        <div>
          <span className="dental-ai-label">
            DENTALSMART SERVICES
          </span>
          <h1>AI Appointment Assistant</h1>
          <p>
            Your smart assistant for easier and faster dental booking.
          </p>
        </div>

        <div className="dental-ai-heading-icon">
          🦷
        </div>
      </div>

      {/* AI INFORMATION CARD */}

      <div className="dental-ai-banner">
        <div className="dental-ai-banner-icon">
          <span>✦</span>
        </div>

        <div className="dental-ai-banner-content">
          <h3>How can I help you today?</h3>
          <p>
            Find available dentist schedules, choose your preferred
            appointment time, and book directly through our assistant.
          </p>
        </div>

        <div className="dental-ai-banner-status">
          <span></span>
          Assistant Online
        </div>
      </div>

      {/* CHAT CONTAINER */}

      <div className="dental-ai-chat-card">

        {/* CHAT HEADER */}

        <div className="dental-ai-chat-header">
          <div className="dental-ai-profile">
            <div className="dental-ai-profile-icon">
              🦷
            </div>

            <div>
              <h3>DentalSmart Assistant</h3>
              <span>
                <i></i> Ready to assist you
              </span>
            </div>
          </div>

          <div className="dental-ai-chat-tag">
            AI SUPPORT
          </div>
        </div>

        {/* CHAT BODY */}

        <div className="dental-ai-chat-body">

          <div className="dental-ai-date-divider">
            <span>START YOUR CONVERSATION</span>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`dental-ai-message-row ${msg.sender}`}
            >

              {msg.sender === "ai" && (
                <div className="dental-ai-message-avatar">
                  🦷
                </div>
              )}

              <div className="dental-ai-message-content">
                <span className="dental-ai-sender">
                  {msg.sender === "ai" ? "DentalSmart AI" : "You"}
                </span>

                <div className={`dental-ai-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>

            </div>
          ))}

          {loading && (
            <div className="dental-ai-message-row ai">
              <div className="dental-ai-message-avatar">
                🦷
              </div>

              <div className="dental-ai-message-content">
                <span className="dental-ai-sender">
                  DentalSmart AI
                </span>

                <div className="dental-ai-bubble ai dental-ai-typing">
                  Checking your request...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

        </div>

        {/* QUICK QUESTIONS */}

        <div className="dental-ai-quick-section">
          <span>QUICK QUESTIONS</span>

          <div className="dental-ai-quick-buttons">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(null, question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* MESSAGE INPUT */}

        <form
          className="dental-ai-input-area"
          onSubmit={sendMessage}
        >
          <div className="dental-ai-input-wrapper">
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="dental-ai-send-button"
            >
              Send <span>➤</span>
            </button>
          </div>

          <p className="dental-ai-input-note">
            DentalSmart AI Assistant · Appointment duration: 15 minutes
          </p>
        </form>

      </div>

    </div>
  );
}

export default AIAssistance;
