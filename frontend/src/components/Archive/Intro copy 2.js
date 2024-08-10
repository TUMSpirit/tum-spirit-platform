import React, { useState, useEffect } from 'react';
import { Card } from 'antd';

const RunningText = () => {
  const textArray = "ashgfjashgsjgjkvnvakvnascvas"
  const speed = 20;
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < textArray.length) {
        setDisplayText(prevText => prevText + textArray[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [currentIndex, textArray, speed]);

  return (
    <Card style={{ width: 300 }}>
      <p>{displayText}</p>
    </Card>
  );
};

export default RunningText;
