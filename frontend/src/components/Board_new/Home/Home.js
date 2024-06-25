import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Input, Tag, Badge, Typography, Select } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import axios from "axios";
import { useAuthHeader } from 'react-auth-kit';
import { v4 as uuidv4 } from "uuid";

import AddModal from "../Modals/AddModal";
import Task from "../Task";
import { SubHeader } from '../../layout/SubHeader';
import { onDragEnd } from "../helpers/onDragEnd";

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

const tagsData = ['Planning', 'UI', 'Organization', 'Hi-Fi', 'Lo-Fi', 'UX', 'Architecture', 'UX Writing'];
const milestonesData = ['Milestone 1', 'Milestone 2', 'Milestone 3'];

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
							<Text style={{textTransform:"uppercase"}}>{column.name}</Text>
							<Badge count={column.items.length} style={{ backgroundColor: 'grey', marginLeft: '10px' }} />
						</div>
						<Button type="text" icon={<PlusOutlined />} onClick={() => openModal(columnId)} />
					</div>
					{column.items.map((task, index) => (
						<Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
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
	const [selectedMilestone, setSelectedMilestone] = useState("");
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredTasks, setFilteredTasks] = useState([]);

	const authHeader = useAuthHeader();

	const handleTagChange = (tag, checked) => {
		const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter((t) => t !== tag);
		setSelectedTags(nextSelectedTags);
	};

	const handleMilestoneChange = (milestone) => {
		setSelectedMilestone(milestone);
		updateFilteredTasks(tasks, searchTerm, selectedTags, milestone);
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

	const handleAddTask = (taskData) => {
		const newBoard = { ...board };
		newBoard[selectedColumn].items.push(taskData);
		setBoard(newBoard);
	};

	const handleEditTask = (taskData) => {
		const newBoard = { ...board };
		setIsUpdateEventPopupOpen(false);
		setCurrentEvent(null);
		for (let column in newBoard) {
			const index = newBoard[column].items.findIndex(task => task.id === taskData.id);
			if (index !== -1) {
				newBoard[column].items[index] = taskData;
			}
		}
		setBoard(newBoard);
	};

	const deleteTask = (id) => {
		const newBoard = { ...board };
		setIsUpdateEventPopupOpen(false);
		setCurrentEvent(null);
		for (let column in newBoard) {
			const index = newBoard[column].items.findIndex(task => task.id === id);
			if (index !== -1) {
				newBoard[column].items.splice(index, 1);
			}
		}
		setBoard(newBoard);
	};

	const handleSearch = (input) => {
		setSearchTerm(input);
		updateFilteredTasks(tasks, input, selectedTags, selectedMilestone);
	};

	const clearFilter = () => {
		setSelectedTags([]);
		setSelectedMilestone("");
		setSearchTerm('');
		updateFilteredTasks(tasks, '', [], '');
	};

	const getTasks = async () => {
		try {
			const response = await axios.get('http://localhost:8000/api/kanban/get-tasks', {
				headers: {
					"Authorization": authHeader()
				}
			});
			setTasks(response.data);
			updateFilteredTasks(response.data, '', [], '');
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const createBoard = (filteredTasks) => {
		const board = new Board();
		filteredTasks.forEach(task => {
			if (!board[task.column]) {
				throw new Error(`Unknown board column ${task.column}`);
			}
			board[task.column].items.push(task);
		});
		return board;
	};

	const updateFilteredTasks = (tasks, search, tags, milestone) => {
		let filteredTasks = tasks;

		// Filter by search term
		if (search) {
			filteredTasks = filteredTasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));
		}

		// Filter by tags
		if (tags.length > 0) {
			filteredTasks = filteredTasks.filter((task) => tags.every(tag => task.tags.includes(tag)));
		}

		// Filter by milestone
		if (milestone) {
			filteredTasks = filteredTasks.filter((task) => task.milestone === milestone);
		}

		setFilteredTasks(filteredTasks);
		const updatedBoard = createBoard(filteredTasks);
		setBoard(updatedBoard);
	};

	useEffect(() => {
		getTasks();
	}, []);

	return (
		<>
			<SubHeader>
				<Row className="subheader-content" align="middle">
					<Col>
						<Row gutter={[16, 16]} align="middle">
							<Col>
								{tagsData.map((tag) => (
									<Tag.CheckableTag
										key={tag}
										checked={selectedTags.includes(tag)}
										onChange={(checked) => handleTagChange(tag, checked)}
									>
										{tag}
									</Tag.CheckableTag>
								))}
							</Col>
							<Col>
								<Select
									style={{ width: 200 }}
									placeholder="Select milestone"
									onChange={handleMilestoneChange}
									value={selectedMilestone}
								>
									{milestonesData.map((milestone) => (
										<Option key={milestone} value={milestone}>
											{milestone}
										</Option>
									))}
								</Select>
							</Col>
							<Col>
								<Search placeholder="Search cards" onSearch={handleSearch} style={{ width: 200 }} />
							</Col>
							<Col>
								<Button onClick={clearFilter}>Clear Filter</Button>
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
