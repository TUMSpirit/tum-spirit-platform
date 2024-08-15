import React, { useState } from 'react';
import { Button, Modal, Menu, Card, notification, Progress, Tooltip, Timeline, Row, Col, Badge } from 'antd';
import { CheckCircleTwoTone, TrophyTwoTone, ClockCircleOutlined } from '@ant-design/icons';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

const { SubMenu } = Menu;

const tutorials = [
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
        points: 50
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
        points: 40
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
        points: 30
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
        points: 50
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
        points: 30
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
        points: 50
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
        points: 40
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
  const [points, setPoints] = useState(0);

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
          setPoints(points + selectedTutorial.points);
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
              <Card title={selectedTutorial.title} style={{ height: '100%' }}>
                <p>{selectedTutorial.description}</p>
                {isTutorialStarted ? (
                  <>
                    <Timeline mode="top" style={{ width: '100%', marginTop: '20px' }}>
                      {selectedTutorial.steps.map((step, index) => (
                        <Timeline.Item
                          key={index}
                          dot={index <= currentStep ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <ClockCircleOutlined />}
                          color={index <= currentStep ? 'green' : 'gray'}
                        >
                          <Tooltip title={step}>
                            <span>{step}</span>
                          </Tooltip>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ marginTop: '20px' }}
                    >
                      <p>{selectedTutorial.steps[currentStep]}</p>
                      <Button type="primary" onClick={onNextStep}>
                        {currentStep === selectedTutorial.steps.length - 1 ? 'Finish' : 'Next Step'}
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <Button type="primary" onClick={onStartTutorial}>
                    Start Tutorial
                  </Button>
                )}
              </Card>
            ) : (
              <Card title="Select a tutorial" style={{ height: '100%' }}>
                <p>Please select a tutorial from the list to see details.</p>
              </Card>
            )}
          </Col>
        </Row>
        <div style={{ marginTop: '20px' }}>
          <Tooltip title={`${completed.length} of ${tutorials.flatMap(cat => cat.items).length} completed`}>
            <Progress
              percent={progress}
              status="active"
              format={() => (
                <>
                  <TrophyTwoTone twoToneColor="#fadb14" /> {completed.length}/{tutorials.flatMap(cat => cat.items).length}
                </>
              )}
            />
          </Tooltip>
        </div>
        <div style={{ marginTop: '20px' }}>
          <Badge count={points} showZero>
            <Button type="link">Points</Button>
          </Badge>
        </div>
      </Modal>
    </div>
  );
};

export default TutorialPopup;
