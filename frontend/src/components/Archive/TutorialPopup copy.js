import React, { useState } from 'react';
import { Button, Modal, List, Card, notification, Progress, Tooltip, Menu } from 'antd';
import { CheckCircleTwoTone, TrophyTwoTone } from '@ant-design/icons';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';


const { SubMenu } = Menu;

const tutorials = [
  {
    category: 'React',
    items: [
      { id: 1, title: 'React Basics', description: 'Learn the fundamentals of React.', content: 'Content for React Basics...' },
      { id: 2, title: 'State and Props', description: 'Understand state and props in React.', content: 'Content for State and Props...' },
      { id: 3, title: 'Lifecycle Methods', description: 'Learn about React lifecycle methods.', content: 'Content for Lifecycle Methods...' },
      { id: 4, title: 'Hooks', description: 'Introduction to React hooks.', content: 'Content for Hooks...' },
    ],
  },
  {
    category: 'React Router',
    items: [
      { id: 5, title: 'Routing', description: 'Learn how to use React Router.', content: 'Content for Routing...' },
    ],
  },
  {
    category: 'State Management',
    items: [
      { id: 6, title: 'Redux Basics', description: 'Introduction to Redux.', content: 'Content for Redux Basics...' },
      { id: 7, title: 'MobX Basics', description: 'Introduction to MobX.', content: 'Content for MobX Basics...' },
    ],
  },
];

const TutorialPopup = ({popupVisible, setPopupVisible}) => {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const showModal = () => {
    setPopupVisible(true);
  };

  const handleOk = () => {
    setPopupVisible(false);
    notification.success({
      message: 'Tutorials Updated',
      description: 'Your progress has been saved.',
    });
  };

  const handleCancel = () => {
    setPopupVisible(false);
  };

  const onSelectTutorial = (tutorial) => {
    setSelectedTutorial(tutorial);
    setShowContent(false);
  };

  const onStartTutorial = () => {
    setShowContent(true);
    setCompleted((prevCompleted) => {
      if (!prevCompleted.includes(selectedTutorial.id)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        return [...prevCompleted, selectedTutorial.id];
      }
      return prevCompleted;
    });
  };

  const progress = (completed.length / tutorials.flatMap(cat => cat.items).length) * 100;

  return (
    <div>
      {showConfetti && <Confetti />}
      <Modal
        title="Complete the Tutorials"
        open={popupVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save Progress"
        cancelText="Cancel"
        width={800}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, marginRight: '20px' }}>
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
          </div>
          <div style={{ flex: 2 }}>
            {selectedTutorial ? (
              <Card title={selectedTutorial.title}>
                <p>{selectedTutorial.description}</p>
                <Button type="primary" onClick={onStartTutorial}>
                  Start Tutorial
                </Button>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginTop: '20px' }}
                  >
                    <p>{selectedTutorial.content}</p>
                  </motion.div>
                )}
              </Card>
            ) : (
              <Card title="Select a tutorial" style={{ height: '100%' }}>
                <p>Please select a tutorial from the list to see details.</p>
              </Card>
            )}
          </div>
        </div>
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
      </Modal>
    </div>
  );
};

export default TutorialPopup;
