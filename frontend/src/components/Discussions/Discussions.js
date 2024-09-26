import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, List, Avatar, Comment, Tooltip, Tag, Select, Spin, notification } from 'antd';
import { LikeOutlined, DislikeOutlined, LikeFilled, DislikeFilled } from '@ant-design/icons';
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
  const [dislikes, setDislikes] = useState({});
  const [form] = Form.useForm();
  const { currentUser } = useSocket();
  const authHeader = useAuthHeader();

  const categories = ['General', 'Feedback', 'Ideas', 'Bug Report'];

  useEffect(() => {
    const fetchDiscussions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/projects/${projectId}/discussions`, {
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

    fetchDiscussions();
  }, [projectId]);

  const handleSubmit = async (values) => {
    const newDiscussion = {
      author: currentUser.username,
      content: values.content,
      category: values.category,
      createdAt: moment().toISOString(),
      avatar: currentUser.avatar || 'https://joeschmoe.io/api/v1/random',
      likes: 0,
      dislikes: 0,
    };

    try {
      await axios.post(`/api/projects/${projectId}/discussions`, newDiscussion, {
        headers: { Authorization: authHeader() }
      });

      setDiscussions([newDiscussion, ...discussions]);
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

  const handleLike = (discussion) => {
    const newLikes = { ...likes, [discussion.id]: (likes[discussion.id] || 0) + 1 };
    setLikes(newLikes);
  };

  const handleDislike = (discussion) => {
    const newDislikes = { ...dislikes, [discussion.id]: (dislikes[discussion.id] || 0) + 1 };
    setDislikes(newDislikes);
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
            <li key={discussion.id}>
              <Comment
                author={discussion.author}
                avatar={<Avatar src={discussion.avatar} />}
                content={
                  <>
                    <p>{discussion.content}</p>
                    <Tag color="blue">{discussion.category}</Tag>
                  </>
                }
                datetime={
                  <Tooltip title={moment(discussion.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                    <span>{moment(discussion.createdAt).fromNow()}</span>
                  </Tooltip>
                }
                actions={[
                  <span onClick={() => handleLike(discussion)}>
                    {likes[discussion.id] > 0 ? <LikeFilled /> : <LikeOutlined />} {likes[discussion.id] || 0}
                  </span>,
                  <span onClick={() => handleDislike(discussion)}>
                    {dislikes[discussion.id] > 0 ? <DislikeFilled /> : <DislikeOutlined />} {dislikes[discussion.id] || 0}
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
