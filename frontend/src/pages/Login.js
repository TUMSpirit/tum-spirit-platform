import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Button, Typography, Form, Input, Checkbox, Spin } from "antd";
import Logo from "../assets/images/Spirit.png";
import { useSignIn } from "react-auth-kit";
import axios, { AxiosError } from "axios";
import { useUnreadMessage } from "../context/UnreadMessageContext";
import jwtDecode from "jwt-decode";

const { Title } = Typography;

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signIn = useSignIn();
  const { setUnreadMessages } = useUnreadMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // 🔹 1. Handle auto-login via token (from Moodle LTI redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      setLoading(true);
      try {
        const decoded = jwtDecode(token);
        signIn({
          token: token,
          expiresIn: 60 * 60 * 24 * 90, // 90 days
          tokenType: "Bearer",
          authState: {
            username: decoded.username,
            role: decoded.role,
          },
        });

        // Clean up the URL (remove ?token=)
        window.history.replaceState({}, document.title, "/redirect");
        navigate("/redirect");
      } catch (err) {
        console.error("Invalid token:", err);
        setError("Invalid login token. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }, [location.search, navigate, signIn]);

  // 🔹 2. Manual login form submission
  const onSubmit = async (values) => {
    setError("");
    const form_data = new FormData();
    form_data.append("username", values.username);
    form_data.append("password", values.password);

    try {
      const response = await axios.post("/api/login", form_data);
      signIn({
        token: response.data.access_token,
        expiresIn: 60 * 60 * 24 * 90, // 90 days
        tokenType: "Bearer",
        authState: {
          username: values.username,
          role: response.data.role,
        },
      });
      window.location.reload(true);
    } catch (err) {
      if (err && err instanceof AxiosError) {
        setError(err.response?.data.message || "Incorrect username or password.");
      } else if (err && err instanceof Error) {
        setError(err.message || "The username or password you entered is incorrect.");
      }
      console.error("Error during login:", err);
    }
  };

  // 🔹 3. Optional loading spinner for Moodle redirect
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: "#555" }}>Signing you in via Moodle...</p>
      </div>
    );
  }

  // 🔹 4. Default manual login form
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
              <img id="login-logo" src={Logo} alt="Login" />
              <Title level={3} className="form-title">Welcome back</Title>
              <p>Login to the Dashboard</p>

              {error && (
                <Form.Item>
                  <Typography.Text type="danger">{error}</Typography.Text>
                </Form.Item>
              )}

              <Form.Item
                name="username"
                rules={[{ required: true, message: "Please input your username!" }]}
              >
                <Input placeholder="Username" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please input your password!" }]}
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
