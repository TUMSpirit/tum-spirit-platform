// Team.js
import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag } from 'antd';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { useSocket } from '../../context/SocketProvider'; // Adjust the import path accordingly

const columns = [
  {
    title: 'Profilbild',
    dataIndex: 'avatarColor',
    key: 'avatarColor',
    render: (color, record) => (
      <Avatar style={{ backgroundColor: record.avatar_color }}>
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
      <Tag color={status === 'online' ? 'green' : 'red'}>{status === 'online' ? 'Online' : 'Offline'}</Tag>
    ),
  },
];

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const { onlineStatus } = useSocket(); // Use the socket context to get the onlineStatus
  const authHeader = useAuthHeader();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get('/api/get-team-members', {
          headers: {
            "Authorization": authHeader()
          }
        });

        // Add static member 'Spirit' to the team members
        const updatedTeamMembers = [
          ...response.data,
          {
            _id: 'spirit-id', // Ensure this ID is unique
            username: 'Spirit',
            role: 'AI',
            status: 'online', // Default status for Spirit
            avatar_color: '#f56a00', // Default color for Spirit's avatar
          },
        ];

        // Merge online status with team members data
        const teamMembersWithStatus = updatedTeamMembers.map(member => {
          // Always set Spirit to online
          if (member.username === 'Spirit') {
            return {
              ...member,
              status: 'online',
            };
          }

          return {
            ...member,
            status: onlineStatus[member.username] || 'offline'
          };
        });

        setTeamMembers(teamMembersWithStatus);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []); // Re-run the effect if onlineStatus changes

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
