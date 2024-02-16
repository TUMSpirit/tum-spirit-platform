import React, { useState } from "react";
import { MessageOutlined, SmileOutlined } from "@ant-design/icons"; // Assuming you're using Ant Design
import { Button, FloatButton, Input } from "antd";

const Chatbot = () => {
  // State to hold messages
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello, how can I help you?" },
  ]);
  // State to hold the current input
  const [inputValue, setInputValue] = useState("");

  // State ho hold the opened/closed state of the chat
  const [opened, setOpened] = useState(false);

  // Function to handle input change
  const handleInputChange = (event) => setInputValue(event.target.value);

  // Function to send the message
  const sendMessage = async () => {
    if (inputValue.trim()) {
      // Add user message to the chat
      setMessages([...messages, { role: "user", content: inputValue }]);
      // Clear the input
      setInputValue("");

      // post request to the backend to get the bot response
      const botResponse = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: inputValue }],
        }),
      });

      if (!botResponse.ok) {
        throw new Error("Failed to get bot response");
      }

      const response = await botResponse.json();

      console.log(response.choices[0].message.content);

      setMessages((prevMessages) => [
        ...prevMessages,
        { content: response.choices[0].message.content, role: "assistant" },
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
                    color: message.role === "assistant" ? "gray" : "black",
                  }}
                >
                  {message.content}
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
            setMessages([
              { content: "How can I help you?", role: "assistant" },
            ]);
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
