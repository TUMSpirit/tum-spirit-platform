import React, { useState, useEffect } from 'react';

const PollMessage = ({ poll, socket }) => {
    const [votes, setVotes] = useState(poll.votes || Array(poll.options.length).fill(0));
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        socket.on('pollUpdated', updatedPolls => {
            const updatedPoll = updatedPolls.find(p => p.id === poll.id);
            if (updatedPoll) {
                setVotes(updatedPoll.votes);
            }
        });

        return () => {
            socket.off('pollUpdated');
        };
    }, [poll.id, socket]);

    const handleVote = (index) => {
        if (hasVoted) return;
        socket.emit('votePoll', poll.id, index);
        setHasVoted(true);
    };

    return (
        <div className="poll-message bg-gray-100 p-4 rounded-md shadow-md">
            <h3 className="font-bold mb-2">{poll.title}</h3>
            <ul>
                {poll.options.map((option, index) => (
                    <li key={index} className="mb-2">
                        <button
                            className={`w-full text-left p-2 rounded ${hasVoted ? 'bg-gray-300' : 'bg-white'}`}
                            onClick={() => handleVote(index)}
                            disabled={hasVoted}
                        >
                            {option} ({votes[index]} votes)
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PollMessage;