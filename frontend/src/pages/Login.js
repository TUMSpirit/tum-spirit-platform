import React, { Component } from "react";
import { useHistory } from "react-router-dom";
import {
  Layout,
  Button,
  Typography,
  Form,
  Input,
  Checkbox
} from "antd";
import Logo from "../assets/images/Spirit.png";

import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnreadMessage } from '../context/UnreadMessageContext';

function Login(props) {
  const [error, setError] = useState("");
  const signIn = useSignIn();
  const { setUnreadMessages } = useUnreadMessage();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    console.log("Values: ", values);
    setError("");

    const form_data = new FormData();
    form_data.append("username", values.username);
    form_data.append("password", values.password);

    try {
      const response = await axios.post(
        "/api/login",
        form_data
      );

      signIn({
        token: response.data.access_token,
        expiresIn: 129600,//90 tage logged in 
        tokenType: "bearer",
        authState: { username: values.username },
      });
      window.location.reload();
      //NEW CODE
    } catch (err) {
      if (err && err instanceof AxiosError)
        setError(err.response?.data.message);
      else if (err && err instanceof Error) setError(err.message);

      console.log("Error: ", err);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit,
  });

  return (
    <>
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
                <p className="form-title">Welcome back</p>
                <p>Login to the Dashboard</p>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your username!' }]}
                >
                  <Input
                    placeholder="Username"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    id="password-input" placeholder="Password"
                  />
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
    </>
  );
}

export default Login;

/* <Container>
      <InnerContainer>
        <form onSubmit={formik.handleSubmit}>
          <HeadingXXLarge>Welcome Back!</HeadingXXLarge>
          <ErrorText>{error}</ErrorText>
          <InputWrapper>
            <StyledInput
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              placeholder="Email"
              clearOnEscape
              size="large"
              type="username"
            />
          </InputWrapper>
          <InputWrapper>
            <StyledInput
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder="Password"
              clearOnEscape
              size="large"
              type="password"
            />
          </InputWrapper>
          <InputWrapper>
            <Button size="large" kind="primary" isLoading={formik.isSubmitting}>
              Login
            </Button>
          </InputWrapper>
        </form>
      </InnerContainer>
    </Container>*/