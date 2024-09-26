import React, { useState, useEffect, useRef } from 'react';
import ghost from "../assets/images/ghost.png";
import homeScreen from "../assets/images/home_screen.png";
import calendarScreen from "../assets/images/calendar_screen.png";
import chatScreen from "../assets/images/chat_screen.png";
import kanbanScreen from "../assets/images/kanban_screen.png";
import documentsScreen from "../assets/images/documents_screen.png";
import teamScreen from "../assets/images/team_screen.png";
import ImprintModal from '../components/Imprint/ImprintModal';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSocket } from "../context/SocketProvider";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'; // Import from react-zoom-pan-pinch

const TypeWriterDialog = () => {
    const [messageStrings, setMessageStrings] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [imprintVisible, setImprintVisible] = useState(false);
    const [isTextFading, setIsTextFading] = useState(false);
    const [isGhostVisible, setIsGhostVisible] = useState(true);
    const [imageToShow, setImageToShow] = useState(null);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const navigate = useNavigate();
    const typingIntervalRef = useRef(null);
    const zoomApiRef = useRef(null);
    const [ghostOverlayVisible, setGhostOverlayVisible] = useState(false); // Ghost overlay visibility
    const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Track screen width
    const [fadeClass, setFadeClass] = useState('fade-in');
    const { updateSettings } = useSocket();
    // To store zoom API instance

    // Responsive zoom and pan settings
    const getZoomPanValues = (screenWidth, caseIndex) => {
        if (screenWidth <= 1000) {
            // iPhone or smaller screens
            switch (caseIndex) {
                case 5: return { x: -470, y: -30, scale: 2.5 }; // Home screen
                case 6: return { x: -90, y: -150, scale: 2.0 };  // Calendar
                case 9: return { x: -130, y: -50, scale: 3.0 };  // Kanban
                case 11: return { x: -120, y: -80, scale: 3.0 };
                case 12: return { x: -120, y: -380, scale: 3 };  // Kanban closer
                case 14: return { x: -100, y: -50, scale: 2.5 }; // Documents
                default: return { x: 0, y: 0, scale: 1.0 }; // Default
            }
        } else {
            // Laptop or larger screens
            switch (caseIndex) {
                case 5: return { x: -900, y: -50, scale: 2.5 };
                case 6: return { x: 0, y: -100, scale: 1.5 };    // Home screen
                case 9: return { x: -200, y: -50, scale: 3.2 };  // Kanban
                case 11: return { x: -450, y: -220, scale: 4.0 };// Kanban closer
                case 12: return { x: -150, y: -550, scale: 2.5 } // Kanban closer
                case 14: return { x: -250, y: -100, scale: 2.5 };// Documents
                default: return { x: 0, y: 0, scale: 1.0 };      // Default
            }
        }
    };

    useEffect(() => {
        const messageString = `
        Boo!   
        <strong>Welcome to <span style="color: #2576CA;">TUM Spirit</span></strong>,<br>  
        a first interactive collaboration platform for students to exchange on projects.<br>  
        Let me introduce myself... You might've seen me on your smartphone keyboard! My name is <span style="color: #7D4EBC;">Spirit</span>, the AI Avatar of this platform. I'm here to help you with any challenges you face while working on projects.|  
        
        I'm powered by my older brother, ChatGPT, so I'll do my best to guide you through tricky situations. But wait, there's more! Since this platform is all about collaboration, I’m also here to push messages and content to keep you engaged.|  
        
        There’s just one rule of thumb to help you understand what’s going on — check out this legend:<br><br>  
        <ul style="margin-left: 20px;">
          <li><span style="color: #7D4EBC;">Purple</span>: Everything related to AI and guidance.</li>
          <li><span style="color: #2576CA;">Blue</span>: Features and collaboration tools.</li>
        </ul>  
        So, if you see <span style="color: #7D4EBC;">Purple</span>, that means it’s me you’re interacting with!|  
        
        Enough about me — let’s explore the platform. Here are some of the key features of TUM Spirit:<br>  
        
        <ul style="margin-left: 20px;">
          <li><span style="color: #2576CA;">Collaborative Board</span>: Work with your team, assign tasks, and track progress.</li>
          <li><span style="color: #2576CA;">Task Management</span>: Easily manage personal and team tasks.</li>
          <li><span style="color: #7D4EBC;">AI Assistance</span>: I’ll be here to guide and support you throughout.</li>
        </ul>  
        Let’s take a quick tour!|  
        
        Welcome to your Home Screen, your hub for managing projects and tracking progress. Here you can see your Milestones, Activity Feed, and personalized greetings. Let’s see what’s happening today!|  
        
        Next, your Activity Feed keeps you updated on the latest project movements. For example, someone just added a new Kanban card! This is where you stay informed without the fuss.|  

        Now, let’s take a look at the Milestone Timeline! This is where you’ll keep track of your project’s progress and stay on top of important deadlines. The timeline helps you monitor each key milestone, ensuring that you and your team are always aligned on project status.  

It also serves as a baseline for all teams working together during the lecture, providing a clear overview of what’s been accomplished and what still needs to be done. Staying on track with your milestones is crucial for smooth collaboration and successful project delivery!|

        
        Time to plan! Here’s your Calendar, where you can manage project deadlines and events—from important meetings to milestone reviews. Simply click on a day to add new events or check what’s coming up!|  
        
        Let’s move to the Chat! This is where your team communicates and collaborates. If you ever need help or advice, just look for my purple messages. Keep those conversations flowing!|  
        
        Collaboration made easy! Send quick updates, start group discussions, or message someone privately. No more overflowing inboxes—just efficient teamwork!|  
        
        Next stop, the Kanban Board! Here’s where tasks move from <em>Backlog</em> to <em>Done</em> in no time. You can assign tasks, set priorities, and track progress. It’s like a game—move your cards and watch your project evolve!|  
        
        Need to add a task? Click the "+" button, add the details, set a deadline, and assign it to team members. Your team’s productivity just got a boost!|  
        
        I can also create Kanban cards in my signature color! Try to be as precise as possible when creating cards and timebox tasks to maintain a clear overview of the workload. Don’t worry.. you’ll get the hang of it in no time!|  
        
        Finally, let’s check out the Documents section, where all your project files live. Upload presentations, reports, and images — everything in one place for the whole team to access at any time.|  
        
        You can also control access to files, sharing them with the entire team or keeping some private. It's all about keeping your resources organized and accessible.|  
        
        And Last but not least, the Team Overview. Here you can see your Team mates and also me :P I am part of your team and try to support you the best I can.|  
        
        Ready to get started? I'll present the consent form for you to review, and then we’re good to go!|  
        
        Let’s dive in and start your journey with TUM Spirit!|`;

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


    const handleFadeTransition = (newImage) => {
        setTimeout(() => {
            setFadeClass('fade-out'); // Start fade-out
            setTimeout(() => {
                setImageToShow(newImage); // Switch the image after fade-out
                setFadeClass('fade-in'); // Start fade-in
            }, 500);
        }, 500); // Time for fade-out to complete
    };

    useEffect(() => {
        // Adjust which image to show and zoom/pan based on message index
        const { x, y, scale } = getZoomPanValues(screenWidth, currentMessageIndex);
        switch (currentMessageIndex) {
            case 4:
                setIsGhostVisible(false);
                handleFadeTransition(homeScreen); // Home screen
                // setImageToShow(homeScreen);
                //setGhostOverlayVisible(true);
                //zoomApiRef.current?.setTransform(0, -100, 1.5); // Zoom and pan to home screen
                break;
            case 5:
                //setImageToShow(calendarScreen);
                zoomApiRef.current?.setTransform(x, y, scale); // Zoom and pan to calendar
                break;
            case 6:
                //setImageToShow(calendarScreen);
                zoomApiRef.current?.setTransform(x, y, scale); // Zoom and pan to calendar
                break;
            case 7:
                zoomApiRef.current?.resetTransform(); // Reset zoom and pan for default case
                handleFadeTransition(calendarScreen); // Home screen
                //setImageToShow(calendarScreen);
                break;
            case 8:
                //setImageToShow(kanbanScreen);
                handleFadeTransition(chatScreen); // Home screen
                break;
            case 9:
                zoomApiRef.current?.setTransform(x, y, scale); // Zoom and pan to calendar
                break;
            case 10:
                zoomApiRef.current?.resetTransform(); // Reset zoom and pan for default case

                handleFadeTransition(kanbanScreen); // Home screen
                break;
            case 11:
                zoomApiRef.current?.setTransform(x, y, scale); // Zoom and pan to calendar
                break;
            case 12:
                zoomApiRef.current?.setTransform(x, y, scale); // Zoom and pan to calendar
                break;
            case 13:
                zoomApiRef.current?.resetTransform(); // Reset zoom and pan for default case
                handleFadeTransition(documentsScreen); // Home screen
                break;
            case 14:
                zoomApiRef.current?.setTransform(x, y, scale); // Zoom and pan to calendar
                break;
            case 15:
                zoomApiRef.current?.resetTransform(); // Reset zoom and pan for default case
                handleFadeTransition(teamScreen); // Home screen
                break;
            default:
                setIsGhostVisible(true);
                setImageToShow(null);
                setGhostOverlayVisible(false);
                zoomApiRef.current?.resetTransform(); // Reset zoom and pan for default case
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
                navigate('/');
                setImprintVisible(true); // Open Impressum modal
                updateSettings('is_first_login', false);
            }, 500);
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
                marginBottom: imageToShow ? '20%' : '0',
                height: '130px',
                animation: 'float 3s ease-in-out infinite',
                margin: '10px'
            }}>
                {isGhostVisible ? (
                    <img
                        src={ghost}
                        alt="Ghost"
                        className="ghost-image"
                        style={{
                            width: '130px', opacity: 0.8
                        }}
                    />
                ) : (
                    imageToShow && (
                        <TransformWrapper
                            defaultScale={1}
                            ref={zoomApiRef}
                            onZoomStop={() => console.log("Zoom stopped")}
                            onPanningStop={() => console.log("Panning stopped")}
                        >
                            {({ resetTransform }) => (
                                <TransformComponent>
                                    <img
                                        src={imageToShow}
                                        className={fadeClass}
                                        alt="App Screen"
                                        style={{
                                            width: '700px', backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                </TransformComponent>
                            )}
                        </TransformWrapper>

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
                        filter: 'blur(3px)'
                    }} />
                )}
                {ghostOverlayVisible && (
                    <img
                        src={ghost}
                        alt="Small Ghost Overlay"
                        style={{
                            width: ghostOverlayVisible ? '60px' : '20px', // Increase the size when it appears
                            position: 'absolute',
                            top: '20px',
                            left: '40px',
                            opacity: ghostOverlayVisible ? 1 : 0, // Fade in the ghost
                            transition: 'opacity 0.5s, width 0.5s', // Smooth transition for opacity and size
                            animation: ghostOverlayVisible ? 'bounce 1s' : 'none', // Bounce effect for salience
                        }}
                    />)}
            </div>

            {/* Dialog Box */}
            <div
                id="dialogbox"
                className="dialogbox"
                onClick={nextMessage}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    width: '90%',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontFamily: 'Josefin Sans, sans-serif',
                    maxHeight: '300px',
                    overflowY: 'auto',
                }}
            >
                <div
                    className="text-content"
                    style={{
                        opacity: isTextFading ? 0 : 1,
                        transition: 'opacity 0.5s',
                        fontSize: '18px',
                        color: '#333',
                        fontWeight: '500',
                        lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: displayedText }}
                ></div>
                {currentMessageIndex === messageStrings.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
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
            <ImprintModal isVisible={imprintVisible} setIsVisible={setImprintVisible}></ImprintModal>
        </div>
    );
};

export default TypeWriterDialog;
