import React, { useState, useEffect, useRef } from 'react';
import ghost from "../assets/images/ghost.png";

const timer = 5; // The delay for the typewriter effect

const TypeWriterDialog = () => {
    const [messageStrings, setMessageStrings] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageId, setMessageId] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(true);
    const [isMessageSkipped, setIsMessageSkipped] = useState(false);
    const [ghostClass, setGhostClass] = useState('ghost-appear'); // Controls ghost animation

    const dialogboxRef = useRef(null);
    const timeoutsRef = useRef([]);

    useEffect(() => {
        const messageString = `The Tortoise and the Hare|Once upon a time, in a vast and bustling forest, lived a speedy hare who boasted about how fast he could run.|Tired of hearing the hare's bragging, a slow but wise tortoise challenged him to a race.|The hare, bursting with laughter, accepted the challenge, thinking it was an easy win.|As the race began, the hare zoomed ahead, leaving the tortoise far behind.|Confident of his lead, the hare decided to rest under a tree, and soon, fell fast asleep.|Meanwhile, the tortoise continued on, steady and slow, never stopping, until he passed the sleeping hare.|Ultimately, the tortoise crossed the finish line first.|Remember: Consistent efforts can lead to success - however slow they may be.|Having a great potential is of little value if it is not cultivated.|***`;
        setMessageStrings(messageString.split('|'));
        setCurrentMessage(messageString.split('|')[0]);
    }, []);

    useEffect(() => {
        if (messageId < messageStrings.length) {
            // Apply the ghost disappear animation before loading the new message
            if (!loadingComplete) {
                setGhostClass('ghost-disappear');
                setTimeout(() => {
                    setGhostClass('ghost-appear');
                    loadMessage(messageStrings[messageId].split(''));
                }, 1000); // Matches the duration of the disappear animation
            } else {
                loadMessage(messageStrings[messageId].split(''));
            }
        }
    }, [messageId]);

    const loadMessage = (dialog) => {
        setLoadingComplete(false);
        dialogboxRef.current.innerHTML = '';

        dialog.forEach((char, index) => {
            const timeout = setTimeout(() => {
                dialogboxRef.current.innerHTML += char;
                if (index === dialog.length - 1) {
                    setLoadingComplete(true);
                }
            }, timer * index);
            timeoutsRef.current.push(timeout);
        });
    };

    const nextMessage = () => {
        if (!loadingComplete || isMessageSkipped) {
            setIsMessageSkipped(false);
            return;
        }

        if (messageId >= messageStrings.length) {
            setMessageId(0);
        } else {
            setCurrentMessage(messageStrings[messageId]);
            setMessageId(prev => prev + 1);
        }
    };

    const handleClick = () => {
        if (!loadingComplete) {
            clearTimeouts();
            setLoadingComplete(true);
            dialogboxRef.current.innerHTML = currentMessage;
        } else if (!isMessageSkipped) {
            nextMessage();
        } else {
            setIsMessageSkipped(false);
        }
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !loadingComplete && !isMessageSkipped) {
            clearTimeouts();
            dialogboxRef.current.innerHTML = currentMessage;
            setLoadingComplete(true);
            setIsMessageSkipped(true);
        }
    };

    const handleKeyUp = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && loadingComplete) {
            if (!isMessageSkipped) {
                nextMessage();
            }
            setIsMessageSkipped(false);
        }
    };

    const clearTimeouts = () => {
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
    };

    return (
        <div style={{ backgroundColor: "#1677ff", height: "100vh" }}>
            <div className='ghost-container'>
                <img
                    src={ghost}
                    alt="Ghost"
                    className={`ghost-image ${ghostClass} h-24`}
                    style={{ maxWidth: '100%', padding: "0 10%" }}
                />
            </div>
            <div
                id="dialogbox"
                className="dialogbox"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                tabIndex={0} // Make div focusable for key events
                ref={dialogboxRef}
            >
                <div className="text-content">
                    {currentMessage}
                </div>
                <div id="arrow" className="arrow" style={{ display: 'block' }}></div>
            </div>
        </div>
    );
};

export default TypeWriterDialog;
