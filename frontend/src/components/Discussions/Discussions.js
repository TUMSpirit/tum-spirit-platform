import React, { useState, useEffect } from 'react';
import { Card, Menu, Row, Col, message, Button, Input, Modal, Select, Avatar, Badge } from 'antd';
import { Comment } from '@ant-design/compatible';
import { LikeOutlined, LikeFilled } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketProvider';
import { useAuthHeader } from 'react-auth-kit';

const { TextArea } = Input;
const { Option } = Select;
const { SubMenu } = Menu;

const DiscussionForum = ({ projectId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState({});
  const [replyContent, setReplyContent] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', category: '' });
  const authHeader = useAuthHeader();
  const { currentUser } = useSocket();

  const categories = ['General', 'Feedback', 'Ideas', 'Bug Report'];

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/discussions/get/${projectId}`, {
        headers: { Authorization: authHeader() },
      });
      setDiscussions(response.data);
    } catch (error) {
      message.error('Could not load discussions.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!projectId) return;
    fetchDiscussions();
  }, []);

  const handleLikeToggle = async (discussion) => {
    const isLiked = likes[discussion._id];

    setLikes({
      ...likes,
      [discussion._id]: isLiked ? false : true,
    });

    try {
      const response = await axios.get(`/api/discussions/${discussion._id}/toggle-like`, {
        headers: { Authorization: authHeader() },
      });

      const { likes: updatedLikes } = response.data;

      // Update selectedDiscussion with the new likes count
      setSelectedDiscussion((prev) => ({
        ...prev,
        likes: updatedLikes,
      }));

      // Also update the discussion in the list
      setDiscussions((prevDiscussions) =>
        prevDiscussions.map((d) =>
          d._id === discussion._id ? { ...d, likes: updatedLikes } : d
        )
      );
    } catch (error) {
      setLikes({
        ...likes,
        [discussion._id]: isLiked,
      });

      message.error('Could not toggle like for the discussion.');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent) return;

    const newReply = {
      author: currentUser.username,
      content: replyContent,
      createdAt: moment().toISOString(),
      avatar_color: currentUser.avatar_color || '#25160',
    };

    try {
      await axios.post(`/api/discussions/${selectedDiscussion._id}/reply`, newReply, {
        headers: { Authorization: authHeader() },
      });

      // Update replies list and reset reply content
      setSelectedDiscussion((prev) => ({
        ...prev,
        replies: [newReply, ...prev.replies], // Prepend new reply to the list
      }));
      setReplyContent('');
    } catch (error) {
      message.error('Failed to post the reply.');
    }
  };

  const onSelectDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setLikes((prevLikes) => ({
      ...prevLikes,
      [discussion._id]: discussion.liked_by.includes(currentUser._id),
    }));
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!newDiscussion.title || !newDiscussion.content || !newDiscussion.category) return;

    try {
      const newDiscussionData = {
        ...newDiscussion,
        author: currentUser.username,
        avatar_color: currentUser.avatar_color || '#25160',
      };
      await axios.post(`/api/discussions/create?project_id=${projectId}`, newDiscussionData, {
        headers: { Authorization: authHeader() },
      });
      fetchDiscussions();
      setNewDiscussion({ title: '', content: '', category: '' });
      setIsModalVisible(false);
      message.success('Your new discussion has been posted.');
    } catch (error) {
      message.error('Failed to post the discussion.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Function to recursively render nested comments
  const renderNestedComments = (replies) =>
    replies.map((reply) => (
      <Comment
        key={reply.createdAt}
        author={<span>{reply.author}</span>}
        avatar={
          <Avatar style={{ backgroundColor: reply.avatar_color || '#25160' }}>
            {reply.author[0]}
          </Avatar>
        }
        content={<p>{reply.content}</p>}
        datetime={<span>{moment.utc(reply.createdAt).fromNow()}</span>}
        children={reply.replies && reply.replies.length > 0 ? renderNestedComments(reply.replies) : null}
      />
    ));

  return (
    <Card title="Discussion Forum" style={{ marginTop: '16px' }}>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '16px' }}>
        + New Discussion
      </Button>

      <Modal
        title="Create New Discussion"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Post"
        cancelText="Cancel"
      >
        <Input
          placeholder="Title"
          value={newDiscussion.title}
          onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
          style={{ marginBottom: '16px' }}
        />
        <TextArea
          rows={4}
          placeholder="Discussion content"
          value={newDiscussion.content}
          onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
          style={{ marginBottom: '16px' }}
        />
        <Select
          placeholder="Select Category"
          value={newDiscussion.category}
          onChange={(value) => setNewDiscussion({ ...newDiscussion, category: value })}
          style={{ width: '100%' }}
        >
          {categories.map((category) => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>
      </Modal>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Menu mode="inline" style={{ height: '100%' }}>
            {categories.map((category, index) => (
              <SubMenu key={index} title={category}>
                {discussions
                  .filter((discussion) => discussion.category === category)
                  .map((discussion) => (
                    <Menu.Item
                      key={discussion._id}
                      onClick={() => onSelectDiscussion(discussion)}
                      style={{
                        background: selectedDiscussion && selectedDiscussion._id === discussion._id ? '#DCEDFF' : 'transparent',
                        cursor: 'pointer',
                        paddingLeft:'25px',
                        height:"auto"
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                        <div>
                          <strong>{discussion.title}</strong>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            {discussion.author} - {moment.utc(discussion.createdAt).fromNow()}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'blue', margin:'5px'}}>
                          <Badge color={"blue"} count={discussion.likes} showZero>
                            <LikeOutlined />
                          </Badge>
                        </div>
                      </div>
                    </Menu.Item>
                  ))}
              </SubMenu>
            ))}
          </Menu>
        </Col>
        <Col xs={24} md={16}>
          {selectedDiscussion ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <h1 style={{ textAlign: 'center', marginBottom: '16px' }}>
                  {selectedDiscussion.title}
                </h1>
                <Comment
                  author={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{selectedDiscussion.author}</span>
                    </div>
                  }
                  avatar={
                    <Avatar style={{ backgroundColor: selectedDiscussion.avatar_color || '#25160' }}>
                      {selectedDiscussion.author[0]}
                    </Avatar>
                  }
                  content={<p>{selectedDiscussion.content}</p>}
                  actions={[
                    <span onClick={() => handleLikeToggle(selectedDiscussion)}>
                      {likes[selectedDiscussion._id] ? <LikeFilled /> : <LikeOutlined />} {selectedDiscussion.likes}
                    </span>,
                  ]}
                  datetime={
                    
                    <small>{moment.utc(selectedDiscussion.createdAt).fromNow()}</small>
                  }
                />
                <h2>Replies ({selectedDiscussion.replies.length})</h2>
                <div style={{ height: '250px', overflowY: 'scroll', marginTop: '20px' }}>
                  {renderNestedComments(
                    (selectedDiscussion.replies || []).sort((a, b) => moment(b.createdAt) - moment(a.createdAt))
                  )}
                </div>
                <div style={{ marginTop: '20px' }}>
                  <TextArea
                    rows={2}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                  />
                  <Button
                    type="primary"
                    style={{ marginTop: '8px', float: 'right' }}
                    onClick={handleReplySubmit}
                    disabled={!replyContent}
                  >
                    Send Reply
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card title="Select a Discussion" bordered={false}>
              <p>Select a discussion from the list to view its details.</p>
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default DiscussionForum;
