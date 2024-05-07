import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Popconfirm, Tooltip, Tag, Avatar } from 'antd';
import { DeleteOutlined, EditOutlined, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

import face from "../../assets/images/avatar1.png";
import face2 from "../../assets/images/avatar2.png";
import face3 from "../../assets/images/avatar3.png";

import { IssueTitle } from './Issue.styled';

const {Title} = Typography;
const { Paragraph } = Typography;

const Issue = ({ item, isFirstColumn, isLastColumn, onEdit, onRemove, onMoveToLeftColumn, onMoveToRightColumn }) => {
	const moveActions = () => {
		if (isFirstColumn && isLastColumn) {
			return null;
		}
		if (!isFirstColumn && !isLastColumn) {
			return [
				<Tooltip placement="bottom" title="Move to left column" arrowPointAtCenter>
					<DoubleLeftOutlined key="edit" onClick={onMoveToLeftColumn} />
				</Tooltip>,
				<Tooltip placement="bottom" title="Move to right column" arrowPointAtCenter>
					<DoubleRightOutlined key="edit" onClick={onMoveToRightColumn} />
				</Tooltip>
			];
		}
		if (isFirstColumn) {
			return [
				<Tooltip placement="bottom" title="Move to right column" arrowPointAtCenter>
					<DoubleRightOutlined key="edit" onClick={onMoveToRightColumn} />
				</Tooltip>
			];
		}
		if (isLastColumn) {
			return [
				<Tooltip placement="bottom" title="Move to left column" arrowPointAtCenter>
					<DoubleLeftOutlined key="edit" onClick={onMoveToLeftColumn} />
				</Tooltip>
			];
		}
	};

	return (
		<Card
			actions={[
				...moveActions(),
				<EditOutlined key="edit" onClick={onEdit} />,
				<Popconfirm placement="bottomLeft" title="Are you sure to delete this issue?" onConfirm={onRemove} okText="Yes" cancelText="No" arrowPointAtCenter>
					<DeleteOutlined style={{ color: 'red' }} key="delete" />
				</Popconfirm>
			]}
		>
			<IssueTitle>{item.title}</IssueTitle>
			<Paragraph className="mh-100 description">
				{item.description}
			</Paragraph>
			<Avatar.Group style={{ display: 'flex', float: 'right' }}>
				<Avatar
					className="shape-avatar"
					shape="square"
					size={30}
					src={face3}
					style={{ marginTop: 0 }}
				></Avatar>
				<div className="avatar-info" style={{ marginTop: 20 }}>
					<Title level={5}>{item.person}</Title>
				</div>
			</Avatar.Group>
		</Card>
	);
};

Issue.propTypes = {
	item: PropTypes.object,
	isFirstColumn: PropTypes.bool,
	isLastColumn: PropTypes.bool,
	onEdit: PropTypes.func,
	onRemove: PropTypes.func,
	onMoveToLeftColumn: PropTypes.func,
	onMoveToRightColumn: PropTypes.func,
};

export default Issue;
