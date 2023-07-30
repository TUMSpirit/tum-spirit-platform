import React, { useState } from 'react';
import propTypes from 'prop-types';
import { useMediaQuery } from 'react-responsive';

import { Popconfirm, Tooltip,List } from 'antd';
import { CloseCircleFilled, PlusCircleFilled } from '@ant-design/icons';

import { Issue, IssueFormModal } from '../Issue';
import { Container, ColumnTitle, Header, HeaderActions, IssueCount, Root,GlobalStyle } from './Column.styled';

const Column = ({
	item,
	isFirstColumn,
	isLastColumn,
	onRemove,
	onIssueAdd,
	onIssueEdit,
	onIssueRemove,
	onMoveIssueToLeftColumn,
	onMoveIssueToRightColumn,
	onColumnEdit
}) => {
	const [issueModalVisible, setIssueModalVisible] = useState(false);
	const [editingIssue, setEditingIssue] = useState();

	const handleOnIssueAdd = (title, description) => {
		setIssueModalVisible(false);
		onIssueAdd && onIssueAdd(item, { title, description });
	};

	const handleOnIssueEdit = (id, title, description) => {
		setIssueModalVisible(false);
		onIssueEdit && onIssueEdit(item, { id, title, description });
	};

	const isMobile = useMediaQuery({ query: '(max-device-width: 600px)' });

	return (
		<Root>
			<Container>
				<Header>
					<ColumnTitle>{item?.title}</ColumnTitle>
					<HeaderActions>
						<IssueCount>{`${item?.issues.length} issue${item?.issues.length > 1 ? 's' : ''}`}</IssueCount>
						{isMobile
						?
						<>
						<Tooltip placement="topLeft" title="Add new issue" arrowPointAtCenter>
							<PlusCircleFilled style={{ color: '#C0C6CD',fontSize: '40px' }} key="add" onClick={() => setIssueModalVisible(true)} />
						</Tooltip>
						{/* <Tooltip placement="topLeft" title="Edit column name" arrowPointAtCenter>
							<PlusCircleFilled style={{ color: '#C0C6CD',fontSize: '20px' }} key="add" onClick={() => setIssueModalVisible(true)} />
						</Tooltip> */}
						<GlobalStyle/>
						<Popconfirm placement="bottomLeft" arrowPointAtCenter title="Are you sure to delete this column?" onConfirm={() => onRemove(item.id)} okText="Yes" cancelText="No">
							<CloseCircleFilled style={{ color: '#C0C6CD',fontSize: '40px' }} key="remove" />
						</Popconfirm>
						</>
						:
						<>
						<Tooltip placement="topLeft" title="Add new issue" arrowPointAtCenter>
							<PlusCircleFilled style={{ color: '#C0C6CD',fontSize: '20px' }} key="add" onClick={() => setIssueModalVisible(true)} />
						</Tooltip>
						{/* <Tooltip placement="topLeft" title="Edit column name" arrowPointAtCenter>
							<PlusCircleFilled style={{ color: '#C0C6CD',fontSize: '20px' }} key="add" onClick={() => setIssueModalVisible(true)} />
						</Tooltip> */}
						<GlobalStyle/>
						<Popconfirm placement="bottomLeft" arrowPointAtCenter title="Are you sure to delete this column?" onConfirm={() => onRemove(item.id)} okText="Yes" cancelText="No">
							<CloseCircleFilled style={{ color: '#C0C6CD',fontSize: '20px' }} key="remove" />
						</Popconfirm>
						</>
						}
					</HeaderActions>
				</Header>
				<List
				rowKey="id"
				grid={{
				}}
				>
					{item.issues.map(issue => (
						<List.Item style={{height:'220px',marginTop:'30px',paddingLeft:0}}>
						<Issue
							key={issue.id}
							item={issue}
							isFirstColumn={isFirstColumn}
							isLastColumn={isLastColumn}
							onEdit={() => {
								setEditingIssue(issue);
								setIssueModalVisible(true);
							}}
							onRemove={() => onIssueRemove(item, issue)}
							onMoveToLeftColumn={() => onMoveIssueToLeftColumn(item, issue)}
							onMoveToRightColumn={() => onMoveIssueToRightColumn(item, issue)}
						/>
						</List.Item>
					))}
				</List>
				<IssueFormModal
					visible={issueModalVisible}
					issue={editingIssue}
					onSubmit={(id, title, description) => {
						id ? handleOnIssueEdit(id, title, description) : handleOnIssueAdd(title, description);
					}}
					onCancel={() => {
						setIssueModalVisible(false);
						setEditingIssue(null);
					}}
				/>
			</Container>
		</Root>
	);
};

Column.propTypes = {
	item: propTypes.object,
	isFirstColumn: propTypes.bool,
	isLastColumn: propTypes.bool,
	onRemove: propTypes.func,
	onIssueEdit: propTypes.func,
	onIssueRemove: propTypes.func,
	onIssueAdd: propTypes.func,
	onMoveIssueToLeftColumn: propTypes.func,
	onMoveIssueToRightColumn: propTypes.func,
	onColumnEdit:propTypes.func,
};

export default Column;
