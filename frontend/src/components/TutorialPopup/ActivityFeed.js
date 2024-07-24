import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Card, Tooltip } from 'antd';
import { CalendarTwoTone, CheckCircleTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useAuthHeader } from 'react-auth-kit';
import moment from 'moment'; // Import Moment.js

const ActivityFeed = () => {
  const [activityList, setActivityList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const authHeader = useAuthHeader();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notification/get-notifications', {
          headers: {
            Authorization: authHeader(),
          },
        });
        setActivityList(response.data);
        setFilteredList(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'kanban_added':
        return <CheckCircleTwoTone twoToneColor="#1890ff" />;
      case 'calendar_added':
        return <CalendarTwoTone twoToneColor="#eb2f96" />;
      case 'kanban_deleted':
      case 'calendar_deleted':
        return <DeleteTwoTone twoToneColor="#f5222d" />;
      default:
        return <></>;
    }
  };

  const getTimeAgoString = (timestamp) => {
    const now = moment();
    const postDate = moment.utc(timestamp).local();
    const diffSeconds = now.diff(postDate, 'seconds');
    const diffMinutes = now.diff(postDate, 'minutes');
    const diffHours = now.diff(postDate, 'hours');
    const diffDays = now.diff(postDate, 'days');

    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <Card
      title="Activity Feed"
      bordered={false}
      style={{ height: '250px', overflow: 'hidden' }}
      bodyStyle={{ height: 'calc(100% - 40px)', overflowY: 'auto', padding: '0' }}
    >
      <List
        itemLayout="horizontal"
        dataSource={filteredList}
        renderItem={(activity) => (
          <List.Item style={{ paddingLeft: '25px' }}>
            <List.Item.Meta
              avatar={getActivityIcon(activity.type)}
              title={
                <div>
                  {activity.title}
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                    {getTimeAgoString(activity.timestamp)}
                  </div>
                </div>
              }
              description={activity.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ActivityFeed;
