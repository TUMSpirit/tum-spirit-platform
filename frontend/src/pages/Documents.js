import React from 'react';
import {
  Row,
  Col,
  Card,
  Radio,
  Table,
  Upload,
  message,
  Progress,
  Button,
  Avatar,
  Typography,
} from "antd";

import { ToTopOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

// Images
import ava1 from "../assets/images/logo-shopify.svg";
import ava2 from "../assets/images/logo-atlassian.svg";
import ava3 from "../assets/images/logo-slack.svg";
import ava5 from "../assets/images/logo-jira.svg";
import ava6 from "../assets/images/logo-invision.svg";
import doctype from "../assets/images/doc-type.png";
import filetype from "../assets/images/file-type.png";
import pencil from "../assets/images/pencil.svg";
import FileList from '../components/Documents/Documents';

const { Title } = Typography;

function Documents() {
  const onChange = (e) => console.log(`radio checked:${e.target.value}`);

  return (
    <>
             <FileList></FileList>
    </>
  );
}

export default Documents;













/*
const formProps = {
  name: "file",
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};
// table code start
const columns = [
  {
    title: "NAME",
    dataIndex: "name",
    key: "name",
    width: "32%",
  },
  {
    title: "TYPE",
    dataIndex: "type",
    key: "type",
  },

  {
    title: "LAST OPENED",
    key: "last_opened",
    dataIndex: "last_opened",
  }
];

const data = [
  {
    key: "1",
    name: (
      <>
        <Avatar.Group>
          <Avatar
            className="shape-avatar"
            shape="square"
            width={50}
            src={doctype}
          ></Avatar>
          <div className="avatar-info">
            <Title level={5}>Test_DOC2.doc</Title>
          </div>
        </Avatar.Group>{" "}
      </>
    ),
    type: (
      <>
        <div className="author-info">
          <Title level={5}>Word</Title>
        </div>
      </>
    ),

    last_opened: (
      <>
        <div className="author-info">
          <Title level={5}>19.12.2022 19:34</Title>
        </div>
      </>
    )
  },

  {
    key: "2",
    name: (
      <>
        <Avatar.Group>
          <Avatar
            className="shape-avatar"
            shape="square"
            size={40}
            src={filetype}
          ></Avatar>
          <div className="avatar-info">
            <Title level={5}>Test_PNG2.png</Title>
          </div>
        </Avatar.Group>{" "}
      </>
    ),
    type: (
      <>
        <div className="author-info">
          <Title level={5}>PNG-Type</Title>
        </div>
      </>
    ),

    last_opened: (
      <>
        <div className="author-info">
          <Title level={5}>16.12.2022 12:51</Title>
        </div>
      </>
    )
  },

  {
    key: "3",
    name: (
      <>
        <Avatar.Group>
          <Avatar
            className="shape-avatar"
            shape="square"
            size={40}
            src={doctype}
          ></Avatar>
          <div className="avatar-info">
            <Title level={5}>Test_DOC3.doc</Title>
          </div>
        </Avatar.Group>{" "}
      </>
    ),
    type: (
      <>
        <div className="author-info">
          <Title level={5}>Word</Title>
        </div>
      </>
    ),

    last_opened: (
      <>
        <div className="author-info">
          <Title level={5}>11.12.2022 18:32</Title>
        </div>
      </>
    )
  }
];*/