import { Avatar, Card, Tooltip } from 'antd';
import { ClockCircleOutlined, EditOutlined, SettingOutlined, EllipsisOutlined } from '@ant-design/icons';
import spirit from '../../../assets/images/ghost.png';

const actions = [
  <EditOutlined key="edit" />,
  <SettingOutlined key="setting" />,
  <EllipsisOutlined key="ellipsis" />,
];

const Task = ({ task, provided, editModal, users }) => {
  const { title, description, priority, deadline, image, alt, tags, milestone, created_by, sharedUsers } = task;

  // Set background color and text color based on created_by
  const isSpirit = created_by === "Spirit";
  const cardBackgroundColor = isSpirit ? "bg-[#7D4EBC]" : "bg-white";
  const textColor = isSpirit ? "text-white" : "text-[#555]";
  const descriptionColor = isSpirit ? "text-white" : "text-gray-500";

  // Limit number of avatars shown
  const maxVisibleContributors = 3;

  // Map over sharedUsers to match ids with the users array
  const contributors = sharedUsers
    ? sharedUsers.map(sharedUserId => users.find(user => user.id === sharedUserId)).filter(Boolean)
    : [];

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={() => editModal(task)}
      className={`w-full cursor-pointer transition-transform transform hover:scale-105 shadow-sm my-4 rounded-xl p-0 ${cardBackgroundColor}`} // Apply dynamic background color
    >

      <div className="p-4">
        {/* Milestone Badge */}
        {milestone && (
          <div
            className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            style={{
              width: '24px',
              height: '24px',
            }}
          >
            {milestone}
          </div>
        )}

        {/* Task Title */}
        <div className="flex items-center justify-between">
          <span className={`text-[18px] line-clamp-1 font-semibold ${textColor}`}>{title}</span>
        </div>

        {/* Task Description */}
        {description && (
          <span className={`block mt-2 text-[12.5px] line-clamp-2 ${descriptionColor}`}>
            {description}
          </span>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag.title}
              className="px-[10px] py-[2px] text-[12px] font-medium rounded-md"
              style={{ backgroundColor: tag.bg, color: tag.text }}
            >
              {tag.title}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-300 my-4"></div>

        {/* Priority, Deadline, and Contributors */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className={`${isSpirit? "text-white": "text-gray-600"}`} />
            <span className={`text-[13px] ${isSpirit? "text-white": "text-gray-600"}`}>
              {deadline} min
            </span>
          </div>

          <div
            className={`w-[60px] h-[5px] rounded-full ${priority === "high"
              ? "bg-red-500"
              : priority === "medium"
                ? "bg-orange-500"
                : "bg-blue-500"
              }`}
          ></div>
        </div>

        {/* Contributors Section */}
        {contributors.length > 0 && (
          <div className="flex items-center mt-3">
            <div className="flex -space-x-2">
              {contributors.slice(0, maxVisibleContributors).map((contributor) => (
                <Tooltip key={contributor.id} title={contributor.name}>
                  <Avatar style={{ backgroundColor: contributor.color }}>
                    {contributor.initialen}
                  </Avatar>
                </Tooltip>
              ))}
              {contributors.length > maxVisibleContributors && (
                <div className="bg-gray-300 text-[13px] text-gray-800 w-[32px] h-[32px] flex items-center justify-center rounded-full">
                  +{contributors.length - maxVisibleContributors}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isSpirit && (
        <div className="absolute top-3 left-3">
          <Avatar src={spirit} size={28} />
        </div>
      )}
    </Card>
  );
};

export default Task;
