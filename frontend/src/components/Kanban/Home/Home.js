import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Input, Tag, Badge, Typography, Select, message } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import axios from "axios";
import { useAuthHeader } from 'react-auth-kit';
import { v4 as uuidv4 } from "uuid";

import AddModal from "../Modals/AddModal";
import Task from "../Task";
import { SubHeader } from '../../../layout/SubHeader';
//import { onDragEnd } from "../helpers/onDragEnd";

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

const tagsData = ['Planning', 'UI', 'Organization', 'Hi-Fi', 'Lo-Fi'];
const milestonesData = ['M1', 'M2', 'M3'];

class Board {
	constructor() {
		this.backlog = { name: "backlog", items: [] };
		this.doing = { name: "doing", items: [] };
		this.testing = { name: "testing", items: [] };
		this.done = { name: "done", items: [] };
	}
}

const KanbanColumn = ({ columnId, column, editModal, openModal }) => (
	<Col xs={24} sm={24} md={12} lg={8} xl={6} className="kanban-column">
		<Droppable droppableId={columnId} key={columnId}>
			{(provided) => (
				<div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column-content">
					<div className="kanban-column-header">
						<div className="kanban-column-title">
							<Text style={{ textTransform: "uppercase" }}>{column.name}</Text>
							<Badge count={column.items.length} style={{ backgroundColor: 'grey', marginLeft: '10px' }} />
						</div>
						<Button type="text" icon={<PlusOutlined />} onClick={() => openModal(columnId)} />
					</div>
					{column.items.map((task, index) => (
						<Draggable key={task._id.toString()} draggableId={task._id.toString()} index={index}>
							{(provided) => (
								<Task provided={provided} task={task} editModal={editModal} />
							)}
						</Draggable>
					))}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	</Col>
);

const Home = () => {
	const [tasks, setTasks] = useState([]);
	const [board, setBoard] = useState(new Board());
	const [selectedColumn, setSelectedColumn] = useState("");
	const [isCreateEventPopupOpen, setIsCreateEventPopupOpen] = useState(false);
	const [isUpdateEventPopupOpen, setIsUpdateEventPopupOpen] = useState(false);
	const [currentEvent, setCurrentEvent] = useState(null);
	const [selectedTags, setSelectedTags] = useState([]);
	const [selectedMilestones, setSelectedMilestones] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredTasks, setFilteredTasks] = useState([]);
	const authHeader = useAuthHeader();

	const getTasks = async () => {
		try {
			const response = await axios.get('http://localhost:8000/api/kanban/get-tasks', {
				headers: {
					"Authorization": authHeader()
				}
			});
			if (response.data) {
				setTasks(response.data);
				updateFilteredTasks(response.data, '', [], []);
				return response.data; // Ensure the function returns tasks
			} else {
				console.error("No data in response:", response);
				message.error('No tasks data received from server');
				return [];
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			message.error('Error fetching tasks');
			return [];
		}
	};

	const postTask = async (taskData) => {
		try {
			const response = await axios.post('http://localhost:8000/api/kanban/create-task', taskData, {
				headers: {
					"Authorization": authHeader()
				}
			});
			return response.data;
		} catch (error) {
			console.error("Error posting task:", error);
			message.error('Error posting task');
		}
	};

	const putTask = async (taskData) => {
		try {
			const { id, ...taskDataWithoutId } = taskData;
			const response = await axios.put(`http://localhost:8000/api/kanban/update-task/${taskData.id}`, taskDataWithoutId, {
				headers: {
					"Authorization": authHeader()
				}
			});
			return response.data;
		} catch (error) {
			console.error("Error updating task:", error);
			message.error('Error updating task');
		}
	};

	const updateTaskColumn = async (taskId, newColumn) => {
	    try {
			const response = await axios.put(
				`http://localhost:8000/api/kanban/update-task/${taskId}/column`,
				{ column: newColumn },
				{
					headers: {
						Authorization: authHeader(),
						'Content-Type': 'application/json', // Ensure content type is set
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error('Error updating task column:', error);
			throw error;
		}
	};

	const handleTagChange = (tag, checked) => {
		const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter((t) => t !== tag);
		setSelectedTags(nextSelectedTags);
		updateFilteredTasks(tasks, searchTerm, nextSelectedTags, selectedMilestones);
	};

	const handleMilestonesChange = (values) => {
		setSelectedMilestones(values);
		updateFilteredTasks(tasks, searchTerm, selectedTags, values);
	};

	const openModal = (columnId) => {
		setSelectedColumn(columnId);
		setIsCreateEventPopupOpen(true);
	};

	const editModal = (task) => {
		setCurrentEvent(task);
		setIsUpdateEventPopupOpen(true);
	};

	const closeModal = () => {
		setIsCreateEventPopupOpen(false);
		setIsUpdateEventPopupOpen(false);
	};

	const handleAddTask = async (taskData) => {
		try {
			taskData.column = selectedColumn;
			await postTask(taskData);
			const tasksFromServer = await getTasks();
			setTasks(tasksFromServer);
			updateFilteredTasks(tasksFromServer, searchTerm, selectedTags, selectedMilestones);
			const updatedBoard = createBoard(tasksFromServer);
			setBoard(updatedBoard);
		} catch (error) {
			console.error('Error adding task:', error);
		}
	};

	const handleEditTask = async (taskData) => {
		try {
			await putTask(taskData);
			const tasksFromServer = await getTasks();
			setTasks(tasksFromServer);
			updateFilteredTasks(tasksFromServer, searchTerm, selectedTags, selectedMilestones);
			const updatedBoard = createBoard(tasksFromServer);
			setBoard(updatedBoard);
		} catch (error) {
			console.error('Error editing task:', error);
		}
	};

	const deleteTask = async (id) => {
		try {
			const response = await axios.delete(`http://localhost:8000/api/kanban/delete-task/${id}`, {
				headers: {
					"Authorization": authHeader()
				}
			});

			if (response.status === 200 || response.status === 204) {
				const tasksFromServer = await getTasks();
				setTasks(tasksFromServer);
				updateFilteredTasks(tasksFromServer, searchTerm, selectedTags, selectedMilestones);
				const updatedBoard = createBoard(tasksFromServer);
				setBoard(updatedBoard);
				message.success('Task deleted successfully');

				// Close the modal if it's open
				if (isUpdateEventPopupOpen) {
					setIsUpdateEventPopupOpen(false);
				}
			} else {
				console.error('Unexpected response:', response);
				message.error('Unexpected response from the server');
			}
		} catch (error) {
			if (error.response) {
				console.error('Error response:', error.response);
				message.error('Error deleting task: ' + (error.response.data.message || 'Server error'));
			} else if (error.request) {
				console.error('No response received:', error.request);
				message.error('No response received from server');
			} else {
				console.error('Error setting up request:', error.message);
				message.error('Error setting up request: ' + error.message);
			}
		}
	};

	const handleSearch = (input) => {
		setSearchTerm(input);
		updateFilteredTasks(tasks, input, selectedTags, selectedMilestones);
	};

	const createBoard = (filteredTasks) => {
		const board = new Board();
		filteredTasks.forEach(task => {
			if (!board[task.column]) {
				board[task.column] = { name: task.column, items: [] };
			}
			board[task.column].items.push(task);
		});
		return board;
	};

	const updateFilteredTasks = (tasks, searchTerm, tags, milestones) => {
		let filteredTasks = tasks;

		// Filter by search term
		if (searchTerm) {
			const lowercasedSearchTerm = searchTerm.toLowerCase();
			filteredTasks = filteredTasks.filter(task =>
				task.title.toLowerCase().includes(lowercasedSearchTerm) ||
				task.description.toLowerCase().includes(lowercasedSearchTerm)
			);
		}

		// Filter by tags
		if (tags.length > 0) {
			filteredTasks = filteredTasks.filter(task => tags.some(tag => task.tags.includes(tag)));
		}

		// Filter by milestones
		if (milestones.length > 0) {
			filteredTasks = filteredTasks.filter(task => milestones.includes(task.milestone));
		}

		setFilteredTasks(filteredTasks);
		const updatedBoard = createBoard(filteredTasks);
		setBoard(updatedBoard);
	};

	const onDragEnd = async (result, board, setBoard) => {
		const { destination, source, draggableId } = result;
		if (!destination) return;

		const startColumn = board[source.droppableId];
		const finishColumn = board[destination.droppableId];

		if (startColumn === finishColumn) {
			const newItems = Array.from(startColumn.items);
			const [removed] = newItems.splice(source.index, 1);
			newItems.splice(destination.index, 0, removed);

			const newColumn = {
				...startColumn,
				items: newItems,
			};

			const newBoard = {
				...board,
				[source.droppableId]: newColumn,
			};

			setBoard(newBoard);
		} else {
			const startItems = Array.from(startColumn.items);
			const [removed] = startItems.splice(source.index, 1);
			const finishItems = Array.from(finishColumn.items);
			finishItems.splice(destination.index, 0, removed);

			const newStartColumn = {
				...startColumn,
				items: startItems,
			};
			const newFinishColumn = {
				...finishColumn,
				items: finishItems,
			};

			const newBoard = {
				...board,
				[source.droppableId]: newStartColumn,
				[destination.droppableId]: newFinishColumn,
			};

			setBoard(newBoard);
			// Update the backend with the new column
			await updateTaskColumn(draggableId, destination.droppableId);
		}
	};

	useEffect(() => {
		getTasks();
	}, []);

	return (
		<>
			<SubHeader>
				<Row className="subheader-content" align="middle" justify="space-between">
					<Col xs={24} md={12}>
						<Row gutter={[16, 16]} align="middle">
							{tagsData.map((tag) => (
								<Col key={tag}>
									<Tag.CheckableTag
										checked={selectedTags.includes(tag)}
										onChange={(checked) => handleTagChange(tag, checked)}
									>
										{tag}
									</Tag.CheckableTag>
								</Col>
							))}
						</Row>
					</Col>
					<Col xs={24} md={12}>
						<Row gutter={[16, 16]} align="middle" justify="end">
							<Col xs={24} sm={12} md={10}>
								<Select
									mode="multiple"
									style={{ width: '100%' }}
									placeholder="Select milestones"
									onChange={handleMilestonesChange}
									value={selectedMilestones}
								>
									{milestonesData.map((milestone) => (
										<Option key={milestone} value={milestone}>
											{milestone}
										</Option>
									))}
								</Select>
							</Col>
							<Col xs={24} sm={12} md={14}>
								<Search
									placeholder="Search tasks"
									allowClear
									enterButton="Search"
									onSearch={handleSearch}
									style={{ width: '100%' }}
								/>
							</Col>
						</Row>
					</Col>
				</Row>
			</SubHeader>
			<DragDropContext onDragEnd={(result) => onDragEnd(result, board, setBoard)}>
				<Row gutter={[16, 16]} className="kanban-board">
					{Object.entries(board).map(([columnId, column]) => (
						<KanbanColumn
							key={columnId}
							columnId={columnId}
							column={column}
							editModal={editModal}
							openModal={openModal}
						/>
					))}
				</Row>
			</DragDropContext>

			{(isUpdateEventPopupOpen || isCreateEventPopupOpen) && (
				<AddModal
					onClose={closeModal}
					isCreateEventOpen={isCreateEventPopupOpen}
					isUpdateEventOpen={isUpdateEventPopupOpen}
					handleAddTask={handleAddTask}
					handleEditTask={handleEditTask}
					handleDeleteTask={deleteTask}
					initValues={currentEvent}
				/>
			)}
		</>
	);
};

export default Home;
