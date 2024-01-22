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
    <>
      <Chatbot />
    </>
  );
}

export default Chat;
