import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Popconfirm, Tooltip, Tag, Avatar } from 'antd';
import { DeleteOutlined, EditOutlined, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

import { IssueTitle } from './Issue.styled';
import '../../assets/styles/main.css';
import face from "../../assets/images/avatar1.png";
import face2 from "../../assets/images/avatar2.png";
import face3 from "../../assets/images/avatar3.png";


const { Paragraph } = Typography;
const { Title } = Typography;

const Issue = ({ item, isFirstColumn, isLastColumn, onEdit, onRemove, onMoveToLeftColumn, onMoveToRightColumn, cardId, taskFilter }) => {
	const moveActions = () => {
		// if (isFirstColumn && isLastColumn) {
		// 	return null;
		// }
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
		if (isFirstColumn && !isLastColumn) {
			return [
				<Tooltip placement="bottom" title="Move to right column" arrowPointAtCenter>
					<DoubleRightOutlined key="edit" onClick={onMoveToRightColumn} />
				</Tooltip>
			];
		}
		if (isLastColumn && !isFirstColumn) {
			return [
				<Tooltip placement="bottom" title="Move to left column" arrowPointAtCenter>
					<DoubleLeftOutlined key="ediit" onClick={onMoveToLeftColumn} />
				</Tooltip>
			];
		}
		if (isLastColumn && isFirstColumn) {
			return [];
		}
	};
	return (
		<Card
			actions={[
				...moveActions(),
				<EditOutlined key="edit" onClick={onEdit} />,
				<Popconfirm placement="bottomLeft" title="Are you sure to delete this issue?" onConfirm={onRemove} okText="Yes" cancelText="No" arrowPointAtCenter okButtonProps={{}}>
					<DeleteOutlined style={{ color: 'red' }} key="delete" />
				</Popconfirm>
			]}
			size={'small'}
			style={{ height: '130%', width: '300px',opacity: (cardId === item.timeline) || taskFilter === false ? 1 : 0.4}}
		>
			<IssueTitle>{item.title}</IssueTitle>
			<Paragraph className="mh-100 description card-para" style={{ height: '110px', overflow: 'auto' }}>
				{item.description}
			</Paragraph>
			{item.tag.map(tag => (
				<Tag color={tag.value} style={{ paddingLeft: 15, paddingRight: 15, fontSize: 15 }}>{tag.label}</Tag>
			))}
			<br />
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