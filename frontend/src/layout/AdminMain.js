import React from "react";
import { Layout } from "antd";

const { Header, Content } = Layout;

const AdminMain = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#001529", padding: "0 24px" }}>
        <h1 style={{ color: "white" }}>Admin Panel</h1>
      </Header>
      <Content style={{ padding: "24px" }}>{children}</Content>
    </Layout>
  );
};

export default AdminMain;
