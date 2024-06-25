
import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag } from 'antd';
import axios from 'axios';

const columns = [
  {
    title: 'Profilbild',
    dataIndex: 'avatar',
    key: 'avatar',
    render: (avatarUrl) => <Avatar src={avatarUrl} />,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Rolle',
    dataIndex: 'role',
    key: 'role',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status ? 'green' : 'red'}>{status ? 'Online' : 'Offline'}</Tag>
    ),
  },
];

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://your-fastapi-backend/api/team-members');
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <Table
    style={{margin:"20px"}}
      dataSource={teamMembers}
      columns={columns}
      rowKey="_id"
      pagination={false}
    />
  );
};

export default TeamMembers;