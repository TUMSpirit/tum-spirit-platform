import React, { useState, useEffect } from 'react';
import { Steps, Card, Progress, notification, Tooltip, Col, Row, Button } from 'antd';
import Confetti from 'react-confetti';
import ghost from "../../assets/images/ghost.png";
import ActivityFeed from '../TutorialPopup/ActivityFeed';
import Chatbot from '../AiChat/chat-bubble';

const { Step } = Steps;

const milestones = [
  {
    title: 'Meilenstein 1',
    description: '2023-05-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 1.',
  },
  {
    title: 'Meilenstein 2',
    description: '2023-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 2.',
  },
  {
    title: 'Meilenstein 3',
    description: '2023-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 3.',
  },
  {
    title: 'Meilenstein 4',
    description: '2024-06-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 4.',
  },
  {
    title: 'Meilenstein 5',
    description: '2024-07-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 5.',
  },
  {
    title: 'Meilenstein 6',
    description: '2024-08-01T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
  },
  {
    title: 'Meilenstein 7',
    description: '2024-08-09T16:00:00',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
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
  const [current, setCurrent] = useState(2);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [randomGreeting, setRandomGreeting] = useState('');
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setRandomGreeting(greetings[randomIndex]);

    
   /*const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setCurrent((prevCurrent) => {
            const newCurrent = prevCurrent + 1;
            if (newCurrent < milestones.length) {
              // Show notification
              notification.success({
                message: `Meilenstein ${newCurrent} erreicht`,
                description: milestones[newCurrent].title,
              });
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3500);
              return newCurrent;
            } else {
              clearInterval(interval); // Stop the interval when all milestones are done
              return prevCurrent;
            }
          });
          return 0; // Reset progress for the next milestone
        }
        return prevProgress + 1;
      });
    }, 100); // Increase progress every 100ms

    return () => clearInterval(interval);*/

  }, []);

  const onChange = (current) => {
    setCurrent(current);
    setProgress(0);
  };

  const openAiChat = () => {
    setOpened(true);
  };


  return (

    <div style={{ padding: '30px' }}>
      {showConfetti && <Confetti />}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card className="flex flex-col justify-between p-6 center-welcome" style={{ height: '300px' }}>
            <div className="flex justify-between">
              <div>
                <h1 className="text-4xl text-left">{randomGreeting}</h1>
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
          <ActivityFeed></ActivityFeed>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Timeline" bordered={false}>
            <Steps current={current} percent={milestones[current].progress} onChange={onChange} direction="horizontal" items={milestones}>
            </Steps>
            <div style={{ marginTop: '50px' }}>
              <Card title={milestones[current].title}>
                <p><strong>Datum:</strong> {milestones[current].date}</p>
                <p>{milestones[current].description}</p>
                <p>{milestones[current].details}</p>
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
      <Chatbot opened={opened} setOpened={setOpened}></Chatbot>
    </div>
  );
};

export default HorizontalTimeline;


/*        {milestones.map((milestone, index) => (
                <Tooltip key={index} title={milestone.title}>
                  <Step
                    key={index}
                    title={milestone.title}
                  />
                </Tooltip>
              ))}*/