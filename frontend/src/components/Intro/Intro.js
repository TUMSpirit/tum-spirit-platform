// src/TextWindow.js
import React, { useState } from 'react';
import { Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const TextWindow = ({ texts, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-pokemon-blue p-4 rounded-lg relative max-w-lg mx-auto w-full">
      <div className="text-pokemon-text text-xl text-center mb-4">
        {texts[currentIndex]}
      </div>
      <Button
        type="primary"
        shape="circle"
        icon={<RightOutlined />}
        onClick={handleNext}
        className="absolute bottom-4 right-4"
      />
    </div>
  );
};

export default TextWindow;
