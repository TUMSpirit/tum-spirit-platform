import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, List, Avatar, Tooltip, Tag, Select, Spin, notification } from 'antd';
import { Comment } from '@ant-design/compatible';
import { LikeOutlined, DislikeOutlined, LikeFilled, DislikeFilled, DisconnectOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useSocket } from '../../context/SocketProvider';
import { useAuthHeader } from 'react-auth-kit';

const { TextArea } = Input;
const { Option } = Select;

const DiscussionForum = ({ projectId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState({});
  const [form] = Form.useForm();
  const { currentUser } = useSocket();
  const authHeader = useAuthHeader();

  const categories = ['General', 'Feedback', 'Ideas', 'Bug Report'];

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/discussions/get/${projectId}`, {
        headers: { Authorization: authHeader() }
      });
      setDiscussions(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Could not load discussions.',
      });
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (!projectId) return;
    fetchDiscussions();
  }, []);

  const handleSubmit = async (values) => {
    const newDiscussion = {
      author: currentUser.username,
      content: values.content,
      category: values.category,
      createdAt: moment().toISOString(),
      avatar_color: currentUser.avatar_color || '#25160',
    };

    try {
      await axios.post(`/api/discussions/create?project_id=${projectId}`, newDiscussion, {
        headers: { Authorization: authHeader() }
      });

      fetchDiscussions();
      form.resetFields();
      notification.success({
        message: 'Discussion Created',
        description: 'Your discussion was posted successfully.',
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to post the discussion.',
      });
    }
  };

  const handleLikeToggle = async (discussion) => {
    const isLiked = likes[discussion._id];  // Use `id` since we're returning `id` instead of `_id` from the backend

    // Optimistically update the UI
    setLikes({
      ...likes,
      [discussion._id]: isLiked ? false : true,  // Toggle like (add or remove like)
    });

    try {
      // Send the "like" action to the backend
      const response = await axios.get(`/api/discussions/${discussion._id}/toggle-like`, {
        headers: { Authorization: authHeader() },
      });

      // Destructure likes from the response data
      const { likes } = response.data;

      // Update the discussions with the latest likes count
      setDiscussions((prevDiscussions) =>
        prevDiscussions.map((d) =>
          d._id === discussion._id ? { ...d, likes } : d
        )
      );
    } catch (error) {
      // Revert the optimistic UI update if the request fails
      setLikes({
        ...likes,
        [discussion._id]: isLiked,  // Restore to the previous state
      });

      notification.error({
        message: 'Error',
        description: 'Could not toggle like for the discussion.',
      });
    }
  };

  const handleReply = (discussionId, content) => {
    // Logic to handle reply submission
    console.log("Replying to:", discussionId, content);
  };

  return (
    <Card title="Discussion Forum" style={{ marginTop: '16px' }}>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="content" rules={[{ required: true, message: 'Please enter your discussion!' }]}>
          <TextArea rows={4} placeholder="Start a discussion..." />
        </Form.Item>
        <Form.Item name="category" rules={[{ required: true, message: 'Please select a category!' }]}>
          <Select placeholder="Select category">
            {categories.map((category) => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Post Discussion
          </Button>
        </Form.Item>
      </Form>
      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          className="discussion-list"
          itemLayout="vertical"
          dataSource={discussions}
          renderItem={(discussion) => (
            <li key={discussion._id}>
              <Comment
                author={<span>{discussion.author}</span>}
                avatar={
                  <Avatar style={{ backgroundColor: discussion.avatar_color || '#25160' }}>
                    {discussion.author[0]}
                  </Avatar>
                }
                content={
                  <>
                    <p>{discussion.content}</p>
                    <Tag color="blue">{discussion.category}</Tag>
                  </>
                }
                datetime={
                  <small>{moment.utc(discussion.createdAt).from(moment.utc())}</small>  // Format timestamp
              }
                actions={[
                  <span onClick={() => handleLikeToggle(discussion)}>
                    {likes[discussion._id] ? <LikeFilled /> : <LikeOutlined />} {discussion.likes}
                  </span>,
                ]}
              />
            </li>
          )}
        />
      )}
    </Card>
  );
};

export default DiscussionForum;
