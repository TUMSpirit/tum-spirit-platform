import React, { useState, useEffect } from 'react';
import { Steps, Card, Progress, notification, Col, Row, Button, Typography, Divider, Tag, Modal, Form, Input } from 'antd';
import Confetti from 'react-confetti';
import ghost from "../../assets/images/ghost.png";
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import ActivityFeed from '../TutorialPopup/ActivityFeed';
import Chatbot from '../AiChat/chat-bubble';
import moment from 'moment';

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
    date: '2024-08-09T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 7.',
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
    calculateProgress(milestones);
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setRandomGreeting(greetings[randomIndex]);

    const now = moment();
    let completedMilestones = 0;

    milestones.forEach((milestone, index) => {
      const milestoneDate = moment(milestone.date);
      if (milestoneDate.isBefore(now)) {
        completedMilestones++;
      }
    });

    if (completedMilestones > 0) {
      setCurrent(completedMilestones);
      setProgress(milestones[completedMilestones].percent);
    }

  }, [milestones]);

  const calculateProgress = (milestones) => {
    // Aktuelles Datum und Zeit als Moment.js-Objekt
    let now = moment();
    let currentDateTime = moment(milestones[0].date);
    let previousDateTime = moment(startDate);
    let totalHours = currentDateTime.diff(previousDateTime, 'hours');
    let elapsedHours = now.diff(previousDateTime, 'hours');
    let progressPercent = (elapsedHours / totalHours) * 100;
    progressPercent = Math.floor(Math.max(0, Math.min(progressPercent, 100)));
    milestones[0].percent = progressPercent;

    // Durchlaufen des Arrays, beginnend ab dem zweiten Element
    for (let i = 1; i < milestones.length; i++) {
      // Datum und Zeit des aktuellen Objekts als Moment.js-Objekt
      let currentDateTime = moment(milestones[i].date);
      // Datum und Zeit des vorherigen Objekts als Moment.js-Objekt
      let previousDateTime = moment(milestones[i - 1].date);
      // Berechnen der Differenz in Stunden zwischen den beiden Zeitpunkten
      let totalHours = currentDateTime.diff(previousDateTime, 'hours');
      // Berechnen der vergangenen Stunden bis jetzt
      let elapsedHours = now.diff(previousDateTime, 'hours');
      // Berechnen des Fortschritts in Prozent
      let progressPercent = (elapsedHours / totalHours) * 100;
      // Begrenzung des Fortschritts zwischen 0 und 100 Prozent
      progressPercent = Math.floor(Math.max(0, Math.min(progressPercent, 100)));
      // Aktualisierung des aktuellen Objekts im Array mit dem Fortschrittsprozentsatz
      milestones[i].percent = progressPercent;
    }

    // Rückgabe des aktualisierten Arrays
    return milestones;
  };

  const onChange = (current) => {
    setCurrent(current);
    setProgress(milestones[current].percent);
  };

  const openAiChat = () => {
    setOpened(true);
    setShowConfetti(true);
  };

  const handleCreateMilestone = () => {
    /*form.validateFields().then(values => {
      const newMilestone = {
        title: values.title,
        date: values.date,
        details: values.details,
        percent: 0
      };
      setMilestones([...milestones, newMilestone]);
      setModalVisible(false);
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });*/
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
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="flex flex-col justify-between p-6 center-welcome" style={{ height: '250px' }}>
            <div className="flex justify-between">
              <div>
                <Title level={2} className="text-left">{randomGreeting}</Title>
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
              <Card title={milestones[current].title} className="milestone-card" extra={<Button type="primary" onClick={() => setModalVisible(true)}>+ Create Card</Button>}>
                <Row>
                  <Col span={12}>
                    <Paragraph>
                      <CalendarOutlined /> {moment(milestones[current].date).format('DD.MM.YYYY')}
                    </Paragraph>
                    <Paragraph>
                      <ClockCircleOutlined /> {moment(milestones[current].date).format('HH:mm')}
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
            name="date"
            label="date"
            rules={[{ required: true, message: 'Please input the date of the milestone!' }]}
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
