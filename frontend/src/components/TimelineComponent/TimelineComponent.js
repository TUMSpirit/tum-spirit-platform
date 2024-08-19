import React, { useState, useEffect } from 'react';
import { Steps, Card, Progress, notification, Col, Row, Button, Typography, Divider, Tag, Modal, Form, Input, DatePicker } from 'antd';
import Confetti from 'react-confetti';
import ghost from "../../assets/images/ghost.png";
import { ClockCircleOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import ActivityFeed from '../TutorialPopup/ActivityFeed';
import Chatbot from '../AiChat/chat-bubble';
import moment from 'moment';
import { useSocket } from '../../context/SocketProvider';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

const startDate = '2023-04-01T16:00:00';

const initialMilestones = [
  {
    title: 'Meilenstein 1',
    date: '2023-05-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 1.',
  },
  {
    title: 'Meilenstein 2',
    date: '2023-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 2.',
  },
  {
    title: 'Meilenstein 3',
    date: '2023-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 3.',
  },
  {
    title: 'Meilenstein 4',
    date: '2024-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 4.',
  },
  {
    title: 'Meilenstein 5',
    date: '2024-07-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 5.',
  },
  {
    title: 'Meilenstein 6',
    date: '2024-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
  },
  {
    title: 'Meilenstein 7',
    date: '2024-09-10T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 7.',
  }
];

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

const HorizontalTimeline = () => {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [randomGreeting, setRandomGreeting] = useState('');
  const [opened, setOpened] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const {currentUser} = useSocket()

  useEffect(() => {
    const updatedMilestones = calculateProgress(milestones);
    setMilestones(updatedMilestones);

    const now = moment();
    let completedMilestones = 0;

    milestones.forEach((milestone) => {
      if (moment(milestone.date).isBefore(now)) {
        completedMilestones++;
      }
    });

    if (completedMilestones >= milestones.length) {
      // Trigger celebration popup
      setCelebrationVisible(true);
      setShowConfetti(true);
      setCurrent(milestones.length - 1); // Show last milestone
      setProgress(100); // Set progress to 100% for the last milestone
    } else {
      setCurrent(completedMilestones);
      setProgress(milestones[completedMilestones]?.percent || 0);
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    setRandomGreeting(greetings[randomIndex]);
  }, [milestones]);

  const calculateProgress = (milestones) => {
    let now = moment();
    let currentDateTime = moment(milestones[0].date);
    let previousDateTime = moment(startDate);
    let totalHours = currentDateTime.diff(previousDateTime, 'hours');
    let elapsedHours = now.diff(previousDateTime, 'hours');
    let progressPercent = (elapsedHours / totalHours) * 100;
    progressPercent = Math.floor(Math.max(0, Math.min(progressPercent, 100)));
    milestones[0].percent = progressPercent;

    for (let i = 1; i < milestones.length; i++) {
      let currentDateTime = moment(milestones[i].date);
      let previousDateTime = moment(milestones[i - 1].date);
      let totalHours = currentDateTime.diff(previousDateTime, 'hours');
      let elapsedHours = now.diff(previousDateTime, 'hours');
      let progressPercent = (elapsedHours / totalHours) * 100;
      progressPercent = Math.floor(Math.max(0, Math.min(progressPercent, 100)));
      milestones[i].percent = progressPercent;
    }

    return milestones;
  };

  const onChange = (current) => {
    setCurrent(current);
    setProgress(milestones[current]?.percent || 0);
  };

  const openAiChat = () => {
    setOpened(true);
    //setShowConfetti(true);
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
    description: milestone.date,
    className: index === current ? 'custom-step' : '',
    status: index === current ? 'process' : (milestone.percent === 100 ? 'finish' : 'wait')
  }));

  return (
    <div style={{ padding: '20px' }}>
      {showConfetti && <Confetti />}
      {celebrationVisible && (
        <Modal
          title="Congratulations!"
          visible={celebrationVisible}
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
                <Title level={2} style={{fontSize:'2.9vh'}} className="text-left">{randomGreeting}{currentUser?currentUser.username:"Friend"}</Title>
                <Button type="primary" className="mt-2" onClick={openAiChat}>Chat with me</Button>
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
    </div>
  );
};

export default HorizontalTimeline;

//extra={<Button type="primary" onClick={() => setModalVisible(true)}>+ Create Card</Button>} As Extra button for milestone-card