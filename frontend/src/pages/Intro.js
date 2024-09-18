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
    const [imageLoaded, setImageLoaded] = useState(false); // Track image load state
    const [ghostOverlayVisible, setGhostOverlayVisible] = useState(false); // Ghost overlay visibility
    const [isFadingOut, setIsFadingOut] = useState(false);
    const navigate = useNavigate();
    const typingIntervalRef = useRef(null);

    useEffect(() => {
        const messageString = `
            <strong>Welcome to <span style="color: #2576CA;">TUM Spirit</span>!</strong><br><br>
            <em>Legend:</em><br>
            <ul style="margin-left: 20px;">
                <li><span style="color: #7D4EBC;">Purple</span>: Everything related to AI and guidance.</li>
                <li><span style="color: #2576CA;">Blue</span>: Features and collaboration tools.</li>
            </ul>|

            I’m <span style="color: #7D4EBC;">Spirit</span>, your AI assistant on this platform.<br>
            <em>Here’s how we will work together:</em><br>
            <ul style="margin-left: 20px;">
                <li>Anything related to <span style="color: #7D4EBC;">AI</span> will be highlighted in purple, just like my name.</li>
                <li>Everything related to collaboration and tasks will be shown in <span style="color: #2576CA;">blue</span>.</li>
            </ul>|

            <em>Key Features of TUM Spirit:</em><br>
            <ul style="margin-left: 20px;">
                <li><span style="color: #2576CA;">Collaborative Board</span>: Work with your team, assign tasks, and track progress.</li>
                <li><span style="color: #2576CA;">Task Management</span>: Easily manage your personal and team tasks.</li>
                <li><span style="color: #7D4EBC;">AI Assistance</span>: I’ll be here to guide and support you through everything.</li>
            </ul>|

            Ready to explore? Let me show you around!| 

            <strong>Here is your collaborative board</strong>, where you can assign tasks and work with your team.| 

            Ready to get started? Let’s take a quick <span style="color: #7D4EBC;">TKI test</span> to better understand your team!|`;

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
        }, 10);

        return () => clearInterval(typingIntervalRef.current);
    }, [currentMessageIndex, messageStrings]);

    useEffect(() => {
        setImageLoaded(false); // Reset image loaded state
        setGhostOverlayVisible(false); // Reset ghost overlay visibility

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

    useEffect(() => {
        if (imageLoaded) {
            // Delay the ghost overlay appearance by 500ms
            const timeoutId = setTimeout(() => {
                setGhostOverlayVisible(true);
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [imageLoaded]);

    const handleImageLoad = () => {
        setImageLoaded(true); // Set the image load state to true once the image is fully loaded
    };

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
                navigate('/');
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
            opacity: isFadingOut ? 0 : 1,
        }} className="background-animation">
            
            {/* Ghost or Image */}
            <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '60px',
                height: '130px',
                animation: 'float 3s ease-in-out infinite' // Add subtle floating animation
            }}>
                {isGhostVisible ? (
                    <img
                        src={ghost}
                        alt="Ghost"
                        className="ghost-image"
                        style={{ width: '130px', opacity: 0.8 }}
                    />
                ) : (
                    imageToShow && (
                        <div 
                            style={{ 
                                position: 'relative', 
                                animation: imageLoaded ? 'fadeIn 1s forwards' : 'none', 
                                opacity: imageLoaded ? 1 : 0, 
                                transition: 'opacity 1s' 
                            }}
                        >
                            <img 
                                src={imageToShow} 
                                alt="App Screen" 
                                style={{ width: '300px', borderRadius: '10px' }} 
                                onLoad={handleImageLoad} // Image load event
                            />
                            {/* Small Ghost Overlay */}
                            <img
                                src={ghost}
                                alt="Small Ghost Overlay"
                                style={{
                                    width: ghostOverlayVisible ? '60px' : '40px', // Increase the size when it appears
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    opacity: ghostOverlayVisible ? 1 : 0, // Fade in the ghost
                                    transition: 'opacity 0.5s, width 0.5s', // Smooth transition for opacity and size
                                    animation: ghostOverlayVisible ? 'bounce 1s' : 'none', // Bounce effect for salience
                                }}
                            />
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
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Adding transparency to the box
                    padding: '20px',
                    borderRadius: '10px',
                    width: '90%',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Enhance box shadow for depth
                    backdropFilter: 'blur(10px)', // Glassmorphism effect
                    border: '1px solid rgba(255, 255, 255, 0.3)', // Light border for a holographic look
                    fontFamily: 'Josefin Sans, sans-serif', // Custom font style
                    maxHeight: '300px', // Limit height of the box
                    overflowY: 'auto', // Make text scrollable when content exceeds height
                }}
            >
                <div
                    className="text-content"
                    style={{
                        opacity: isTextFading ? 0 : 1,
                        transition: 'opacity 0.5s',
                        fontSize: '18px',
                        color: '#333',
                        fontWeight: '500', // Make the text bolder
                        lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: displayedText }}
                ></div>
            <div id="arrow" className="arrow"></div>
                {currentMessageIndex === messageStrings.length - 1 && (
                    <div style={{ display:'flex', justifyContent:'center', marginTop: '40px' }}>
                        <Button
                            type="primary"
                            size="large"
                            style={{ width: '230px', height: '60px', borderRadius: '8px' }}
                            onClick={nextMessage}
                        >
                            Start Journey
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypeWriterDialog;
