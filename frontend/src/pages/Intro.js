import React, { useState, useEffect, useRef } from 'react';
import ghost from "../assets/images/ghost.png";
import appScreen1 from "../assets/images/task.jpg";
import appScreen2 from "../assets/images/task2.jpg";
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const TypeWriterDialog = () => {
    const [messageStrings, setMessageStrings] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTextFading, setIsTextFading] = useState(false);
    const [isGhostVisible, setIsGhostVisible] = useState(true);
    const [imageToShow, setImageToShow] = useState(null);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const navigate = useNavigate();
    const typingIntervalRef = useRef(null);

    useEffect(() => {
        const messageString = `
            Welcome on board to TUM Spirit!|
            I am <span style="color: #7D4EBC;">Spirit</span>, the avatar of the platform.|
            Everything related to AI in this app is highlighted in purple, just like my name.|
            TUM Spirit is a collaborative platform for digital university teaching.|
            Through this platform, you can collaborate with peers and professors on various projects.|
            Let me show you some features of the platform as we move forward.|
            Here, you can see the collaborative board where you can work with your team.|
            This section allows you to manage tasks and track your team's progress.|
            Ready to get started? Let’s proceed with a quick TKI test to understand your team better!|`;

        setMessageStrings(messageString.split('|'));
    }, []);

    useEffect(() => {
        if (currentMessageIndex >= messageStrings.length) return;

        const message = messageStrings[currentMessageIndex];
        let i = 0;
        setDisplayedText('');

        typingIntervalRef.current = setInterval(() => {
            setDisplayedText(prev => prev + message.charAt(i));
            i++;
            if (i > message.length) {
                clearInterval(typingIntervalRef.current);
            }
        }, 20);

        return () => clearInterval(typingIntervalRef.current);
    }, [currentMessageIndex, messageStrings]);

    useEffect(() => {
        if (currentMessageIndex === 6) {
            setIsGhostVisible(false);
            setImageToShow(appScreen1);
        } else if (currentMessageIndex === 7) {
            setIsGhostVisible(false);
            setImageToShow(appScreen2);
        } else {
            setIsGhostVisible(true);
            setImageToShow(null);
        }
    }, [currentMessageIndex]);

    const nextMessage = () => {
        if (currentMessageIndex < messageStrings.length - 1) {
            setIsTextFading(true);
            setTimeout(() => {
                setCurrentMessageIndex((prev) => prev + 1);
                setIsTextFading(false);
            }, 500);
        } else {
            setIsFadingOut(true);
            setTimeout(() => {
                navigate('/home');
            }, 1000);
        }
    };

    return (
        <div style={{
            backgroundColor: "#ffffff",
            height: "100vh",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            transition: 'opacity 1s',
            opacity: isFadingOut ? 0 : 1
        }} className="background-animation">
            
            {/* Ghost or Image */}
            <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '60px',
                height: '100px'
            }}>
                {isGhostVisible ? (
                    <img
                        src={ghost}
                        alt="Ghost"
                        className="ghost-image"
                        style={{ width: '100px' }}
                    />
                ) : (
                    imageToShow && (
                        <div style={{ animation: 'fadeIn 1s forwards', opacity: isGhostVisible ? 0 : 1 }}>
                            <img src={imageToShow} alt="App Screen" style={{ width: '300px', borderRadius: '10px', transition: 'opacity 1s', opacity: isGhostVisible ? 0 : 1 }} />
                        </div>
                    )
                )}
                {isGhostVisible && (
                    <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        width: '80px',
                        height: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '50%',
                        filter: 'blur(3px)',
                    }} />
                )}
            </div>

            {/* Dialog Box */}
            <div
                id="dialogbox"
                className="dialogbox"
                onClick={nextMessage}
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    width: '90%',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}
            >
                <div
                    className="text-content"
                    style={{
                        opacity: isTextFading ? 0 : 1,
                        transition: 'opacity 0.5s',
                        fontSize: '16px'
                    }}
                    dangerouslySetInnerHTML={{ __html: displayedText }}
                ></div>

                {currentMessageIndex === messageStrings.length - 1 && (
                    <div style={{ display:'flex', justifyContent:'center', marginTop: '40px' }}>
                        <Button
                            type="primary"
                            size="large"
                            style={{ width: '230px', height: '60px' }}
                            onClick={nextMessage}
                        >
                            Start Journey
                        </Button>
                    </div>
                )}
                <div id="arrow" className="arrow"></div>
            </div>
        </div>
    );
};

export default TypeWriterDialog;
