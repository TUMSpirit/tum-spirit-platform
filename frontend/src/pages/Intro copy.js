import React, { useState, useEffect, useRef } from 'react';

const timer = 5; // The delay for the typewriter effect

const TypeWriterDialog = () => {
    const [messageStrings, setMessageStrings] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageId, setMessageId] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(true);
    const [isMessageSkipped, setIsMessageSkipped] = useState(false);
    const dialogboxRef = useRef(null);
    const timeoutsRef = useRef([]);

    useEffect(() => {
        const messageString = `The Tortoise and the Hare|Once upon a time, in a vast and bustling forest, lived a speedy hare who boasted about how fast he could run.|Tired of hearing the hare's bragging, a slow but wise tortoise challenged him to a race.|The hare, bursting with laughter, accepted the challenge, thinking it was an easy win.|As the race began, the hare zoomed ahead, leaving the tortoise far behind.|Confident of his lead, the hare decided to rest under a tree, and soon, fell fast asleep.|Meanwhile, the tortoise continued on, steady and slow, never stopping, until he passed the sleeping hare.|Ultimately, the tortoise crossed the finish line first.|Remember: Consistent efforts can lead to success - however slow they may be.|Having a great potential is of little value if it is not cultivated.|***`;
        setMessageStrings(messageString.split('|'));
        setCurrentMessage(messageString.split('|')[0]);
    }, []);

    useEffect(() => {
        if (messageId < messageStrings.length) {
            loadMessage(messageStrings[messageId].split(''));
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
                <svg class="ghost" version="1.1" id="Layer_1" x="0px" y="0px"
                    width="127.433px" height="146.743px" viewBox="0 0 127.433 146.743" enable-background="new 0 0 127.433 132.743">
                    <path fill="#FFF6F4" d="M116.223,125.064c1.032-1.183,1.323-2.73,1.391-3.747V54.76c0,0-4.625-34.875-36.125-44.375
                    s-66,6.625-72.125,44l-0.781,63.219c0.062,4.197,1.105,6.177,1.808,7.006c1.94,1.811,5.408,3.465,10.099-0.6
                    c7.5-6.5,8.375-10,12.75-6.875s5.875,9.75,13.625,9.25s12.75-9,13.75-9.625s4.375-1.875,7,1.25s5.375,8.25,12.875,7.875
                    s12.625-8.375,12.625-8.375s2.25-3.875,7.25,0.375s7.625,9.75,14.375,8.125C114.739,126.01,115.412,125.902,116.223,125.064z"/>
                    <circle fill="#013E51" cx="80.238" cy="57.885" r="6.667" />
                    <circle fill="#013E51" cx="42.072" cy="57.885" r="6.667" />
                    <circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="18.614" cy="99.426" r="3.292" />
                    <circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="95.364" cy="28.676" r="3.291" />
                    <circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="24.739" cy="93.551" r="2.667" />
                    <circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="101.489" cy="33.051" r="2.666" />
                    <circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="18.738" cy="87.717" r="2.833" />
                    <path fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" d="M116.279,55.814c-0.021-0.286-2.323-28.744-30.221-41.012
                    c-7.806-3.433-15.777-5.173-23.691-5.173c-16.889,0-30.283,7.783-37.187,15.067c-9.229,9.736-13.84,26.712-14.191,30.259
                    l-0.748,62.332c0.149,2.133,1.389,6.167,5.019,6.167c1.891,0,4.074-1.083,6.672-3.311c4.96-4.251,7.424-6.295,9.226-6.295
                    c1.339,0,2.712,1.213,5.102,3.762c4.121,4.396,7.461,6.355,10.833,6.355c2.713,0,5.311-1.296,7.942-3.962
                    c3.104-3.145,5.701-5.239,8.285-5.239c2.116,0,4.441,1.421,7.317,4.473c2.638,2.8,5.674,4.219,9.022,4.219
                    c4.835,0,8.991-2.959,11.27-5.728l0.086-0.104c1.809-2.2,3.237-3.938,5.312-3.938c2.208,0,5.271,1.942,9.359,5.936
                    c0.54,0.743,3.552,4.674,6.86,4.674c1.37,0,2.559-0.65,3.531-1.932l0.203-0.268L116.279,55.814z M114.281,121.405
                    c-0.526,0.599-1.096,0.891-1.734,0.891c-2.053,0-4.51-2.82-5.283-3.907l-0.116-0.136c-4.638-4.541-7.975-6.566-10.82-6.566
                    c-3.021,0-4.884,2.267-6.857,4.667l-0.086,0.104c-1.896,2.307-5.582,4.999-9.725,4.999c-2.775,0-5.322-1.208-7.567-3.59
                    c-3.325-3.528-6.03-5.102-8.772-5.102c-3.278,0-6.251,2.332-9.708,5.835c-2.236,2.265-4.368,3.366-6.518,3.366
                    c-2.772,0-5.664-1.765-9.374-5.723c-2.488-2.654-4.29-4.395-6.561-4.395c-2.515,0-5.045,2.077-10.527,6.777
                    c-2.727,2.337-4.426,2.828-5.37,2.828c-2.662,0-3.017-4.225-3.021-4.225l0.745-62.163c0.332-3.321,4.767-19.625,13.647-28.995
                    c3.893-4.106,10.387-8.632,18.602-11.504c-0.458,0.503-0.744,1.165-0.744,1.898c0,1.565,1.269,2.833,2.833,2.833
                    c1.564,0,2.833-1.269,2.833-2.833c0-1.355-0.954-2.485-2.226-2.764c4.419-1.285,9.269-2.074,14.437-2.074
                    c7.636,0,15.336,1.684,22.887,5.004c26.766,11.771,29.011,39.047,29.027,39.251V121.405z"/>
                </svg>
                <p class="shadowFrame"><svg version="1.1" class="shadow-ghost" id="Layer_1" x="61px" y="20px"
                    width="122.436px" height="39.744px" viewBox="0 0 122.436 39.744" enable-background="new 0 0 122.436 39.744">
                    <ellipse fill="#00000" cx="61.128" cy="19.872" rx="49.25" ry="8.916" />
                </svg></p>
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