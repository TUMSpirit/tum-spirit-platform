import React, { useState } from 'react';
import { Button, Tooltip, message,Timeline, Steps} from 'antd';
import { PlusOutlined,ClockCircleOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

import { Column, ColumnFormModal } from '../Column';
import { Columns, Container, Timeliner} from './Board.styled';

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
	const [columns, setColumns] = useState(generateBoard);
	const [columnModalVisible, setColumnModalVisible] = useState(false);

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

	return (
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
					/>
				))}
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
			<Steps size="small" style={{padding:'20px',backgroundColor:'white',width:'100%'}}>
				<Steps.Item status={'finish'}></Steps.Item>
				<Steps.Item status={'finish'}></Steps.Item>
				<Steps.Item status={'finish'}></Steps.Item>
				<Steps.Item status={'process'}></Steps.Item>
				<Steps.Item status={'wait'}></Steps.Item>
				<Steps.Item status={'wait'}></Steps.Item>
				<Steps.Item status={'wait'}></Steps.Item>
			</Steps>
		</Container>
	);
};

export default Board;