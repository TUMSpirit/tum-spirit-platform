import React, { useEffect, useState } from "react";
import { CloseOutlined, MessageOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Button, FloatButton, Input, Tooltip } from "antd";
import logo from "../../assets/images/ghost.png";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';

const Chatbot = ({ opened, setOpened }) => {
  // State to hold messages
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello, how can I help you?" },
  ]);
  // State to hold the current input
  const [inputValue, setInputValue] = useState("");

  // Unique session ID for the chat
  const [sessionId, setSessionId] = useState("");

  // Function to handle input change
  const handleInputChange = (event) => setInputValue(event.target.value);

  //loading state for the bot
  const [loading, setLoading] = useState(false);

  // Function to send the message
  const sendMessage = async () => {
    // Set loading to true
    setLoading(true);
  
    if (inputValue.trim()) {
      // Add user message to the chat
      setMessages([...messages, { role: "user", content: inputValue }]);
      // Clear the input
      setInputValue("");
  
      try {
        // Post request to the backend to get the bot response using axios
        const response = await axios.post(
          "/api/ai/generate_gpt",{
            messages: [...messages, { role: "user", content: inputValue }],
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        // Set loading to false
        setLoading(false);
  
        // Add bot response to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: response.data.choices[0].message.content, role: "assistant" },
        ]);
      } catch (error) {
        // Handle error
        console.error("Failed to get bot response", error);
        setLoading(false);
      }
    } else {
      // Ensure loading is set to false if the input is empty
      setLoading(false);
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    // Generate and set a unique session ID when the component mounts
    const newSessionId = uuidv4();
    setSessionId(newSessionId);

    // Then, send a "loaded chatbox" event to the backend with the sessionId
    axios.post('/api/ai/analytics', {
      event_type: 'loaded_chatbox',
      session_id: newSessionId,
      data: {},
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .catch(error => {
      console.error('Error sending loaded chatbox event:', error);
      // Handle the error appropriately
      // For example, you might want to display a message to the user
    });

    // This empty dependency array ensures this effect runs once, at mount time
  }, []); 

  return (
    <>
      {opened && (
        <div
          style={{
            position: "fixed",
            bottom: 25,
            right: 25,
            zIndex: 1000,
            backgroundColor: "white",
            width: 350,
            height: 535,
            borderRadius: 25,
            borderEndEndRadius: 10,
            borderEndStartRadius: 10,
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#7D4EBC",
              padding: 20,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          >
            <img
              style={{
                marginRight: 10,
                fontSize: 28,
                color: "white",
                height: 32,
                width: 32,
              }}
              src={logo}
              alt="Ghost"
            />

            <div style={{ fontSize: 15, fontWeight: "bold", color: "white" }}>
              Hi I'm Spirit!
            </div>
            <button
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setOpened(false)}
            >
              <CloseOutlined style={{ fontSize: 20, color: "white" }} />
            </button>
          </div>

          {/* Info Box */}
          <div style={{ background: "#f0f0f0", padding: 10, textAlign: "center", borderRadius: "0 0 2px 2px" }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Please note: Messages are sent to ChatGPT. Avoid sharing personal information.
          </div>

          <div
            style={{ height: 340, overflow: "auto", flex: "1", padding: 12 }}
          >
            {messages.map((message, index) => (
              <div key={index} style={{ margin: 5 }}>
                <div
                  style={{
                    fontSize: 16,
                    color: message.role === "assistant" ? "gray" : "black",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <>
                <div className="container">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
                <svg width={0} height={0} className="svg">
                  <defs>
                    <filter id="uib-jelly-ooze">
                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation={3}
                        result="blur"
                      />
                      <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                        result="ooze"
                      />
                      <feBlend in="SourceGraphic" in2="ooze" />
                    </filter>
                  </defs>
                </svg>
                <style
                  dangerouslySetInnerHTML={{
                    __html:
                      "\n  .container {\n    --uib-size: 60px;\n    --uib-color: black;\n    --uib-speed: 2.6s;\n    --uib-dot-size: calc(var(--uib-size) * 0.23);\n    position: relative;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    width: var(--uib-size);\n    height: var(--uib-dot-size);\n    filter: url('#uib-jelly-ooze');\n  }\n\n  .dot {\n    position: absolute;\n    top: calc(50% - var(--uib-dot-size) / 2);\n    left: calc(0px - var(--uib-dot-size) / 2);\n    display: block;\n    height: var(--uib-dot-size);\n    width: var(--uib-dot-size);\n    border-radius: 50%;\n    background-color: var(--uib-color);\n    animation: stream var(--uib-speed) linear infinite both;\n    transition: background-color 0.3s ease;\n  }\n\n  .dot:nth-child(2) {\n    animation-delay: calc(var(--uib-speed) * -0.2);\n  }\n\n  .dot:nth-child(3) {\n    animation-delay: calc(var(--uib-speed) * -0.4);\n  }\n\n  .dot:nth-child(4) {\n    animation-delay: calc(var(--uib-speed) * -0.6);\n  }\n\n  .dot:nth-child(5) {\n    animation-delay: calc(var(--uib-speed) * -0.8);\n  }\n\n  @keyframes stream {\n    0%,\n    100% {\n      transform: translateX(0) scale(0);\n    }\n\n    50% {\n      transform: translateX(calc(var(--uib-size) * 0.5)) scale(1);\n    }\n\n    99.999% {\n      transform: translateX(calc(var(--uib-size))) scale(0);\n    }\n  }\n",
                  }}
                />
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              padding: 10,
            }}
          >
            <Input
              placeholder="Type a message..."
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onClick={handleKeyPress}
              style={{ flex: 1, marginRight: 10 }}
            />

            <Button onClick={sendMessage} style={{background:"#7D4EBC"}} type="primary">
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
