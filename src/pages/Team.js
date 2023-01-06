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
import face from "../assets/images/avatar1.png";
import face2 from "../assets/images/avatar2.png";
import face3 from "../assets/images/avatar3.png";
import pencil from "../assets/images/pencil.svg";

const { Title } = Typography;

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
    title: "MEMBER",
    dataIndex: "name",
    key: "name",
    width: "32%",
  },
  {
    title: "ROLE",
    dataIndex: "role",
    key: "role",
  },

  {
    title: "STATUS",
    key: "status",
    dataIndex: "status",
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
                        size={40}
                        src={face}
                    ></Avatar>
                    <div className="avatar-info">
                        <Title level={5}>John Johnson</Title>
                        <p>john@mail.com</p>
                    </div>
                </Avatar.Group>{" "}
            </>
        ),
        role: (
            <>
                <div className="author-info">
                    <Title level={5}>Manager</Title>
                    <p>Organization</p>
                </div>
            </>
        ),

        status: (
            <>
                <Button type="primary" className="tag-primary">
                    ONLINE
                </Button>
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
                        src={face2}
                    ></Avatar>
                    <div className="avatar-info">
                        <Title level={5}>Max Muster</Title>
                        <p>max@mail.com</p>
                    </div>
                </Avatar.Group>{" "}
            </>
        ),
        role: (
            <>
                <div className="author-info">
                    <Title level={5}>Programator</Title>
                    <p>Developer</p>
                </div>
            </>
        ),

        status: (
            <>
                <Button className="tag-badge">OFFLINE</Button>
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
                        src={face3}
                    ></Avatar>
                    <div className="avatar-info">
                        <Title level={5}>Clara Copyright</Title>
                        <p>clara@mail.com</p>
                    </div>
                </Avatar.Group>{" "}
            </>
        ),
        role: (
            <>
                <div className="author-info">
                    <Title level={5}>Coordinator</Title>
                    <p>Projects</p>
                </div>
            </>
        ),

        status: (
            <>
                <Button type="primary" className="tag-primary">
                    ONLINE
                </Button>
            </>
        )
    }
    ]

function Team() {
  const onChange = (e) => console.log(`radio checked:${e.target.value}`);

  return (
      <>
        <div className="tabled">
          <Row gutter={[24, 0]}>
            <Col xs="24" xl={24}>
              <Card
                  bordered={false}
                  className="criclebox tablespace mb-24"
              >
                <div className="table-responsive">
                  <Table
                      columns={columns}
                      dataSource={data}
                      pagination={false}
                      className="ant-border-space"
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </>
  );
}

export default Team;
