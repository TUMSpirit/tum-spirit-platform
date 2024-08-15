import React, { useState } from 'react';
import { Button, Modal, Menu, Card, notification, Progress, Tooltip, Timeline, Row, Col, Badge } from 'antd';
import { CheckCircleTwoTone, TrophyTwoTone, ClockCircleOutlined } from '@ant-design/icons';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import ShopPopup from './ShopPopup';

const { SubMenu } = Menu;

const tutorials = [
  // Tutorial data
  {
    category: 'React',
    items: [
      {
        id: 1,
        title: 'React Basics',
        description: 'Learn the fundamentals of React.',
        steps: [
          'Introduction to React',
          'Setting up the Environment',
          'Creating a Simple Component',
          'Understanding JSX',
          'Props and State'
        ],
        coins: 50
      },
      {
        id: 2,
        title: 'State and Props',
        description: 'Understand state and props in React.',
        steps: [
          'Introduction to State and Props',
          'Using State in a Component',
          'Passing Props to a Component',
          'State and Props Example'
        ],
        coins: 40
      },
      {
        id: 3,
        title: 'Lifecycle Methods',
        description: 'Learn about React lifecycle methods.',
        steps: [
          'Introduction to Lifecycle Methods',
          'Mounting Phase',
          'Updating Phase',
          'Unmounting Phase'
        ],
        coins: 30
      },
      {
        id: 4,
        title: 'Hooks',
        description: 'Introduction to React hooks.',
        steps: [
          'Introduction to Hooks',
          'useState Hook',
          'useEffect Hook',
          'Custom Hooks'
        ],
        coins: 50
      }
    ],
  },
  {
    category: 'React Router',
    items: [
      {
        id: 5,
        title: 'Routing',
        description: 'Learn how to use React Router.',
        steps: [
          'Introduction to React Router',
          'Setting up React Router',
          'Creating Routes',
          'Navigating between Routes'
        ],
        coins: 30
      }
    ],
  },
  {
    category: 'State Management',
    items: [
      {
        id: 6,
        title: 'Redux Basics',
        description: 'Introduction to Redux.',
        steps: [
          'Introduction to Redux',
          'Setting up Redux',
          'Creating Actions and Reducers',
          'Connecting Redux to React'
        ],
        coins: 50
      },
      {
        id: 7,
        title: 'MobX Basics',
        description: 'Introduction to MobX.',
        steps: [
          'Introduction to MobX',
          'Setting up MobX',
          'Creating Observables and Actions',
          'Connecting MobX to React'
        ],
        coins: 40
      }
    ],
  }
];

const TutorialPopup = () => {
  const [visible, setVisible] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const [coins, setCoins] = useState(0);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
    notification.success({
      message: 'Tutorials Updated',
      description: 'Your progress has been saved.',
    });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const onSelectTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setIsTutorialStarted(false);
  };

  const onStartTutorial = () => {
    setIsTutorialStarted(true);
  };

  const onNextStep = () => {
    if (currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted((prevCompleted) => {
        if (!prevCompleted.includes(selectedTutorial.id)) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          setCoins(coins + selectedTutorial.coins);
          notification.success({
            message: 'Congratulations!',
            description: `You have completed the ${selectedTutorial.title} tutorial and earned ${selectedTutorial.coins} Tutorial Coins!`,
            icon: <TrophyTwoTone twoToneColor="#eb2f96" />,
          });
          return [...prevCompleted, selectedTutorial.id];
        }
        return prevCompleted;
      });
      setIsTutorialStarted(false);
    }
  };

  const progress = (completed.length / tutorials.flatMap(cat => cat.items).length) * 100;

  return (
    <div>
      {showConfetti && <Confetti />}
      <Button type="primary" onClick={showModal}>
        Open Tutorials
      </Button>
      <Modal
        title="Complete the Tutorials"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save Progress"
        cancelText="Cancel"
        width={1200}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Menu mode="inline" style={{ height: '100%' }}>
              {tutorials.map((category) => (
                <SubMenu key={category.category} title={category.category}>
                  {category.items.map((tutorial) => (
                    <Menu.Item
                      key={tutorial.id}
                      onClick={() => onSelectTutorial(tutorial)}
                      style={{
                        background: completed.includes(tutorial.id) ? '#f6ffed' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {completed.includes(tutorial.id) ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : null} {tutorial.title}
                    </Menu.Item>
                  ))}
                </SubMenu>
              ))}
            </Menu>
          </Col>
          <Col span={18}>
            {selectedTutorial ? (
              <Card title={selectedTutorial.title} bordered={false}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {!isTutorialStarted ? (
                    <div>
                      <p>{selectedTutorial.description}</p>
                      <Button type="primary" onClick={onStartTutorial}>
                        Start Tutorial
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Timeline mode="top">
                        {selectedTutorial.steps.map((step, index) => (
                          <Timeline.Item
                            key={index}
                            dot={currentStep >= index ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <ClockCircleOutlined />}
                            color={currentStep >= index ? 'green' : 'gray'}
                          >
                            {step}
                          </Timeline.Item>
                        ))}
                      </Timeline>
                      <div style={{ marginTop: '20px' }}>
                        <Button type="primary" onClick={onNextStep}>
                          {currentStep < selectedTutorial.steps.length - 1 ? 'Next Step' : 'Finish Tutorial'}
                        </Button>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <Progress percent={(currentStep / selectedTutorial.steps.length) * 100} status="active" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </Card>
            ) : (
              <Card title="Select a Tutorial" bordered={false}>
                <p>Select a tutorial from the list to start.</p>
              </Card>
            )}
          </Col>
        </Row>
      </Modal>
      <ShopPopup coins={coins} setCoins={setCoins} />
      <div style={{ position: 'fixed', top: '20px', right: '20px' }}>
        <Tooltip title="Your Tutorial Coins">
          <Badge count={coins} showZero overflowCount={999} style={{ backgroundColor: '#52c41a' }}>
            <TrophyTwoTone twoToneColor="#fadb14" style={{ fontSize: '32px' }} />
          </Badge>
        </Tooltip>
      </div>
    </div>
  );
};

export default TutorialPopup;
