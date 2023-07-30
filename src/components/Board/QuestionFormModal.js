import React, { useEffect, useState } from 'react';
import { generateAnswer } from '../../utils/answerData';
import PropTypes from 'prop-types';
import {Input, Modal, Select} from 'antd';

const { TextArea } = Input;

export const QuestionFormModal = ({ visible, cardId,columns, onSubmit, onCancel}) => {
	const [description, setDescription] = useState();
    const [titles,setTitles] = useState([]);
    useEffect(()=>{
		var length = titles.length
		for(let i = 0;i < length;i++){
			titles.pop()
		}
        columns.map((column,index) => {
            if(column.timeline===cardId){
                column.issues.map((issue,id) => {
					titles.push({label:issue.title,value:issue.title})
					setTitles(titles.filter((item, index) => titles.findIndex(i => i.value === item.value) === index));
                }
        )}
        })
    },[cardId]);
	const handleOnCancel = () => {
		// setTime([dayjs(data.start_time),dayjs(data.end_time)]);
		// setDescription(data.intro);
		setTitles([]);
		onCancel && onCancel();
	};

	return (
		// Send question to tutor
		<Modal
			title="Send Qustion"
			visible={visible}
			onOk={() => {onSubmit();onCancel && onCancel();setTitles([]);}}
			onCancel={() => handleOnCancel()}
		>
            <Select options={titles} style={{width:200,marginTop: 4 }} placeholder={'Select a question'}>
            </Select>
			<TextArea
				placeholder="Description"
				// value={description}
				// onChange={e => setDescription(e.target.value)}
				autoSize={{ minRows: 3, maxRows: 6 }}
				style={{ marginTop: 4 }} />
		</Modal>
	);
};

QuestionFormModal.propTypes = {
	visible: PropTypes.bool,
	issue: PropTypes.object,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func
};

export default QuestionFormModal;