import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import React, { useState, useEffect } from "react";
import { Board } from "../data/board";
import { Columns } from "../types";
import { onDragEnd } from "../helpers/onDragEnd";
import { ConsoleSqlOutlined, UserAddOutlined } from '@ant-design/icons';
import AddModal from "../Modals/AddModal";
import Task from "../Task";
import { Row, Col, Button, Input, Flex, Tag } from "antd";
import { SubHeader } from '../../layout/SubHeader'
import { v4 as uuidv4 } from "uuid";
import AddEventPopup from "../../calendar_component/calendar_additional_components/AddEventPopup";
import axios from "axios";
import { useAuthHeader } from 'react-auth-kit';


class Boardss {
	constructor() {
		this.backlog = { name: "backlog", items: [] };
		this.doing = { name: "doing", items: [] };
		this.testing = { name: "testing", items: [] };
		this.done = { name: "done", items: [] };
	};
}


const tagsData = ['Movies', 'Books', 'Music', 'Sports'];

const Home = () => {
	const [tasks, setTasks] = useState([]);
	const [board, setBoard] = useState(new Boardss());
	const [selectedColumn, setSelectedColumn] = useState("");


	const { Search } = Input;
	const [tags, setTags] = useState([]);
	const [selectedTags, setselectedTags] = useState(['Movies']);
	const [searchTerm, setSearchTerm] = useState('');
	const authHeader = useAuthHeader();


	const [isCreateEventPopupOpen, setIsCreateEventPopupOpen] = useState(false)
	const [isUpdateEventPopupOpen, setIsUpdateEventPopupOpen] = useState(false)
	const [currentEvent, setCurrentEvent] = useState(null)


	const handleTagChange = (tag, checked) => {
	  const nextSelectedTags = checked
		? [...selectedTags, tag]
		: selectedTags.filter((t) => t !== tag);
	  console.log('You are interested in: ', nextSelectedTags);
	  setselectedTags(nextSelectedTags);
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
	};

	const handleEditTask = (taskData) => {
		const newBoard = { ...board };
		setIsUpdateEventPopupOpen(false);
		setCurrentEvent(null);
		for (let newBoardKey in newBoard) {
			const index = newBoard[newBoardKey].items.findIndex(task => task.id === taskData.id);
			// Wenn das Objekt gefunden wurde, ersetze es durch das neue Objekt
			if (index !== -1) {
				newBoard[newBoardKey].items[index] = taskData;
			}
		}
	};

	const deleteTask = (id) => {
		const newBoard = { ...board };
		setIsUpdateEventPopupOpen(false);
		setCurrentEvent(null);
		for (let newBoardKey in newBoard) {
			const index = newBoard[newBoardKey].items.findIndex(task => task.id === id);
			// Wenn das Objekt gefunden wurde, ersetze es durch das neue Objekt
			if (index !== -1) {
				newBoard[newBoardKey].items.splice(index, 1);
			}
		}
	};

	const handleSearch = (input) => {
		setSearchTerm(input);
		updateBoard(tasks, input);
	};

	/*const handleTagChange = (tag, checked) => {
		const nextSelectedKeywords = checked
			? [...selectedKeywords, tag]
			: selectedKeywords.filter(t => t !== tag);
		setSelectedKeywords(nextSelectedKeywords);
	};*/

	/*TODO*/
	const clearFilter = (input) => {
		setSearchTerm(input);
		updateBoard(tasks, input);
	};

	const getTasks = async () => {
		try {
			const teamId = 'desired_team_id'; // Ersetze durch den tatsächlichen team_id-Wert
			const response = await axios.get('http://localhost:8000/api/kanban/get-tasks',
				{
					headers: {
						"Authorization": authHeader()
					}
				});
			updateBoard(response.data, '');
			setTasks(response.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const createBoard = (filteredTasks) => {
		const board = new Boardss();
		filteredTasks.forEach(task => {
			if (!board[task.column]) {
				throw new Error(`Unknown board column ${task.column}`)
			}
			board[task.column].items.push(task);
		});
		return board;
	};

	const updateBoard = (tasks, search) => {
		let filteredTasks = tasks;
		if (search) {
			filteredTasks = tasks.filter((task) =>
				task.title.toLowerCase().includes(search.toLowerCase()));
		}
		const Board = createBoard(filteredTasks);
		setBoard(Board);
	};
	useEffect(() => {
		getTasks();
	}, []);

	/*(async () => {
		 const response = await getBoard();
		 setTasks(response);
		 updateBoard(tasks); 
		 setColumns(Board);
		})*/



	const onSearch = (value, _e, info) => console.log(info?.source, value);

	return (
		<>
			<SubHeader>
				<Row className="flex items-end space-x-4" justify="end" style={{ marginBottom: 20 }}>
					<Col justify="end">
						<div style={{ marginBottom: 20 }}>
						<Flex gap={4} wrap align="center">
							<span>Categories:</span>
							{tagsData.map((tag) => (
								<Tag.CheckableTag
									key={tag}
									checked={selectedTags.includes(tag)}
									onChange={(checked) => handleTagChange(tag, checked)}
								>
									{tag}
								</Tag.CheckableTag>
							))}
								</Flex>
						</div>
					</Col>
					<Col>
						<Search
							placeholder="Search cards"
							onSearch={handleSearch}
							style={{ width: 200, marginLeft: 20 }}
						/>
					</Col>
				</Row>
			</SubHeader>
			<DragDropContext onDragEnd={(result) => onDragEnd(result, board, setBoard)}>
				<div className="w-full flex items-start justify-between px-5 pb-8 md:gap-0 gap-10">
					{Object.entries(board).map(([columnId, column]) => (
						<div
							className="w-full flex flex-col gap-0 px-2 items-center"
							key={columnId}
						>
							<Droppable
								droppableId={columnId}
								key={columnId}
							>
								{(provided) => (
									<div
										ref={provided.innerRef}
										{...provided.droppableProps}
										className="flex  min-w-full flex-col gap-3 items-center py-5"
									>
										<div className="flex items-center justify-center py-[10px] w-full bg-white rounded-lg shadow-sm text-[#555] font-medium text-[17px]">
											{column.name}
										</div>
										{column.items.map((task, index) => (
											<Draggable
												key={task.id.toString()}
												draggableId={task.id.toString()}
												index={index}
											>
												{(provided) => (
													<>
														<Task
															provided={provided}
															task={task}
															editModal={editModal}
														/>
													</>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
							<div
								onClick={() => openModal(columnId)}
								className="flex cursor-pointer items-center justify-center gap-1 py-[10px] md:w-[90%] w-full opacity-90 bg-white rounded-lg shadow-sm text-[#555] font-medium text-[17px]"
							>
								<UserAddOutlined color={"#555"} />
								Add Task
							</div>
						</div>
					))}
				</div>
			</DragDropContext>

			{(isUpdateEventPopupOpen || isCreateEventPopupOpen) && <AddModal
				onClose={closeModal}
				isCreateEventOpen={isCreateEventPopupOpen}
				isUpdateEventOpen={isUpdateEventPopupOpen}
				handleAddTask={handleAddTask}
				handleEditTask={handleEditTask}
				handleDeleteTask={deleteTask}
				initValues={currentEvent}
			/>}
		</>
	);
};
export default Home;
/*		<SubHeader><Button onClick={() => openModal()}>Test</Button></SubHeader>*/