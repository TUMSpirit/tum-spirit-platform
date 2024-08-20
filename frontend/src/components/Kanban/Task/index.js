import { Card, Avatar } from 'antd';
import { ClockCircleOutlined, EditOutlined, SettingOutlined, EllipsisOutlined } from '@ant-design/icons';
const actions = [
  <EditOutlined key="edit" />,
  <SettingOutlined key="setting" />,
  <EllipsisOutlined key="ellipsis" />,
];

const Task = ({ task, provided, editModal }) => {
	const { title, description, priority, deadline, image, alt, tags, milestone } = task;

	return (
		<Card
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			onClick={() => editModal(task)}
			className="w-full cursor-pointer bg-white shadow-sm my-4 rounded-xl p-0"
			//actions={actions}  // Matching the padding from your original div
		>
			{/* Task Image */}
			{image && alt && (
				<img
					src={image}
					alt={alt}
					className="w-full h-auto max-h-[170px] object-cover rounded-lg"
				/>
			)}

			{/* Milestone Badge */}
			{milestone && (
				<div
					className="top-3 right-3 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
					style={{
						width: '24px',
						height: '24px',
					}}
				>
					{milestone}
				</div>
			)}

			{/* Tags */}
			<div className="flex flex-wrap gap-2 mt-3">
				{tags.map((tag) => (
					<span
						key={tag.title}
						className="px-[10px] py-[2px] text-[15px] font-medium rounded-md"
						style={{ backgroundColor: tag.bg, color: tag.text }}
					>
						{tag.title}
					</span>
				))}
			</div>

			{/* Task Title and Description */}
			<div className="w-full flex flex-col gap-1 mt-3">
				<span className="text-[15.5px] font-medium text-[#555]">{title}</span>
				{description && (
					<span className="text-[13.5px] text-gray-500 line-clamp-3">
						{description}
					</span>
				)}
			</div>

			{/* Divider */}
			<div className="w-full border border-dashed my-3"></div>

			{/* Priority and Deadline */}
			<div className="w-full flex items-center justify-between">
				<div className="flex items-center gap-1">
					<ClockCircleOutlined color={"#666"} width="19px" height="19px" />
					<span className="text-[13px] text-gray-700">{deadline} mins</span>
				</div>
				<div
					className={`w-[60px] rounded-full h-[5px] ${priority === "high"
						? "bg-red-500"
						: priority === "medium"
							? "bg-orange-500"
							: "bg-blue-500"
						}`}
				></div>
			</div>
		</Card>
	);
};

export default Task;
