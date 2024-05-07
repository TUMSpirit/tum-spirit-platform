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

const SignIn = () => {
  const history = useHistory();
  const { Title } = Typography;
  const { Header, Footer, Content } = Layout;


  const onFinish = (values) => {
      console.log("Success:", values);
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    }
    const login = () => {
      if(document.getElementById("password-input").value === "R3s3arch_23"){
        history.push('/kanban');
      }
    }
    return (
      <>
            <div className="login-page">
              <div className="picture-background">
                <div className="test-container1"/>
                <div className="test-container2">
              <div className="login-box">
                <Form
                    name="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                  <img id="login-logo" src={Logo} alt="Login" width="120px"/>
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
                    <Button onClick={login} type="primary" htmlType="submit" className="login-form-button">
                      LOGIN
                    </Button>
                  </Form.Item>
                </Form>
              </div>
                </div>
                  <div className="test-container3"/>
              </div>
            </div>
      </>
    );
}
export default SignIn;