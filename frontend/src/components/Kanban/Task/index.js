import React from 'react';
import { Avatar, Card, Tooltip, Progress, Badge } from 'antd';
import { ClockCircleOutlined, EditOutlined, SettingOutlined, EllipsisOutlined } from '@ant-design/icons';
import spirit from '../../../assets/images/ghost.png';

const actions = [
  <EditOutlined key="edit" />,
  <SettingOutlined key="setting" />,
  <EllipsisOutlined key="ellipsis" />,
];

const Task = ({ task, provided, editModal, users }) => {
  const { title, description, priority, deadline, tags, milestone, created_by, sharedUsers } = task;

  // Set background color and text color based on created_by
  const isSpirit = created_by === "Spirit";
  const cardBackgroundColor = isSpirit ? "bg-[#7D4EBC]" : "bg-white";
  const textColor = isSpirit ? "text-white" : "text-[#333]";
  const descriptionTextColor = isSpirit ? "text-sm-white" : "text-sm";

  // Parse JSON data for todos and calculate progress
  const descriptionData = description ? JSON.parse(description) : null;
  const checklistItems = descriptionData?.blocks
    ?.filter(block => block.type === 'checklist')
    ?.flatMap(block => block.data.items) || [];
  const totalTodos = checklistItems.length;
  const completedTodos = checklistItems.filter(item => item.checked).length;
  const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // Extract truncated description
  const truncatedDescription = descriptionData?.blocks
    ?.find(block => block.type === 'paragraph')?.data?.text?.slice(0, 50) || ''; // Truncate at 50 characters

  // Limit number of avatars shown
  const maxVisibleContributors = 3;
  const contributors = sharedUsers
    ? sharedUsers.map(sharedUserId => users.find(user => user.id === sharedUserId)).filter(Boolean)
    : [];

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={() => editModal(task)}
      className={`w-full cursor-pointer transition-transform transform hover:scale-105 shadow-sm my-4 rounded-xl p-0 ${cardBackgroundColor}`}
    >
      <div className="flex flex-col space-y-2 p-1 py-2">

        {/* Milestone Badge */}
        {milestone && (
          <div
            className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#108ee9',
              color: '#fff',
              position: 'absolute',
              top: 10,
              right: 10,
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {milestone}
          </div>
        )}

        {/* Task Title */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xl font-bold ${textColor}`}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 'calc(100% - 32px)', // Adjusted to avoid overlapping with the icons on the right
            }}
          >
            {title}
          </span>
        </div>

        {/* Truncated Description */}
        {truncatedDescription && (
          <p className={`mt-1 ${descriptionTextColor}`}>
            {truncatedDescription}...
          </p>
        )}

        {/* Todos Progress */}
        {totalTodos > 0 && (
          <Progress
            percent={progress}
            size="small"
            format={() => <span className={`${isSpirit ? 'spirit-progress-text' : ''}`}>{completedTodos}/{totalTodos}</span>}
            status="active"
            strokeColor={isSpirit ? '#fff' : '#1890ff'}
            className={`mt-3`}
          />
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag.title}
              className="px-2 py-1 text-xs font-medium rounded-md"
              style={{ backgroundColor: tag.bg, color: tag.text }}
            >
              {tag.title}
            </span>
          ))}
        </div>

        {/* Priority and Deadline */}
        <div className="flex justify-between items-center">
          <div className="flex content-center	items-center space-x-1 mt-1">
            <ClockCircleOutlined className={isSpirit ? "text-white mb-0.5" : "inherit mb-0.5"} />
            <span className={`${isSpirit ? "text-sm-white" : "inherit"}`}>
              {deadline} min
            </span>
          </div>
          <Badge
            color={priority === "high" ? "red" : priority === "medium" ? "orange" : "blue"}
            text={<span style={{ color: isSpirit ? '#fff' : 'inherit' }}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>}
            className="font-semibold"
          />
        </div>

        {/* Contributors Section */}
        {contributors.length > 0 && (
          <div className="flex items-center mt-4">
            <div className="flex -space-x-2">
              {contributors.slice(0, maxVisibleContributors).map((contributor) => (
                <Tooltip key={contributor.id} title={contributor.name}>
                  <Avatar style={{ backgroundColor: contributor.color, borderColor: '#fff', borderWidth: 2 }}>
                    {contributor.initialen}
                  </Avatar>
                </Tooltip>
              ))}
              {contributors.length > maxVisibleContributors && (
                <div className="bg-gray-300 text-xs text-gray-800 w-8 h-8 flex items-center justify-center rounded-full">
                  +{contributors.length - maxVisibleContributors}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spirit Icon */}
      {isSpirit && (
        <div className="absolute top-3 left-3">
          <Avatar src={spirit} size={26} />
        </div>
      )}
    </Card>
  );
};

export default Task;
