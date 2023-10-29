import React, { useState, useRef } from 'react';
import moment from 'moment/moment';
import { useMediaQuery } from 'react-responsive';
import { Button, Tooltip, message, Upload, Steps, Tour, Popconfirm } from 'antd';
import { PlusOutlined, ClockCircleOutlined, UploadOutlined, QuestionCircleOutlined, MessageOutlined, FlagOutlined, LoadingOutlined, SmileOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { Timeline, TimelineFormModal } from '../Timeline';
import { Column, ColumnFormModal } from '../Column';
import { Columns, Container, } from './Board.styled';
import { PlusCircleFilled, ScheduleOutlined, TeamOutlined, EditOutlined, DashboardOutlined, CheckCircleOutlined, RobotOutlined } from '@ant-design/icons';
import Storage from '../../services/StorageService';
import { generateBoard } from '../../utils/helper';
import { generateTitle } from '../../utils/data';
import { DescriptionFormModal } from './DescriptionFormModal';
import { QuestionFormModal } from './QuestionFormModal';
import { AnswerFormModal } from './AnswerFormModal';
import { useEffect } from 'react';
import { ShakeSlow } from 'reshake';
import tutor from "../../assets/images/tutor.jpg";

const Board = () => {
	/*<Sidebar>
				<Tooltip placement="right" title="Add new column">
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => setColumnModalVisible(true)}>
					</Button>
				</Tooltip>
			</Sidebar>*/
	const [refresh, setRefresh] = useState(false);
	const [columns, setColumns] = useState(generateBoard);
	const [columnModalVisible, setColumnModalVisible] = useState(false);
	const [timelineModalVisible, setTimelineModalVisible] = useState(false);
	const [description, setDescription] = useState(generateTitle);
	const [cardId, setCardId] = useState(0);
	const [editVisible, setEditVisible] = useState(false);
	const [questionModalVisible, setQuestionModalVisible] = useState(false);
	const [answerModalVisible, setAnswerModalVisible] = useState(false);
	const [open, setOpen] = useState(false);
	var nowColumns = [];
	const [nowColumstoUpdate, setNowColumstoUpdate] = useState([]);
	const clickCard = (id) => {
		setCardId(id);
	}


	const props = {
		name: 'file',
		action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
		headers: {
			authorization: 'authorization-text',
		},
		onChange(info) {
			if (info.file.status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (info.file.status === 'done') {
				message.success(`${info.file.name} file uploaded successfully`);
			} else if (info.file.status === 'error') {
				info.file.status = 'done';
				message.success(`${info.file.name} file uploaded successfully`);
				const nextDescription = description.map(card => {
					if (card.id === cardId) return { ...card, status: 2 }
					return card
				})
				setDescription(nextDescription)
			}
		},
	};

	const addColumn = (title, timeline) => {
		const newColumnList = [...columns, {
			id: uuidv4(),
			timeline: timeline,
			title: title,
			issues: []
		}];
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		setColumnModalVisible(false);
		message.success('New column is added.'
		);
		console.log(timeline)
	};
	const editColumn = (id, title) => {
		const newColumnList = columns.map(col => {
			if (col.id === id) {
				return {
					...col,
					title: title
				};
			}
			return col;
		});
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('Column is edited.');
	};
	const removeColumn = id => {
		const newColumnList = columns.filter(column => column.id !== id);
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('Column is removed.');
	};

	const addIssue = (issueCol, issue) => {
		const newColumnList = columns.map(col => {
			if (col.id === issueCol.id) {
				return {
					...col,
					issues: [...col.issues, {
						id: uuidv4(),
						title: issue.title,
						description: issue.description,
						person: issue.person,
						tag: issue.tag
					}]
				};
			}
			return col;
		});
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('New issue is added.');
	};

	const editIssue = (issueCol, issue) => {
		const newColumnList = columns.map(col => {
			if (col.id === issueCol.id) {
				return {
					...col,
					issues: col.issues.map(i => i.id === issue.id ? issue : i)
				};
			}
			return col;
		});
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('Issue is edited.');
	};

	const removeIssue = (issueCol, issue) => {
		const newColumnList = columns.map(column => {
			if (issueCol.id === column.id) {
				return {
					...column,
					issues: column.issues.filter(i => i.id !== issue.id)
				};
			}
			return column;
		});
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('Issue is removed.');
	};

	const moveIssueLeft = (issueCol, issue) => {
		const newColumnList = columns.map((column, index) => {
			if (column.id === issueCol.id) {
				return {
					...column,
					issues: column.issues.filter(i => i.id !== issue.id)
				};
			}
			if (index === columns.findIndex(col => col.id === issueCol.id) - 1) {
				return {
					...column,
					issues: [issue, ...column.issues]
				};
			}
			return column;
		});

		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('Issue is moved.');
	};

	const moveIssueRight = (issueCol, issue) => {
		const newColumnList = columns.map((column, index) => {
			if (column.id === issueCol.id) {
				return {
					...column,
					issues: column.issues.filter(i => i.id !== issue.id)
				};
			}
			if (index === columns.findIndex(col => col.id === issueCol.id) + 1) {
				return {
					...column,
					issues: [issue, ...column.issues]
				};
			}
			return column;
		});

		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		message.success('Issue is moved.');
	};

	const handleClickTimeline = (value) => {
		setTimelineModalVisible(value);
	};

	const editDetail = (time, intro) => {
		description[cardId].start_time = time[0].format("YYYY-MM-DD");
		description[cardId].end_time = time[1].format("YYYY-MM-DD");
		description[cardId].intro = intro;
		setEditVisible(false);
	};

	const submitQuestion = () => {
		message.success('Your question has already been sent to your tutor')
	};
	useEffect(() => {
		nowColumns = [];
		columns.map((column, index) => {
			if (column.timeline === cardId) {
				nowColumns.push(column)
			}
		})
		setNowColumstoUpdate(nowColumns)
	}, [cardId, columns]);


	const handleColumnChange = () => {
		// nowColumns=[];
		// columns.map((column,index) => {
		// 	if(column.timeline===cardId){
		// 		nowColumns.push(column)
		// 		}
		// 	console.log(nowColumns)
		// })
		// setNowColumstoUpdate(nowColumns)
	};

	const isMobile = useMediaQuery({ query: '(max-device-width: 600px)' })


	const ref1 = useRef();
	const ref2 = useRef();
	const ref3 = useRef();
	const ref4 = useRef();
	const ref5 = useRef();

	const steps = [
		{
			title: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Edit timeline',
			description: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'You can edit the period and description of timeline',
			cover: (<RobotOutlined style={{ position: 'absolute', top: 65, left: 30, fontSize: 40 }} />),
			target: () => ref1.current,
		},
		{
			title: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Edit or check your task ',
			description: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'You can edit issues or tasks here',
			cover: (<RobotOutlined style={{ position: 'absolute', top: 65, left: 30, fontSize: 40 }} />),
			target: () => ref2.current,
		},
		{
			title: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Check your progress ',
			description: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'You can see the progress of the whole project here',
			cover: (<RobotOutlined style={{ position: 'absolute', top: 65, left: 30, fontSize: 40 }} />),
			target: () => ref3.current,
		},
		{
			title: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Switch timeline ',
			description: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'You can switch different timelines and check different kanban',
			cover: (<RobotOutlined style={{ position: 'absolute', top: 65, left: 30, fontSize: 40 }} />),
			target: () => ref4.current,
		},
		{
			title: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Question and answer ',
			description: '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'You can send your question to tutor and check the answer from tutor',
			cover: (<RobotOutlined style={{ position: 'absolute', top: 65, left: 30, fontSize: 40 }} />),
			target: () => ref5.current,
		},
	]

	return (
		<div>
			<Container>
				{isMobile
					// Information Component
					?
					<div>
						<div style={{ position: 'absolute', right: 0, left: 15, margin: 0, padding: 0, backgroundColor: '#F5F7FB', zIndex: 99 }} >
							<p>
								<span style={{ fontWeight: 'bolder', fontSize: '16px', color: 'black' }} >
									{description[cardId].title}
								</span>
								<Button type="primary" style={{ backgroundColor: '#E7F1FF', color: '#2576CA', marginLeft: 30, width: 80, marginTop: 10 }} onClick={() => { setEditVisible(true) }}>Edit</Button>
							</p>
							<div style={{ marginLeft: 5 }} >
								<ScheduleOutlined style={{ color: '#999999', fontSize: 16 }} ></ScheduleOutlined>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									Period:
								</span>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									{description[cardId].start_time}
									{' '}to{' '}
									{description[cardId].end_time}
								</span>
							</div>
							<div style={{ marginLeft: 5 }} >
								<EditOutlined style={{ color: '#999999', fontSize: 16 }} ></EditOutlined>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									Description:
								</span>
								<span style={{ fontSize: 14, marginLeft: 5, textIndent: 500 }} >
									{description[cardId].intro}
								</span>
							</div>
							<div style={{ marginLeft: 5 }} >
								<TeamOutlined style={{ color: '#999999', fontSize: 16 }} ></TeamOutlined>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									Member:
								</span>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									{description[cardId].member}
								</span>
							</div>
							<div style={{ marginLeft: 5 }} >
								<DashboardOutlined style={{ color: '#999999', fontSize: 16 }} ></DashboardOutlined>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									Status:
								</span>
								<span style={{ fontSize: 14, marginLeft: 5 }} >
									{(() => {
										switch (description[cardId].status) {
											case 1:
												return 'Your submission is being reviewed';
											case 2:
												return 'Tutor is reviewing your submission';
											case 3:
												return 'You can upload files here';
											default:
												return 'Your submission is being reviewed';
										}
									})()}
								</span>
								{(() => {
									switch (description[cardId].status) {
										case 1:
											return <CheckCircleOutlined style={{ color: '#56B535', marginLeft: 5 }} ></CheckCircleOutlined>;
										case 2:
											return <ClockCircleOutlined style={{ color: '#2575CA', marginLeft: 5 }} ></ClockCircleOutlined>;
										case 3:
											return <Upload {...props}><Button icon={<UploadOutlined />} style={{ backgroundColor: '#E7F1FF', color: '#2576CA', marginLeft: 10 }} >Upload</Button></Upload>;
										default:
											return <CheckCircleOutlined style={{ color: '#56B535', marginLeft: 5 }} ></CheckCircleOutlined>;
									}
								})()}

							</div>
							<hr style={{ opacity: 0.5 }} ></hr>
						</div>
						<div style={{ height: 200 }}></div>
					</div>
					:
					<div style={{ marginTop: 15 }}>
						<p>
							<span style={{ fontWeight: 'bolder', fontSize: '20px', color: 'black' }} >
								{description[cardId].title}
							</span>
							<Button type="primary" ref={ref1} style={{ backgroundColor: '#E7F1FF', color: '#2576CA', marginLeft: 30, width: 100 }} onClick={() => { setEditVisible(true) }}>Edit</Button>
							<div style={{ width: '30%', display: 'flex', float: 'right', marginTop: 20 }} ref={ref3}>
								<Steps
									items={[
										{
											status: 'finish',
											icon: <FlagOutlined />,
										},
										{
											status: 'finish',
											icon: <FlagOutlined />,
										},
										{
											status: 'process',
											icon: <LoadingOutlined />,
										},
										{
											status: 'wait',
											icon: <SmileOutlined />,
										},
									]}>
								</Steps>
							</div>
						</p>
						<div style={{ marginLeft: 20 }} >
							<ScheduleOutlined style={{ color: '#999999', fontSize: 20 }} ></ScheduleOutlined>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								Period:
							</span>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								{description[cardId].start_time}
								{' '}to{' '}
								{description[cardId].end_time}
							</span>
						</div>
						<div style={{ marginLeft: 20 }} >
							<EditOutlined style={{ color: '#999999', fontSize: 20 }} ></EditOutlined>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								Description:
							</span>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								{description[cardId].intro}
							</span>
						</div>
						<div style={{ marginLeft: 20 }} >
							<TeamOutlined style={{ color: '#999999', fontSize: 20 }} ></TeamOutlined>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								Member:
							</span>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								{description[cardId].member}
							</span>
						</div>
						<div style={{ marginLeft: 20 }} >
							<DashboardOutlined style={{ color: '#999999', fontSize: 20 }} ></DashboardOutlined>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								Status:
							</span>
							<span style={{ fontSize: 16, marginLeft: 5 }} >
								{(() => {
									switch (description[cardId].status) {
										case 1:
											return 'Your submission is being reviewed';
										case 2:
											return 'Tutor is reviewing your submission';
										case 3:
											return 'You can upload files here';
										default:
											return 'Your submission is being reviewed';
									}
								})()}
							</span>
							{(() => {
								switch (description[cardId].status) {
									case 1:
										return <CheckCircleOutlined style={{ color: '#56B535', marginLeft: 5 }} ></CheckCircleOutlined>;
									case 2:
										return <ClockCircleOutlined style={{ color: '#2575CA', marginLeft: 5 }} ></ClockCircleOutlined>;
									case 3:
										return <Upload {...props}><Button icon={<UploadOutlined />} style={{ backgroundColor: '#E7F1FF', color: '#2576CA', marginLeft: 30 }} >Upload</Button></Upload>;
									default:
										return <CheckCircleOutlined style={{ color: '#56B535', marginLeft: 5 }} ></CheckCircleOutlined>;
								}
							})()}

						</div>
						<ShakeSlow fixed={true} fixedStop={true}>
							<Popconfirm
								icon={<></>}
								trigger="hover"
								cancelText="No"
								placement="right"
								description="Do you need me to tell you how to use kanban system?"
								onConfirm={() => setOpen(true)}
							>
								<QuestionCircleOutlined style={{ display: 'flex', float: 'right', position: 'relative', top: -50, right: 150, fontSize: '40px' }} />
							</Popconfirm>
						</ShakeSlow>
						<hr style={{ opacity: 0.5 }} ></hr>
					</div>
				}
				{/* Kanban Column */}
				<Columns ref={ref2}>
					{nowColumstoUpdate.map((column, index) => (
						<Column
							key={column.id}
							isFirstColumn={index === 0}
							isLastColumn={index === nowColumstoUpdate.length - 1}
							item={column}
							onRemove={removeColumn}
							onIssueAdd={addIssue}
							onIssueEdit={editIssue}
							onIssueRemove={removeIssue}
							onMoveIssueToLeftColumn={moveIssueLeft}
							onMoveIssueToRightColumn={moveIssueRight}
							onColumnEdit={editColumn}
						/>
					))}
					{isMobile
						?
						<>
							<PlusCircleFilled style={{ color: '#C0C6CD', fontSize: '100px', paddingLeft: '120px', paddingRight: '120px', paddingTop: 150, display: 'flex', alignItems: 'flex-start', height: '100vh' }} key="add" onClick={() => setColumnModalVisible(true)} />
							<img src={tutor} alt={'tutor'} ref={ref5} onClick={() => { setQuestionModalVisible(true) }} style={{ color: '#3D85D1', width: '40px', position: 'absolute', bottom: 100, right: 100, border: 'solid 2px', borderRadius: 40, borderColor: '#000000' }} />
							{/* <MessageOutlined onClick={()=>{setAnswerModalVisible(true)}} style={{color:'#3D85D1',fontSize:'40px',position:'absolute',bottom:100,right:30}}></MessageOutlined> */}
						</>
						:
						<>
							{/* add new Column */}
							<PlusCircleFilled style={{ color: '#C0C6CD', fontSize: '100px', paddingLeft: '120px', paddingRight: '120px', display: 'flex', alignItems: 'center', height: '100vh' }} key="add" onClick={() => setColumnModalVisible(true)} />
							{/* Question Button */}
							<img src={tutor} alt={'tutor'} ref={ref5} onClick={() => { setQuestionModalVisible(true) }} style={{ color: '#3D85D1', width: 60, position: 'absolute', bottom: 120, right: 200, border: 'solid 3px', borderRadius: 40, borderColor: '#000000' }} />
							{/* Answer Button */}
							{/* <MessageOutlined onClick={()=>{setAnswerModalVisible(true)}} style={{color:'#3D85D1',fontSize:'60px',position:'absolute',bottom:150,right:100}}></MessageOutlined> */}
						</>
					}
				</Columns>
				<ColumnFormModal
					visible={columnModalVisible}
					onSubmit={addColumn}
					onCancel={() => setColumnModalVisible(false)}
					timeline={cardId}
				/>
			</Container>
			<DescriptionFormModal
				visible={editVisible}
				data={description[cardId]}
				onCancel={() => {
					setEditVisible(false);
				}}
				onSubmit={editDetail}
			/>
			<QuestionFormModal
				visible={questionModalVisible}
				cardId={cardId}
				columns={columns}
				onCancel={() => {
					setQuestionModalVisible(false)
				}}
				onSubmit={submitQuestion}
			/>
			<AnswerFormModal
				visible={answerModalVisible}
				cardId={cardId}
				columns={columns}
				onCancel={() => {
					setAnswerModalVisible(false)
				}}
				onSubmit={() => {
					setAnswerModalVisible(false)
				}}
			/>
			{/* <Button onClick={() => setOpen(true)} style={{position:'absolute',top:0}}>Test</Button> */}
			{/* Timeline Cards */}
			<div style={{ height: '4vh', position: 'relative', top: '2vh' }} ref={ref4}>
				<Timeline onChange={clickCard} data={description} changeColumn={handleColumnChange}></Timeline>
			</div>
			<Tour open={open} onClose={() => setOpen(false)} steps={steps}
				indicatorsRender={(current, total) => (
					<span>
						{current + 1} / {total}
					</span>
				)}
			/>
		</div>
	);

};

export default Board;