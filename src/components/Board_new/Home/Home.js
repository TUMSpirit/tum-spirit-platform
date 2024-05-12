/* eslint-disable @typescript-eslint/no-explicit-any */
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import { Board } from "../data/board";
import { Columns } from "../types";
import { onDragEnd } from "../helpers/onDragEnd";
import { UserAddOutlined } from '@ant-design/icons';
import AddModal from "../Modals/AddModal";
import Task from "../Task";
import {Row, Col, Button} from "antd";
import {SubHeader} from '../../layout/SubHeader'

const Home = () => {
	const [columns, setColumns] = useState(Board);
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedColumn, setSelectedColumn] = useState("");
	const [initValues, setInitValues] = useState({
		title: "",
		description: "",
		priority: "",
		deadline: 0,
		image: "",
		alt: "",
		tags: [],
	});


	const openModal = (columnId) => {
		setSelectedColumn(columnId);
		/*setInitValues({
			title: columnId.title,
			description: columnId.description,
			priority: "",
			deadline: 0,
			image: "",
			alt: "",
			tags: [],
		});*/
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const handleAddTask = (taskData) => {
		const newBoard = { ...columns };
		newBoard[selectedColumn].items.push(taskData);
	};

	return (
		<>
			<DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
				<div className="w-full flex items-start justify-between px-5 pb-8 md:gap-0 gap-10">
					{Object.entries(columns).map(([columnId, column]) => (
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
										className="flex flex-col gap-3 items-center py-5"
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
															editModal={openModal}
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

			<AddModal
				isOpen={modalOpen}
				onClose={closeModal}
				setOpen={setModalOpen}
				handleAddTask={handleAddTask}
				initValues={initValues}
			/>
		</>
	);
};
export default Home;
/*		<SubHeader><Button onClick={() => openModal()}>Test</Button></SubHeader>*/