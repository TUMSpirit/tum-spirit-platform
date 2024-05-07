import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  List,
  Descriptions,
  Avatar,
} from "antd";

import { PlusOutlined, ExclamationOutlined } from "@ant-design/icons";
import mastercard from "../assets/images/mastercard-logo.png";
import paypal from "../assets/images/paypal-logo-2.png";
import visa from "../assets/images/visa-logo.png";
import Board from "../components/Board";

import Chatbot from "../components/AiChat/chat-bubble";

function Chat() {
  const data = [];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // This makes the div fill the entire height of the viewport
        width: "100vw", // To explicitly ensure it also covers the full width of the viewport
        background: "#ffffff", // Corrected the color code for white
      }}
    >
      <Chatbot />
    </div>
  );
}

export default Chat;
