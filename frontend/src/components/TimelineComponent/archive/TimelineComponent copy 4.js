import React, { useState, useEffect, useRef } from 'react';
import { Steps, Card, Progress } from 'antd';

const { Step } = Steps;

const milestones = [
  {
    title: 'Meilenstein 1',
    description: 'Dies ist die Beschreibung für Meilenstein 1',
    date: '01.01.2021',
    details: 'Weitere wichtige Informationen zu Meilenstein 1.',
  },
  {
    title: 'Meilenstein 2',
    description: 'Dies ist die Beschreibung für Meilenstein 2',
    date: '01.02.2021',
    details: 'Weitere wichtige Informationen zu Meilenstein 2.',
  },
  {
    title: 'Meilenstein 3',
    description: 'Dies ist die Beschreibung für Meilenstein 3',
    date: '01.03.2021',
    details: 'Weitere wichtige Informationen zu Meilenstein 3.',
  },
  {
    title: 'Meilenstein 4',
    description: 'Dies ist die Beschreibung für Meilenstein 4',
    date: '01.04.2021',
    details: 'Weitere wichtige Informationen zu Meilenstein 4.',
  },
  {
    title: 'Meilenstein 5',
    description: 'Dies ist die Beschreibung für Meilenstein 5',
    date: '01.05.2021',
    details: 'Weitere wichtige Informationen zu Meilenstein 5.',
  },
  {
    title: 'Meilenstein 6',
    description: 'Dies ist die Beschreibung für Meilenstein 6',
    date: '01.06.2021',
    details: 'Weitere wichtige Informationen zu Meilenstein 6.',
  },
];

const HorizontalTimeline = () => {
 const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          setCurrent((prevCurrent) => {
            const newCurrent = prevCurrent + 1;
            if (newCurrent < milestones.length) {
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

    return () => clearInterval(interval);
  }, []);

  const onChange = (current) => {
    setCurrent(current);
    setProgress(0);
  };

  return (
    <div style={{ padding: '50px' }}>
      <Steps current={current} onChange={onChange} direction="horizontal">
        {milestones.map((milestone, index) => (
          <Step key={index} title={milestone.title} status={index < current ? 'finish' : 'wait'} />
        ))}
      </Steps>
      <div style={{ marginTop: '20px' }}>
        <Progress percent={progress} />
      </div>
      <div style={{ marginTop: '50px' }}>
        <Card title={milestones[current].title}>
          <p><strong>Datum:</strong> {milestones[current].date}</p>
          <p>{milestones[current].description}</p>
          <p>{milestones[current].details}</p>
        </Card>
      </div>
    </div>
  );
};
export default HorizontalTimeline;
