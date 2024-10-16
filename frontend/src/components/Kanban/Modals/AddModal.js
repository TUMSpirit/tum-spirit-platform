import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Comment } from '@ant-design/compatible';
import { Avatar, Space, Button, Modal, Form, Input, message, Select, Tag, Slider, List } from "antd";
import { DeleteOutlined, FolderAddOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuthHeader } from "react-auth-kit";
import moment from "moment";


const { Option } = Select;
const { TextArea } = Input;

const predefinedTags = [
    { title: 'Organization', bg: '#f50', text: '#fff' },
    { title: 'Design', bg: '#2db7f5', text: '#fff' },
    { title: 'Prototyping', bg: '#87d068', text: '#fff' },
    { title: 'Development', bg: '#108ee9', text: '#fff' },
    { title: 'Testing', bg: '#531dab', text: '#fff' }
];


const AddModal = ({ onClose, isCreateEventOpen, isUpdateEventOpen, handleAddTask, handleEditTask, handleDeleteTask, handleArchiveTask, initValues, users, currentUser, milestonesData }) => {
    const initialTaskData = {
        id: isUpdateEventOpen ? initValues._id : "",
        title: isUpdateEventOpen ? initValues.title : "",
        column: isUpdateEventOpen ? initValues.column : "",
        description: isUpdateEventOpen ? initValues.description : "",
        priority: isUpdateEventOpen ? initValues.priority : "",
        deadline: isUpdateEventOpen ? initValues.deadline : 180,
        tags: isUpdateEventOpen ? initValues.tags : [],
        milestone: isUpdateEventOpen ? initValues.milestone : "",
        sharedUsers: isUpdateEventOpen ? users.filter(user => initValues.sharedUsers.includes(user.id)) : []
    };

    const [taskData, setTaskData] = useState(initialTaskData);
    const [comments, setComments] = useState([]); // State to hold comments
    const [commentText, setCommentText] = useState(""); // For adding new comments
    const [editCommentText, setEditCommentText] = useState(""); // State for the input field
    const [editingComment, setEditingComment] = useState(null); // State to track which comment is being edited
    const [form] = Form.useForm();
    const authHeader = useAuthHeader(); // For auth header

    const formRef = useRef(null);

    useEffect(() => {
        if (initValues && isUpdateEventOpen) {
            form.setFieldsValue(initValues);
            fetchComments(initValues._id);
        }
    }, [initValues, form, isUpdateEventOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData({ ...taskData, [name]: value });
    };

    const closeModal = () => {
        form.resetFields();
        onClose();
    };

    const fetchComments = async (taskId) => {
        try {
            const response = await axios.get(`api/kanban/${taskId}/comments`, {
                headers: { Authorization: authHeader() },
            });
            setComments(response.data);
        } catch (error) {
            message.error("Failed to load comments.");
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        const newComment = {
            content: commentText,
            avatar_color: currentUser.color, // Send avatar_color from currentUser
        };

        try {
            await axios.post(`api/kanban/${taskData.id}/comments`, newComment, {
                headers: { Authorization: authHeader() },
            });
            // Refetch comments after adding a new one
            fetchComments(taskData.id);
            setCommentText("");
            //commentListRef.current.scrollTop = 0;
        } catch (error) {
            message.error("Failed to add comment.");
        }
    };

    const handleDeleteComment = (commentId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this comment?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await axios.delete(`api/kanban/comments/${commentId}`, {
                        headers: { Authorization: authHeader() },
                    });
                    message.success("Comment deleted successfully.");
                    fetchComments(taskData.id); // Refetch comments after deletion
                } catch (error) {
                    message.error("Failed to delete comment.");
                }
            },
        });
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setEditCommentText(comment.content); // Set the content of the comment being edited in the edit textarea
    };

    const saveEditedComment = async () => {
        if (!editingComment) return;

        try {
            await axios.put(`api/kanban/comments/${editingComment._id}`, { content: editCommentText }, {
                headers: { Authorization: authHeader() },
            });
            message.success("Comment updated successfully.");
            fetchComments(taskData.id); // Refetch comments after saving
            setEditingComment(null); // Exit editing mode
            setEditCommentText(""); // Clear the edit text
        } catch (error) {
            message.error("Failed to update comment.");
        }
    };

    const cancelEdit = () => {
        setEditingComment(null);
        setEditCommentText(""); // Clear the edit textarea when canceling
    };

    const handleSubmit = () => {
        const taskDataFormatted = {
            id: taskData.id,
            title: taskData.title,
            column: taskData.column,
            description: taskData.description,
            priority: taskData.priority,
            deadline: taskData.deadline,
            tags: taskData.tags,
            milestone: taskData.milestone,
            sharedUsers: taskData.sharedUsers.map(user => user.id)
        };
        if (isUpdateEventOpen) {
            handleEditTask(taskDataFormatted);
        } else {
            handleAddTask(taskDataFormatted);
        }
        form.resetFields();
        closeModal();
    };

    const onChangeParticipants = (selectedUserIds) => {
        setTaskData((prevFormData) => ({
            ...prevFormData, sharedUsers: users.filter(user => selectedUserIds.includes(user.id))
        }));


        console.log('shared:', taskData.sharedUsers)
    }

    const confirmDelete = () => {
        Modal.confirm({
            title: 'Are you sure you want to delete this task?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                handleDeleteTask(taskData.id);
                form.resetFields();
                setTaskData(initialTaskData); // Reset task data to initial state
                closeModal();
            },
        });
    };

    const confirmArchive = () => {
        Modal.confirm({
            title: 'Are you sure you want to archive this task?',
            content: 'You can restore this task from the archive later.',
            okText: 'Yes',
            cancelText: 'No',
            onOk: () => {
                handleArchiveTask(taskData.id);
                form.resetFields();
                setTaskData(initialTaskData); // Reset task data to initial state
                closeModal();
            },
        });
    };

    const getInitialFormValues = () => {
        return {
            title: taskData.title,
            column: taskData.column,
            description: taskData.description,
            priority: taskData.priority,
            deadline: taskData.deadline,
            tags: taskData.tags,
            milestone: taskData.milestone,
            sharedUsers: taskData.sharedUsers.map(user => user.id),
        };
    };

    return (
        <Modal
            closeIcon={false}
            title={"Task"}
            open={isCreateEventOpen || isUpdateEventOpen}
            className={"modal-addEvent"}
            footer={[/*         isUpdateEventOpen && (
                <Button
                    data-testid='deleteEventButton'
                    onClick={confirmDelete}
                    type='primary'
                    icon={<DeleteOutlined />}
                >
                    Delete
                </Button>
            ),*/
                isUpdateEventOpen && (
                    <Button
                        data-testid='archiveEventButton'
                        onClick={confirmArchive}
                        type='primary'
                        icon={<FolderAddOutlined />}
                    >
                        Archive
                    </Button>
                ),
                <Button onClick={closeModal}>Cancel</Button>,
                <Button data-testid='saveEventButton' key="submit" type='primary' onClick={form.submit}>Save</Button>
            ]}
        >
            <Form layout={'vertical'} onFinish={handleSubmit} requiredMark={false} form={form} ref={formRef} initialValues={getInitialFormValues()}>
                <Form.Item label={"Title"} name="title" rules={[{ required: true, message: 'Please set a title' }]}>
                    <Input
                        type="text"
                        name="title"
                        onChange={handleChange}
                        placeholder="Title"
                    />
                </Form.Item>
                <Form.Item label={"Description"} name="description">
                    <TextArea
                        name="description"
                        onChange={handleChange}
                        placeholder="Description"
                        rows={4}
                    />
                </Form.Item>
                <Form.Item label={"Priority"} name="priority">
                    <Select
                        name="priority"
                        onChange={value => setTaskData({ ...taskData, priority: value })}
                        placeholder="Priority"
                    >
                        <Option value="">Priority</Option>
                        <Option value="low">Low</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="high">High</Option>
                    </Select>
                </Form.Item>
                <Form.Item label={"Estimated Time (Minutes)"} name="deadline">
                    <Slider
                        min={0}
                        max={800}
                        step={1}
                        value={taskData.deadline}
                        onChange={value => setTaskData({ ...taskData, deadline: value })}
                        marks={{ 0: '0', 800: '800' }}

                    />
                </Form.Item>
                <Form.Item name="milestone" label="Milestone">
                    <Select
                        style={{ width: '100%' }}
                        value={taskData.milestone}
                        onChange={value => setTaskData({ ...taskData, milestone: value })}
                    >
                        {milestonesData.map(milestone => (
                            <Option key={milestone} value={milestone}>
                                {milestone}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label={"Tags"} name="tags">
                    <Select
                        mode="multiple"
                        placeholder="Select tags"
                        value={taskData.tags.map(tag => tag.title)}
                        onChange={(values) => {
                            if (values.length > 2) {
                                message.error('You can only select up to 2 tags.');
                                return;
                            }
                            const selectedTags = predefinedTags.filter(tag => values.includes(tag.title));
                            setTaskData({ ...taskData, tags: selectedTags });
                        }}
                        style={{ width: '100%' }}
                    >
                        {predefinedTags.map((tag) => (
                            <Option key={tag.title} value={tag.title}>
                                <Tag color={tag.bg} style={{ color: tag.text }}>
                                    {tag.title}
                                </Tag>
                            </Option>
                        ))}
                    </Select>
                    <div className="w-full mt-2">
                        {taskData.tags.map((tag, index) => (
                            <Tag
                                key={index}
                                color={tag.bg}
                                style={{ color: tag.text }}
                            >
                                {tag.title}
                            </Tag>
                        ))}
                    </div>
                </Form.Item>
                <Form.Item name={'sharedUsers'} label="Contributors" style={{ marginBottom: '8px' }}>
                    <Select fieldNames={{ label: 'name', value: 'id' }}
                        placeholder="Add Contributors" mode="tags" allowClear={true} options={users}
                        onChange={onChangeParticipants} style={{ width: 200 }} />
                </Form.Item>
                <AvatarDisplay selectedUsers={taskData.sharedUsers}></AvatarDisplay>
                {/* Comments section */}
                {(isUpdateEventOpen && <div className="comments-section">
                    <h3>Comments</h3>
                    <List
                        style={{
                            maxHeight: '300px', overflowY: 'scroll', boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.7)', // Modern inset shadow
                        }}
                        className="comment-list"
                        itemLayout="horizontal"
                        dataSource={comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))} // Sort by newest first
                        renderItem={(comment) => (
                            <Comment
                                author={comment.username}
                                avatar={
                                    <Avatar style={{ backgroundColor: comment.avatar_color }}>
                                        {comment.username[0]}
                                    </Avatar>
                                }
                                content={
                                    editingComment && editingComment._id === comment._id ? (
                                        <>
                                            <TextArea
                                                rows={2}
                                                value={editCommentText} // Use editCommentText for the editing textarea
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                            />
                                            <Space style={{ marginTop: '4px' }}>
                                                <Button
                                                    type="primary"
                                                    onClick={saveEditedComment}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </Button>
                                            </Space>
                                        </>
                                    ) : (
                                        <p>{comment.content}</p>
                                    )
                                }
                                datetime={
                                    <small>{moment.utc(comment.timestamp).fromNow()}</small>
                                }
                                actions={[
                                    comment.user_id === currentUser.id && ( // Show delete and edit text options only for the logged-in user
                                        <div>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditComment(comment)}
                                                style={{ float: 'right', marginRight: 8 }} />
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteComment(comment._id)} // Pass comment id
                                                danger
                                                style={{ float: 'right' }} />
                                        </div>
                                    ),
                                ]}
                            />
                        )}
                    />

                    {/* Add new comment */}
                    <Form.Item>
                        <TextArea
                            style={{ marginTop: '10px' }}
                            rows={4}
                            value={commentText} // Add comment text is separate
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            disabled={!!editingComment} // Disable if editing mode is active
                        />
                    </Form.Item>
                    <Button
                        onClick={handleAddComment}
                        style={{ marginTop: '-4px', marginBottom: '16px' }}
                        disabled={!!editingComment} // Disable if editing mode is active
                    >
                        Add Comment
                    </Button>
                </div>
                )}
            </Form>
        </Modal >
    );
};

export default AddModal;

const AvatarDisplay = ({ selectedUsers }) => {
    return (<Avatar.Group>
        {selectedUsers.map(user => (<Avatar key={user.id} style={{ backgroundColor: user.color, color: 'white' }}>
            {user.initialen}
        </Avatar>))}
    </Avatar.Group>);
};