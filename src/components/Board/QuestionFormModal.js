import React, { useEffect, useState } from 'react';
import { generateAnswer } from '../../utils/answerData';
import PropTypes from 'prop-types';
import { Input, Modal, Select, Tabs, TabPaneProps, List, Descriptions, Button } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import { useMediaQuery } from 'react-responsive';

const { TextArea } = Input;

export const QuestionFormModal = ({ visible, cardId, columns, onSubmit, onCancel }) => {
	const [description, setDescription] = useState();
	const [buttonClicked, setButtonClicked] = useState(false)
	const [titles, setTitles] = useState([]);
	const isMobile = useMediaQuery({ query: '(max-device-width: 600px)' })
	useEffect(() => {
		var length = titles.length
		for (let i = 0; i < length; i++) {
			titles.pop()
		}
		columns.map((column, index) => {
			if (column.timeline === cardId) {
				column.issues.map((issue, id) => {
					titles.push({ label: issue.title, value: issue.title })
					setTitles(titles.filter((item, index) => titles.findIndex(i => i.value === item.value) === index));
				}
				)
			}
		})
	});
	const handleOnCancel = () => {
		// setTime([dayjs(data.start_time),dayjs(data.end_time)]);
		// setDescription(data.intro);
		setTitles([]);
		onCancel && onCancel();
	};

	const [answers, setAnswers] = useState(generateAnswer);
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


	const handleClickAnswer = (answer) => {
		setNowAnswer(answer)
	}

	return (
		// Send question to tutor
		<Modal
			visible={visible}
			onOk={() => { onSubmit(); onCancel && onCancel(); setTitles([]); }}
			onCancel={() => handleOnCancel()}
			width={800}
		>
			<Tabs defaultActiveKey={1}>
				<TabPane tab="Send Question" key="1">
					<Select options={titles} style={{ width: 200, marginTop: 4 }} placeholder={'Select a question'}>
					</Select>
					<TextArea
						placeholder="Description"
						// value={description}
						// onChange={e => setDescription(e.target.value)}
						autoSize={{ minRows: 3, maxRows: 6 }}
						style={{ marginTop: 4 }} />
				</TabPane>
				<TabPane tab="Answer" key="2">
					{isMobile ?
						<div >
							<List
								style={{ width: '150px', display: buttonClicked ? 'none' : 'inline-block' }}
								dataSource={answers}
								renderItem={(answer) => (
									answer.cardId === cardId ?
										<List.Item style={{ width: 300, display: 'flex', justifyContent: 'center' }} onClick={() => { handleClickAnswer(answer); setButtonClicked(true) }}>
											<Button type="text" style={{ width: 300, boxShadow: 'none' }}>
												{answer.title}
											</Button>
										</List.Item>
										:
										''
								)}
							/>
							<Button type='text' style={{ display: buttonClicked ? 'inline-block' : 'none', marginBottom: 20 }} onClick={() => { setButtonClicked(false) }}>Back</Button>
							<Descriptions
								bordered
								column={1}
								style={{ width: '800', marginLeft: '20px', display: buttonClicked ? 'inline-block' : 'none' }}
							>
								<Descriptions.Item label="Title" labelStyle={{ width: 50 }}>{nowAnswer.title}</Descriptions.Item>
								<Descriptions.Item label="Description">{nowAnswer.description}</Descriptions.Item>
								<Descriptions.Item label="Answer">{nowAnswer.answer}</Descriptions.Item>
							</Descriptions>
						</div>
						:
						<div style={{ display: 'flex' }}>
							<List
								style={{ width: '200px' }}
								dataSource={answers}
								renderItem={(answer) => (
									answer.cardId === cardId ?
										<List.Item onClick={() => handleClickAnswer(answer)}>
											<Button type="text" style={{ width: 200, boxShadow: 'none' }}>
												{answer.title}
											</Button>
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
					}

				</TabPane>
			</Tabs>
			{/* <Select options={titles} style={{width:200,marginTop: 4 }} placeholder={'Select a question'}>
            </Select>
			<TextArea
				placeholder="Description"
				// value={description}
				// onChange={e => setDescription(e.target.value)}
				autoSize={{ minRows: 3, maxRows: 6 }}
				style={{ marginTop: 4 }} /> */}
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