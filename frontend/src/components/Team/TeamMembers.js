// Team.js
import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag } from 'antd';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';

const columns = [
  {
    title: 'Profilbild',
    dataIndex: 'avatarColor',
    key: 'avatarColor',
    render: (color, record) => (
      <Avatar style={{ backgroundColor: color }}>
        {record.username[0]}
      </Avatar>
    ),
  },
  {
    title: 'Name',
    dataIndex: 'username',
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
  const authHeader = useAuthHeader();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/get-team-members',
          {
            headers: {
              "Authorization": authHeader()
            }
          });
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };
    fetchTeamMembers();
  }, []);

  return (
    <Table
      style={{ margin: "20px" }}
      dataSource={teamMembers}
      columns={columns}
      rowKey="_id"
      pagination={false}
    />
  );
};

export default TeamMembers;
