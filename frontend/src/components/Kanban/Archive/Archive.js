import React, { useState, useEffect } from 'react';
import { Card, List, Button, Typography, Tag, message } from 'antd';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';

const { Text } = Typography;

const Archive = () => {
    const [archivedTasks, setArchivedTasks] = useState([]);
    const authHeader = useAuthHeader();

    const getArchivedTasks = async () => {
        try {
            const response = await axios.get('/api/kanban/get-archived-tasks', {
                headers: {
                    Authorization: authHeader(),
                },
            });
            setArchivedTasks(response.data);
        } catch (error) {
            console.error('Error fetching archived tasks:', error);
            message.error('Error fetching archived tasks');
        }
    };

    const restoreTask = async (taskId) => {
        try {
            await axios.put(
                `/api/kanban/restore-task/${taskId}`,
                {},
                {
                    headers: {
                        Authorization: authHeader(),
                    },
                }
            );
            message.success('Task restored successfully');
            getArchivedTasks(); // Refresh the archived tasks list
        } catch (error) {
            console.error('Error restoring task:', error);
            message.error('Error restoring task');
        }
    };

    useEffect(() => {
        getArchivedTasks(); // Fetch tasks when the component is mounted
    }, []);

    return (
        <div style={{ padding: '20px' }}>
        <Card>
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={archivedTasks}
                renderItem={(task) => (
                    <List.Item>
                        <Card
                            title={task.title}
                            extra={
                                <Button type="primary" onClick={() => restoreTask(task._id)}>
                                    Restore
                                </Button>
                            }
                        >
                            <Text>{task.description}</Text>
                            <div style={{ marginTop: 10 }}>
                                {task.tags.map((tag) => (
                                    <Tag key={tag.title} color={tag.color}>
                                        {tag.title}
                                    </Tag>
                                ))}
                            </div>
                        </Card>
                    </List.Item> 
                )}
            />
            </Card>
        </div>
    );
};

export default Archive;
