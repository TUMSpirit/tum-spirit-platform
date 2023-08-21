import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Modal,Select,Tag  } from 'antd';

import face from "../../assets/images/avatar1.png";
import face2 from "../../assets/images/avatar2.png";
import face3 from "../../assets/images/avatar3.png";

const { TextArea } = Input;
const { Option } = Select;

const IssueFormModal = ({ visible, issue, onSubmit, onCancel }) => {
	const [title, setTitle] = useState();
	const [description, setDescription] = useState();
	const [tag, setTag] = useState();
	const [person, setPerson]= useState();

	useEffect(() => {
		setTitle(issue?.title ?? '');
		setDescription(issue?.description ?? '');
		setTag(issue?.tag ?? '');
		setPerson(issue?.person ?? '');
	}, [issue]);

	const handleOnCancel = () => {
		setTitle('');
		setDescription('');
		onCancel && onCancel();
	};

	const tagRender = (props) => {
		const { label, value, closable, onClose } = props;
		const onPreventMouseDown = (event) => {
		  event.preventDefault();
		  event.stopPropagation();
		};
		return (
		  <Tag
			color={value}
			onMouseDown={onPreventMouseDown}
			closable={closable}
			onClose={onClose}
			style={{
			  marginRight: 3,
			}}
		  >
			{label}
		  </Tag>
		);
	  };
	  const options = [
		{
		  label:'User Research',
		  value: 'gold',
		},
		{
		  label:'LOFI',
		  value: 'lime',
		},
		{
		  label:'HIFI',
		  value: 'green',
		},
		{
		  label:'Development',
		  value: 'cyan',
		},
	  ];

	return (
		<Modal
			title="Add new issue"
			visible={visible}
			onOk={() => onSubmit(issue?.id, title, description,person,tag)}
			onCancel={() => handleOnCancel()}
			okButtonProps={{ disabled: !title }}
		>
			<Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
			<TextArea
				placeholder="Description"
				value={description}
				onChange={e => setDescription(e.target.value)}
				autoSize={{ minRows: 3, maxRows: 6 }}
				style={{ marginTop: 4 }} />
			<Select
				placeholder="type of the task"
				mode="multiple"
				value={tag}
				labelInValue={true}
				onChange={(value)=>{
					var label = []
					value.map(item => (
						label.push(item)
					))
					setTag(value)
				}}
				tagRender={tagRender}
				style={{
				width: '100%',
				marginTop: 4 ,
			}}
			options={options}
			/>
			<Select
				showSearch
				placeholder="Person in charge"
				value={person}
				optionFilterProp="children"
				style={{ marginTop: 4 }}
				filterOption={(input, option) =>
				(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
				}
				onChange = {(value) => {
					setPerson(value)
				}}
			>
				<Option value="John Johnson">
				John Johnson
				</Option>
				<Option value="Max Muster">
				Max Muster
				</Option>
				<Option value="Clara Copyright">
				Clara Copyright
				</Option>
			</Select>
		</Modal>
	);
};

IssueFormModal.propTypes = {
	visible: PropTypes.bool,
	issue: PropTypes.object,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func
};

export default IssueFormModal;
