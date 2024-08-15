import React, { useState, useEffect } from 'react';
import { Steps, Card, Progress, notification, Col, Row, Button, Typography, Divider, Tag, Modal, Form, Input } from 'antd';
import Confetti from 'react-confetti';
import ghost from "../../assets/images/ghost.png";
import ActivityFeed from '../TutorialPopup/ActivityFeed';
import Chatbot from '../AiChat/chat-bubble';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

const initialMilestones = [
  {
    title: 'Meilenstein 1',
    description: '2023-05-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 1.',
    percent: 10
  },
  {
    title: 'Meilenstein 2',
    description: '2023-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 2.',
    percent: 100
  },
  {
    title: 'Meilenstein 3',
    description: '2023-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 3.',
    percent: 100
  },
  {
    title: 'Meilenstein 4',
    description: '2024-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 4.',
    percent: 10
  },
  {
    title: 'Meilenstein 5',
    description: '2024-07-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 5.',
    percent: 100
  },
  {
    title: 'Meilenstein 6',
    description: '2024-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
    percent: 40
  },
  {
    title: 'Meilenstein 7',
    description: '2024-08-09T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 7.',
    percent: 100
  }
];

const greetings = [
  'Hallo, Jonas', // Deutsch
  'Hello, Jonas', // Englisch
  'Hola, Jonas',  // Spanisch
  'Bonjour, Jonas', // Französisch
  'Ciao, Jonas', // Italienisch
  'Olá, Jonas', // Portugiesisch
  'こんにちは、Jonas', // Japanisch
  '안녕하세요, Jonas', // Koreanisch
  '你好, Jonas', // Chinesisch
  'Привет, Jonas', // Russisch
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

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setRandomGreeting(greetings[randomIndex]);

    const now = new Date();
    let completedMilestones = 0;

    milestones.forEach((milestone, index) => {
      const milestoneDate = new Date(milestone.description);
      if (now >= milestoneDate) {
        completedMilestones = index + 1;
      }
    });

    if (completedMilestones > 0) {
      setCurrent(completedMilestones - 1);
      setProgress(calculateProgress(milestones[completedMilestones - 1].description));
    }
  }, [milestones]);

  const calculateProgress = (milestoneDate) => {
    const now = new Date();
    const milestoneTime = new Date(milestoneDate).getTime();
    const previousMilestoneTime = current > 0 ? new Date(milestones[current - 1].description).getTime() : milestoneTime - 1000 * 60 * 60 * 24;
    const totalDuration = milestoneTime - previousMilestoneTime;
    const elapsedTime = now.getTime() - previousMilestoneTime;
    return Math.min((elapsedTime / totalDuration) * 100, 100);
  };

  const onChange = (current) => {
    setCurrent(current);
    setProgress(calculateProgress(milestones[current].description));
  };

  const openAiChat = () => {
    setOpened(true);
  };

  const handleCreateMilestone = () => {
    form.validateFields().then(values => {
      const newMilestone = {
        title: values.title,
        description: values.description,
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
    description: milestone.description,
    className: index === current ? 'custom-step' : '',
    status: index === current ? 'process' : (milestone.percent === 100 ? 'finish' : 'wait')
  }));

  return (
    <div style={{ padding: '30px' }}>
      {showConfetti && <Confetti />}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="flex flex-col justify-between p-6 center-welcome" style={{ height: '300px' }}>
            <div className="flex justify-between">
              <div>
                <Title level={2} className="text-left">{randomGreeting}</Title>
                <Button type="primary" className="mt-2" onClick={openAiChat}>Chat with me</Button>
              </div>
              <img
                src={ghost}
                alt="Geist"
                className="h-24"
                style={{ maxWidth: '100%', height: 'auto' }}
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
          <Card title="Timeline" bordered={false} extra={<Button type="primary" onClick={() => setModalVisible(true)}>+ Create Card</Button>}>
            <Steps current={current} type="default" onChange={onChange} direction="horizontal" items={stepItems} />
            <div style={{ marginTop: '20px' }}>
              <Card>
                <Title level={4}>{milestones[current].title}</Title>
                <Divider />
                <Row>
                  <Col span={12}>
                    <Paragraph>
                      <Text strong>Datum:</Text> {milestones[current].description.split('T')[0]}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Uhrzeit:</Text> {milestones[current].description.split('T')[1]}
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
                  <Text strong>Beschreibung:</Text> {milestones[current].description}
                </Paragraph>
                <Paragraph>
                  <Text strong>Details:</Text> {milestones[current].details}
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
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description of the milestone!' }]}
          >
            <Input />
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
