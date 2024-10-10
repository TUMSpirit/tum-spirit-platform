import React, { useState, useEffect } from 'react';
import { Steps, Card, Progress, notification, Col, Row, Button, Typography, Divider, Tag, Modal, Form, Input, DatePicker, Spin, message } from 'antd';
import Confetti from 'react-confetti';
import ghost from "../../assets/images/ghost.png";
import { ClockCircleOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import ActivityFeed from '../TutorialPopup/ActivityFeed';
import Chatbot from '../AiChat/chat-bubble';
import moment from 'moment';
import axios from 'axios';
import { useSocket } from '../../context/SocketProvider';
import { useAuthHeader } from 'react-auth-kit';
import Discussions from '../Discussions/Discussions';  // Import your discussion forum


const { Title, Text, Paragraph } = Typography;

const HorizontalTimeline = ({ projectId }) => {
  const [milestones, setMilestones] = useState([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [randomGreeting, setRandomGreeting] = useState('');
  const [opened, setOpened] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [form] = Form.useForm();
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const { currentUser, projectInformation } = useSocket();
  const [startDate, setStartDate] = useState(''); // Start Date State
  const authHeader = useAuthHeader();

  const greetings = [
    'Hallo, ', // Deutsch
    'Hello, ', // Englisch
    'Hola, ',  // Spanisch
    'Bonjour, ', // Französisch
    'Ciao, ', // Italienisch
    'Olá, ', // Portugiesisch
    'こんにちは、', // Japanisch
    '你好, ', // Chinesisch
    'Привет, ', // Russisch
  ];

  useEffect(() => {
    if (projectInformation) {
      // Assume projectInformation has { milestones, start_date } structure
      const { milestones: fetchedMilestones, start_date } = projectInformation;
      setLoading(true); // Start loading
      setStartDate(start_date);
      const updatedMilestones = calculateProgress(fetchedMilestones, start_date);
      setMilestones(updatedMilestones);
      setLoading(false); // End loading

      updateCurrentMilestoneProgress(updatedMilestones); // Update the current milestone and progress
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    setRandomGreeting(greetings[randomIndex]);
  }, [projectInformation]);

  const calculateProgress = (milestones, startDate) => {
    let now = moment();
    let updatedMilestones = milestones.map((milestone, index) => {
      let previousDateTime = index === 0 ? moment(startDate) : moment(milestones[index - 1].date);
      let currentDateTime = moment(milestone.date);
      let totalHours = currentDateTime.diff(previousDateTime, 'hours');
      let elapsedHours = now.diff(previousDateTime, 'hours');
      let progressPercent = Math.floor(Math.max(0, Math.min((elapsedHours / totalHours) * 100, 100)));
      return { ...milestone, percent: progressPercent };
    });

    return updatedMilestones;
  };

  // This function updates the current milestone and its progress on component mount
  const updateCurrentMilestoneProgress = (milestones) => {
    const now = moment();
    let completedMilestones = 0;

    milestones.forEach((milestone) => {
      if (moment(milestone.date).isBefore(now)) {
        completedMilestones++;
      }
    });

    if (completedMilestones >= milestones.length) {
      //setCelebrationVisible(true);
      //setShowConfetti(true);
      setCurrent(milestones.length - 1); // Show the last milestone
      setProgress(100); // Set progress to 100% for the last milestone
    } else {
      setCurrent(completedMilestones);
      setProgress(milestones[completedMilestones]?.percent || 0);
    }
  };

  const onChange = (current) => {
    setCurrent(current);
    setProgress(milestones[current]?.percent || 0);
  };

  const openAiChat = () => {
    setOpened(true);
  };

  const handleCreateMilestone = () => {
    form.validateFields().then(values => {
      const newMilestone = {
        title: values.title,
        date: values.date.format('YYYY-MM-DDTHH:mm:ss'),
        details: values.details,
        percent: 0
      };
      setMilestones([...milestones, newMilestone]);
      setModalVisible(false);
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const stepItems = milestones.map((milestone, index) => ({
    title: milestone.title,
    description: moment(milestone.date).format('DD.MM.YYYY'),  // Format date nicely
    className: index === current ? 'custom-step' : '',
    status: index === current ? 'process' : (milestone.percent === 100 ? 'finish' : 'wait')
  }));

  return (
    <div style={{ padding: '20px' }}>
      {showConfetti && <Confetti />}
      {celebrationVisible && (
        <Modal
          title="Congratulations!"
          open={celebrationVisible}
          onOk={() => setCelebrationVisible(false)}
          onCancel={() => setCelebrationVisible(false)}
          footer={[
            <Button key="ok" type="primary" onClick={() => setCelebrationVisible(false)}>
              OK
            </Button>,
          ]}
        >
          <div style={{ textAlign: 'center' }}>
            <TrophyOutlined style={{ fontSize: '48px', color: '#fadb14' }} />
            <Title level={2} style={{ margin: '20px 0' }}>Congratulations! All milestones are completed!</Title>
            <Paragraph>
              You’ve successfully completed all the milestones for this project. Great job!
            </Paragraph>
          </div>
        </Modal>
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="flex flex-col justify-between p-6 center-welcome" style={{ height: '250px' }}>
            <div className="flex justify-between">
              <div>
                <Title level={2} style={{ fontSize: "1.3rem" }} className="text-left">{randomGreeting}{currentUser ? currentUser.username : "Friend"}</Title>
                <Button style={{ background: "#7D4EBC" }} type="primary" className="mt-2" onClick={openAiChat}>Chat with me</Button>
              </div>
              <img
                src={ghost}
                alt="Geist"
                className="h-24"
                style={{ maxWidth: '100%', padding: "0 10%" }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <ActivityFeed />
        </Col>
      </Row>
      {loading ? (
        <Spin size="large" style={{ display: 'block', marginTop: '20px' }} />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Card title="Timeline" bordered={false}>
                <Steps current={current} type="default" percent={progress} onChange={onChange} direction="horizontal" items={stepItems} />
                <div style={{ marginTop: '20px' }}>
                  <Card title={milestones[current]?.title} className="milestone-card">
                    <Row>
                      <Col span={12}>
                        <Paragraph>
                          <CalendarOutlined /> {moment(milestones[current]?.date).format('DD.MM.YYYY')}
                        </Paragraph>
                        <Paragraph>
                          <ClockCircleOutlined /> {moment(milestones[current]?.date).format('HH:mm')}
                        </Paragraph>
                      </Col>
                      <Col span={12}>
                        <Tag color={progress >= 100 ? 'green' : 'blue'} style={{ float: 'right' }}>
                          {progress >= 100 ? 'Erledigt' : 'In Bearbeitung'}
                        </Tag>
                      </Col>
                    </Row>
                    <Divider />
                    <Paragraph>
                      <Text strong>Details:</Text> {milestones[current]?.details}
                    </Paragraph>
                    <Divider />
                    <Progress
                      percent={progress}
                      status={progress >= 100 ? 'success' : 'active'}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </Card>
                </div>
              </Card>
            </Col>
          </Row>
          <Chatbot opened={opened} setOpened={setOpened} />

          <Modal
            title="Create New Milestone"
            open={modalVisible}
            onOk={handleCreateMilestone}
            onCancel={() => setModalVisible(false)}
          >
            <Form form={form} layout="vertical" name="form_in_modal">
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please input the title of the milestone!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please input the date of the milestone!' }]}
              >
                <DatePicker format="YYYY-MM-DDTHH:mm:ss" showTime />
              </Form.Item>
              <Form.Item
                name="details"
                label="Details"
                rules={[{ required: true, message: 'Please input the details of the milestone!' }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
          <Discussions projectId={projectInformation.id} /> {/* Pass projectId to fetch project-related discussions */}
        </>
      )}
    </div>
  );
};

export default HorizontalTimeline;
