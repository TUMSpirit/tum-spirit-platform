import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Button, Typography, Form, Input, Checkbox, message } from "antd";
import Logo from "../assets/images/Spirit.png";
import { useSignIn } from "react-auth-kit";
import axios, { AxiosError } from "axios";
import { useUnreadMessage } from '../context/UnreadMessageContext';

const { Title } = Typography;

function Login(props) {
  const [error, setError] = useState("");
  const signIn = useSignIn();
  const { setUnreadMessages } = useUnreadMessage();
  const navigate = useNavigate();
  

  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    setError("");
    const form_data = new FormData();
    form_data.append("username", values.username);
    form_data.append("password", values.password);

    try {
      const response = await axios.post("/api/login", form_data);
      signIn({
        token: response.data.access_token,
        expiresIn: 129600, // 90 days logged in
        tokenType: "bearer",
        authState: { username: values.username },
      });
      console.log("TEST");
      window.location.reload(true);
    } catch (err) {
      if (err && err instanceof AxiosError) {
        setError(err.response?.data.message || "Incorrect username or password.");
      } else if (err && err instanceof Error) {
        setError(err.message || "The username or password you entered is incorrect.");
      }
      console.log("Error: ", err);
    }
  };

  return (
    <div className="login-page">
      <div className="picture-background">
        <div className="test-container1" />
        <div className="test-container2">
          <div className="login-box">
            <Form
              name="login-form"
              form={form}
              initialValues={{ remember: true }}
              onFinish={onSubmit}
            >
              <img id="login-logo" src={Logo} alt="Login" width="120px" />
              <Title level={3} className="form-title">Welcome back</Title>
              <p>Login to the Dashboard</p>

              {error && (
                <Form.Item>
                  <Typography.Text type="danger">{error}</Typography.Text>
                </Form.Item>
              )}

              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input placeholder="Username" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password id="password-input" placeholder="Password" />
              </Form.Item>

              <Form.Item className="form-checkbox" name="remember" valuePropName="checked">
                <Checkbox height="50px">Remember me</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  LOGIN
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className="test-container3" />
      </div>
    </div>
  );
}

export default Login;
