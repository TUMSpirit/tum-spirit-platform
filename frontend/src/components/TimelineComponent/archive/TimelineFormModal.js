import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const TimelineFormModal = ({ visible, onSubmit, onCancel }) => {
	const [title, setTitle] = useState();

	const handleOnCancel = () => {
		onCancel && onCancel();
	};

	return (
		<Modal
			title="Do you want to advance the course progress"
			visible={visible}
			onOk={() => onSubmit()}
			onCancel={() => handleOnCancel()}
		>
		</Modal>
	);
};

TimelineFormModal.propTypes = {
	visible: PropTypes.bool,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func
};


export default TimelineFormModal;