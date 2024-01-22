import React, { useState } from "react";
import { MessageOutlined, SmileOutlined } from "@ant-design/icons"; // Assuming you're using Ant Design
import { Button, FloatButton, Input } from "antd";

const Chatbot = () => {
  // State to hold messages
  const [messages, setMessages] = useState([
    { text: "How can I help you?", sender: "bot" },
  ]);
  // State to hold the current input
  const [inputValue, setInputValue] = useState("");

  // State ho hold the opened/closed state of the chat
  const [opened, setOpened] = useState(false);

  // Function to handle input change
  const handleInputChange = (event) => setInputValue(event.target.value);

  // Function to send the message
  const sendMessage = () => {
    if (inputValue.trim()) {
      // Add user message to the chat
      setMessages([...messages, { text: inputValue, sender: "user" }]);
      // Clear the input
      setInputValue("");

      // Here you would typically call an AI service or your backend to get the response
      const botResponse = "This is a placeholder response.";
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botResponse, sender: "bot" },
      ]);
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {opened && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 20,
            zIndex: 1000,
            backgroundColor: "white",
            width: 350,
            height: 500,
            borderRadius: 25,
            borderEndEndRadius: 10,
            borderEndStartRadius: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#DCEDFF",
              padding: 20,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          >
            <div style={{ marginRight: 10 }}>
              <SmileOutlined style={{ fontSize: 30 }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: "bold" }}>
              Hi I'm Spirit!
            </div>
          </div>
          <div
            style={{ height: 370, overflow: "auto", flex: "1", padding: 12 }}
          >
            {messages.map((message, index) => (
              <div key={index} style={{ margin: 5 }}>
                <div
                  style={{
                    fontSize: 16,
                    color: message.sender === "bot" ? "gray" : "black",
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
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

            <Button onClick={sendMessage} type="primary">
              Send
            </Button>
          </div>
        </div>
      )}
      <FloatButton
        onClick={() => {
          if (opened) {
            setOpened(false);
            setMessages([{ text: "How can I help you?", sender: "bot" }]);
          } else {
            setOpened(true);
          }
        }}
        icon={<MessageOutlined style={{ fontSize: 20, color: "gray" }} />}
        shape="square"
      />
    </>
  );
};

export default Chatbot;
