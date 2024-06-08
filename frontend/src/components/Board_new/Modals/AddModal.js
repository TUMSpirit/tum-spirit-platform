
import React, {useRef, useState} from "react";
import { getRandomColors } from "../helpers/getRandomColors";
import { v4 as uuidv4 } from "uuid";
import {Button, Modal, Row, Col, Form, Input, message} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const AddModal = ({ onClose, isCreateEventOpen, isUpdateEventOpen, handleAddTask, handleEditTask, handleDeleteTask, initValues }) => {
	const initialTaskData = {
		id: isUpdateEventOpen?initValues.id:uuidv4(),
		title: isUpdateEventOpen?initValues.title:"",
		description: isUpdateEventOpen?initValues.description:"",
		priority: isUpdateEventOpen?initValues.priority:"",
		deadline: isUpdateEventOpen?initValues.deadline:"",
		image: isUpdateEventOpen?initValues.image:"",
		alt: isUpdateEventOpen?initValues.alt:"",
		tags: isUpdateEventOpen?initValues.tags:[]
	}

	const [taskData, setTaskData] = useState(initialTaskData)
	const [tagTitle, setTagTitle] = useState("");
	const [form] = Form.useForm();
	const formRef = useRef(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setTaskData({ ...taskData, [name]: value });
	};

	const handleImageChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const reader = new FileReader();
			reader.onload = function (e) {
				if (e.target) {
					setTaskData({ ...taskData, image: e.target.result });
				}
			};
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	const handleAddTag = () => {
		console.log("tst");
		if (tagTitle.trim() !== "") {
			const { bg, text } = getRandomColors();
			const newTag = { title: tagTitle.trim(), bg, text };
			setTaskData({ ...taskData, tags: [...taskData.tags, newTag] });
			setTagTitle("");
		}
	};

	const closeModal = () => {
		form.resetFields();
		onClose();
	};

	const handleSubmit = () => {
		if(isUpdateEventOpen){
			handleEditTask(taskData);
		} else {
			handleAddTask(taskData);
		}
		form.resetFields();
		closeModal();
	};

	const handleDelete = (id) => {
		form.resetFields();
		handleDeleteTask(id);
	}


	const getInitialFormValues = () => {
		return {
			id: taskData.id,
			title: taskData.title,
			description: taskData.description,
			priority: taskData.priority,
			deadline: taskData.deadline,
			image: taskData.image,
			alt: taskData.alt,
			tags: taskData.tags
		}
	}

	return (
		<Modal closeIcon={false} title={"Task"} open={isCreateEventOpen || isUpdateEventOpen}
			className={"modal-addEvent"}
			   footer={[
				   isUpdateEventOpen && (<Button data-testid='deleteEventButton' onClick={() => handleDelete(taskData.id)} type='primary' icon={<DeleteOutlined/>}/>),
				   <Button onClick={closeModal}>Cancel</Button>,
				   <Button data-testid='saveEventButton' key="submit" type='primary' onClick={form.submit}>Save</Button>
			   ]}
		>

			<Form layout={'vertical'} onFinish={handleSubmit} requiredMark={false} form={form} ref={formRef} initialValues={getInitialFormValues()}>
						<Form.Item label={"Title"} name="title">
							<Input 	type="text"
									  name="title"
									  onChange={handleChange}
									  placeholder="Title"
							/>
						</Form.Item>
				<Form.Item label={"Description"}  name="description">
					<Input name="description"
						   onChange={handleChange}
						   placeholder="Description"
					/>
				</Form.Item>
			<Form.Item label={"Priority"}  name="priority">
			<select
					name="priority"
					onChange={handleChange}
					className="w-full h-12 px-2 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
				>
					<option value="">Priority</option>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
				</select>
			</Form.Item>
				<Form.Item label={"Estimated Time (Minutes)"}  name="deadline">
				<input
					type="number"
					name="deadline"
					onChange={handleChange}
					placeholder="Deadline"
					className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
				/>
				</Form.Item>
				<Form.Item label={"Tags"}  name="tags">
				<input
					type="text"
					onChange={(e) => setTagTitle(e.target.value)}
					placeholder="Tag Title"
					className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm mb-4"
				/>
				<div className="w-full">
					{taskData.tags && <span>Tags:</span>}
					{taskData.tags.map((tag, index) => (
						<div
							key={index}
							className="inline-block mx-1 px-[10px] py-[2px] text-[13px] font-medium rounded-md"
							style={{ backgroundColor: tag.bg, color: tag.text }}
						>
							{tag.title}
						</div>
					))}
				</div>
				</Form.Item>
			</Form>
			<button
				className="w-full rounded-md h-9 bg-slate-500 text-amber-50 font-medium mb-2"
				onClick={handleAddTag}
			>
				Add Tag
			</button>
		</Modal>
	);
};

export default AddModal;

/*<div
			className={`w-screen h-screen place-items-center fixed top-0 left-0 ${
				isOpen ? "grid" : "hidden"
			}`}
		>
			<div
				className="w-full h-full bg-black opacity-70 absolute left-0 top-0 z-20"
				onClick={closeModal}
			></div>
			<div className="md:w-[30vw] w-[90%] bg-white rounded-lg shadow-md z-50 flex flex-col items-center gap-3 px-5 py-6">
				<input
					type="text"
					name="title"
					value={taskData.title}
					onChange={handleChange}
					placeholder="Title"
					className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
				/>
				<input
					type="text"
					name="description"
					value={taskData.description}
					onChange={handleChange}
					placeholder="Description"
					className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
				/>
				<select
					name="priority"
					onChange={handleChange}
					value={taskData.priority}
					className="w-full h-12 px-2 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
				>
					<option value="">Priority</option>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
				</select>
				<input
					type="number"
					name="deadline"
					value={taskData.deadline}
					onChange={handleChange}
					placeholder="Deadline"
					className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
				/>
				<input
					type="text"
					value={tagTitle}
					onChange={(e) => setTagTitle(e.target.value)}
					placeholder="Tag Title"
					className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
				/>
				<button
					className="w-full rounded-md h-9 bg-slate-500 text-amber-50 font-medium"
					onClick={handleAddTag}
				>
					Add Tag
				</button>
				<div className="w-full">
					{taskData.tags && <span>Tags:</span>}
					{taskData.tags.map((tag, index) => (
						<div
							key={index}
							className="inline-block mx-1 px-[10px] py-[2px] text-[13px] font-medium rounded-md"
							style={{ backgroundColor: tag.bg, color: tag.text }}
						>
							{tag.title}
						</div>
					))}
				</div>
				<button
					className="w-full mt-3 rounded-md h-9 bg-orange-400 text-blue-50 font-medium"
					onClick={handleSubmit}
				>
					Submit Task
				</button>
			</div>
		</div>*/