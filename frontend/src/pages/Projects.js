import React from 'react';
import {
  Typography
} from "antd";
import ProjectOverview from '../components/Admin/ProjectOverview';

function Projects() {
  return (
    <>
             <ProjectOverview></ProjectOverview>
    </>
  );
}

export default Projects;













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