import React, { useState , useRef} from 'react';
import { Button, Tooltip, message, Steps} from 'antd';
import { PlusOutlined,ClockCircleOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

import { Timeline, TimelineFormModal } from '../Timeline';

import { Column, ColumnFormModal } from '../Column';
import { Columns, Container,} from './Board.styled';

import {PlusCircleFilled } from '@ant-design/icons';
import Storage from '../../services/StorageService';

import { generateBoard } from '../../utils/helper';

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
	const stepsRef = useRef();
	const [columns, setColumns] = useState(generateBoard);
	const [columnModalVisible, setColumnModalVisible] = useState(false);
	const [timelineModalVisible,setTimelineModalVisible] = useState(false);

	const addColumn = title => {
		const newColumnList = [...columns, {
			id: uuidv4(),
			title: title,
			issues: []
		}];
		setColumns(newColumnList);
		Storage.setItem('kanbanBoardData', newColumnList);
		setColumnModalVisible(false);
		message.success('New column is added.');
	};
	const editColumn = (id,title) => {
		const newColumnList = columns.map(col => {
			if (col.id === id) {
				return {
					...col,
					title:title
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
						description: issue.description
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

	return (
		<div>
		<Container>
			<Columns>
				{columns.map((column, index) => (
					<Column
						key={column.id}
						isFirstColumn={index === 0}
						isLastColumn={index === columns.length - 1}
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
				<PlusCircleFilled style={{ color: '#C0C6CD',fontSize: '100px', paddingLeft:'120px', paddingRight:'120px',display:'flex',alignItems:'center',height:'100vh' }} key="add" onClick={() => setColumnModalVisible(true)} />
			</Columns>
			<ColumnFormModal
				visible={columnModalVisible}
				onSubmit={addColumn}
				onCancel={() => setColumnModalVisible(false)}
			/>
			{/* <Timeliner>
				<Timeline pending={true}>
					<Timeline.Item style={{paddingBottom:'300%'}}></Timeline.Item>
					<Timeline.Item color={'red'} style={{paddingBottom:'300%'}}></Timeline.Item>
					<Timeline.Item color={'green'} style={{paddingBottom:'300%'}}></Timeline.Item>
					<Timeline.Item style={{paddingBottom:'300%'}} dot={<ClockCircleOutlined style={{fontSize: '16px'}}/>}></Timeline.Item>
				</Timeline>
			</Timeliner> */}
		</Container>
		<Timeline onChange={handleClickTimeline} ref={stepsRef}></Timeline>
		<TimelineFormModal 
			visible={timelineModalVisible}
			onCancel={() => handleClickTimeline(false)}
			onSubmit={() => {
				stepsRef.current.updateStep();
				setTimelineModalVisible(false);
			}}
		/>
		</div>
	);
};

export default Board;