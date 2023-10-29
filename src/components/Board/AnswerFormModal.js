import React, { useEffect, useState } from 'react';
import { generateAnswer } from '../../utils/answerData';
import PropTypes from 'prop-types';
import { Input, Modal, Select, Divider, List, Descriptions, Badge } from 'antd';


export const AnswerFormModal = ({ visible, cardId, columns, onSubmit, onCancel }) => {
    const [answers, setAnswers] = useState(generateAnswer);
    const [titles, setTitles] = useState([]);
    const [nowAnswer, setNowAnswer] = useState({});
    const data = [
        'Issue 1',
        'Issue 2',
        'Issue 3',
        'Issue 4',
        'Issue 5',
    ];
    useEffect(() => {
        setNowAnswer({})
    }, [cardId]);

    const handleOnCancel = () => {
        // setTime([dayjs(data.start_time),dayjs(data.end_time)]);
        // setDescription(data.intro);
        setTitles([]);
        onCancel && onCancel();
    };

    const handleClickAnswer = (answer) => {
        setNowAnswer(answer)
    }
    return (
        <Modal
            title="Answer"
            visible={visible}
            width={800}
            onOk={() => { onSubmit(); onCancel && onCancel(); setTitles([]); }}
            onCancel={() => handleOnCancel()}
        >
            <div style={{ display: 'flex' }}>
                <List
                    style={{ width: '100px' }}
                    dataSource={answers}
                    renderItem={(answer) => (
                        answer.cardId === cardId ?
                            <List.Item onClick={() => handleClickAnswer(answer)}>
                                {answer.title}
                            </List.Item>
                            :
                            ''
                    )}
                />
                <Descriptions
                    bordered
                    column={1}
                    style={{ width: '500', marginLeft: '20px' }}
                >
                    <Descriptions.Item label="Title" labelStyle={{ width: 50 }}>{nowAnswer.title}</Descriptions.Item>
                    <Descriptions.Item label="Description">{nowAnswer.description}</Descriptions.Item>
                    <Descriptions.Item label="Answer">{nowAnswer.answer}</Descriptions.Item>
                </Descriptions>
            </div>
        </Modal>
    );
};

AnswerFormModal.propTypes = {
    visible: PropTypes.bool,
    issue: PropTypes.object,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
};

export default AnswerFormModal;