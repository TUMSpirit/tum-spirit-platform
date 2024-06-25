import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Avatar, Card } from 'antd';
import { TrophyTwoTone, ShoppingCartOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { useAuthHeader } from 'react-auth-kit';

const ActivityFeed = ({ activities }) => {
  const [activityList, setActivityList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const authHeader= useAuthHeader();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/notification/get-notifications',
          {
            headers: {
              "Authorization": authHeader()
            }
          });
        setActivityList(response.data);
        setFilteredList(response.data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <Card
      bordered={false}
      style={{ height: '250px', overflowY: 'auto' }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <h3>Activity Feed</h3>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={activityList}
        renderItem={activity => (
          <List.Item>
            <List.Item.Meta
              avatar={
                activity.title === 'tutorial' ? (
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                ) : (
                  <ShoppingCartOutlined />
                )
              }
              title={activity.title}
              description={activity.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ActivityFeed;
