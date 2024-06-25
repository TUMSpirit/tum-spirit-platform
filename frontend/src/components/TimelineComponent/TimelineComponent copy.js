import React, { useState, useEffect } from 'react';
import { Steps, Card, Progress, notification, Tooltip, Col, Row, Button, Typography, Divider, Tag } from 'antd';
import Confetti from 'react-confetti';
import ghost from "../../assets/images/ghost.png";
import ActivityFeed from '../TutorialPopup/ActivityFeed';
import Chatbot from '../AiChat/chat-bubble';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

const milestones = [
  {
    title: 'Meilenstein 1',
    description: '2023-05-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 1.',
    percent:10
  },
  {
    title: 'Meilenstein 2',
    description: '2023-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 2.',
    percent:100
  },
  {
    title: 'Meilenstein 3',
    description: '2023-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 3.',
    percent:100
  },
  {
    title: 'Meilenstein 4',
    description: '2024-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 4.',
    percent:10
  },
  {
    title: 'Meilenstein 5',
    description: '2024-07-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 5.',
    percent:100
  },
  {
    title: 'Meilenstein 6',
    description: '2024-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
    percent:40
  },
  {
    title: 'Meilenstein 7',
    description: '2024-08-09T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
    percent:100
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
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusCheck, setStatusCheck] = useState(['wait','wait','wait','wait','process','wait']);
  const [currentMilestone, setcurrentMilestone] = useState(10);
  const [showConfetti, setShowConfetti] = useState(false);
  const [randomGreeting, setRandomGreeting] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setRandomGreeting(greetings[randomIndex]);

    const now = new Date();
    let completedMilestones = 0;

    milestones.forEach((milestone, index) => {
      const milestoneDate = new Date(milestone.date);
      if (now >= milestoneDate) {
        completedMilestones = index + 1;
      }
    });

    if (completedMilestones > 0) {
      setCurrent(completedMilestones - 1);
      setProgress(milestones[completedMilestones - 1].progress);
    }

   /* const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setCurrent((prevCurrent) => {
            const newCurrent = prevCurrent + 1;
            if (newCurrent < milestones.length) {
              notification.success({
                message: `Meilenstein ${newCurrent + 1} erreicht`,
                description: milestones[newCurrent].title,
              });
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3500);
              return newCurrent;
            } else {
              clearInterval(interval);
              return prevCurrent;
            }
          });
          return 0;
        }
        return prevProgress + 1;
      });
    }, 100);

    return () => clearInterval(interval);*/

  }, []);

  const calculateProgress = (milestoneDate) => {
    const now = new Date();
    const milestoneTime = new Date(milestoneDate).getTime();
    const previousMilestoneTime = current > 0 ? new Date(milestones[current - 1].date).getTime() : milestoneTime - 1000 * 60 * 60 * 24;
    const totalDuration = milestoneTime - previousMilestoneTime;
    const elapsedTime = now.getTime() - previousMilestoneTime;
    return Math.min((elapsedTime / totalDuration) * 100, 100);
  };

  const onChange = (current) => {
    setCurrent(current);
    setcurrentMilestone(milestones[current].percent);
    setProgress(0);
    setStatusCheck(['finish','wait','wait','process','wait','wait'])
  };

  const openAiChat = () => {
    setOpened(true);
  };

  const stepItems = milestones.map((milestone, index) => ({
    title: milestone.title,
    description: milestone.description,
    className: index === activeStep ? 'custom-step' : '',
    status: statusCheck[index]
}));

  return (
    <div style={{ padding: '30px' }}>
      {showConfetti && <Confetti />}
      <Row gutter={[16, 16]}>
        <Col span={12}>
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
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <ActivityFeed />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Timeline" bordered={false}>
            <Steps current={current} percent={currentMilestone} type="default" onChange={onChange} direction="horizontal" items={stepItems} />
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
    </div>
  );
};

export default HorizontalTimeline;
