import React, { useState } from "react";
import { Button, Input, Typography, Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader } from "react-auth-kit";

const { Title } = Typography;

const SetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const authHeader = useAuthHeader(); // ✅ get the header function

  const onFinish = async (values) => {
    const { password, confirm } = values;

    if (password !== confirm) {
      message.error("Passwords do not match");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `${authHeader()}`, // ✅ call the function
        },
      };

      await axios.post(
        "/api/set-password",
        { new_password: password },
        config
      );

      await axios.post(
        "/api/update-settings",
        { is_first_login: false },
        config
      );

      message.success("Password updated successfully");
      navigate("/intro"); // or navigate("/") if you prefer
    } catch (error) {
      console.error("Password update failed:", error);
      message.error("Password update failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: 24,
        border: "1px solid #f0f0f0",
        borderRadius: 8,
        backgroundColor: "#fff",
        textAlign: "center",
      }}
    >
      <Title level={3}>Set Your New Password</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="New Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="confirm"
          rules={[{ required: true, message: "Please confirm your password!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Set Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SetPassword;
