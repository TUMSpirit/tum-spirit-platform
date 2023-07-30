import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from 'react-responsive';
import { Descriptions, Input, Modal,DatePicker } from 'antd';
import moment from 'moment';
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;


export const DescriptionFormModal = ({ visible, issue, onSubmit, onCancel , data}) => {
	const [time, setTime] = useState([dayjs(data.start_time),dayjs(data.end_time)]);
	const [description, setDescription] = useState();

	useEffect(() => {
		setTime([dayjs(data.start_time),dayjs(data.end_time)]);
		setDescription(data?.intro ?? '');
	}, [data]);

    const dateFormat = "YYYY-MM-DD";

	const handleOnCancel = () => {
		setTime([dayjs(data.start_time),dayjs(data.end_time)]);
		setDescription(data.intro);
		onCancel && onCancel();
	};

	const isMobile = useMediaQuery({ query: '(max-device-width: 600px)' })

	return (
		<Modal
			title="Detail Edit"
			visible={visible}
			onOk={() => onSubmit(time, description)}
			onCancel={() => handleOnCancel()}
		>
			{isMobile
			?
			// Datepicker to change the period of Meilstone
			<>
				<DatePicker
				format={dateFormat}
				value={time[0]}
				style={{ marginTop: 4 }}
				onChange={dataStrings => setTime([dataStrings,time[1]])} />
				<DatePicker
				format={dateFormat}
				value={time[1]}
				style={{ marginTop: 4 }}
				onChange={dataStrings => setTime([time[0],dataStrings])} />
			</>
			:
			<RangePicker
			format={dateFormat}
			value={time}
			style={{ marginTop: 4 }}
			onChange={dataStrings => setTime(dataStrings)} 
			/>
			}
			{/* Change Description */}
			<TextArea
				placeholder="Description"
				value={description}
				onChange={e => setDescription(e.target.value)}
				autoSize={{ minRows: 3, maxRows: 6 }}
				style={{ marginTop: 4 }} />
		</Modal>
	);
};

DescriptionFormModal.propTypes = {
	visible: PropTypes.bool,
	issue: PropTypes.object,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func
};

export default DescriptionFormModal;