// pages/Projects.js
import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Typography, Button, Modal, Form, Input,
  DatePicker, InputNumber, message, Empty, Tooltip, Divider, Tag, Space
} from 'antd';
import {
  PlusOutlined, InfoCircleOutlined, CalendarOutlined, UsergroupAddOutlined, TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuthHeader, useSignOut } from 'react-auth-kit';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProjectOverview = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const authHeader = useAuthHeader();
  const signOut = useSignOut();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/get-admin-projects', {
        headers: { Authorization: authHeader() },
      });
      setProjects(res.data);
    } catch (error) {
      message.error('Fehler beim Laden der Projekte');
    }
  };

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        start_date: values.start_date.toISOString(),
        milestones: []
      };
      await axios.post('/api/create-full-project', payload, {
        headers: { Authorization: authHeader() },
      });
      message.success('Projekt erstellt');
      fetchProjects();
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      message.error('Fehler beim Erstellen');
    }
  };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f9f9f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0 }}>Meine Projekte</Title>
        <Space>
          <Button type="default" danger onClick={() => signOut() && window.location.reload()}>
            Logout
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Neues Projekt
          </Button>
        </Space>
      </div>

      {projects.length === 0 ? (
        <Empty description="Noch keine Projekte vorhanden" style={{ marginTop: 80 }} />
      ) : (
        <Row gutter={[24, 24]}>
          {projects.map(project => (
            <Col xs={24} sm={12} md={8} lg={6} key={project._id}>
              <Card
                hoverable
                style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                bodyStyle={{ padding: 20 }}
                actions={[
                  <Tooltip title="Details anzeigen" key="info">
                    <InfoCircleOutlined onClick={() => window.location.href = `/course/${project._id}`} />
                  </Tooltip>
                ]}
              >
                <Title level={4} style={{ marginBottom: 6 }}>{project.name}</Title>
                <Text type="secondary">{project.description || 'Kein Beschreibungstext'}</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Space direction="vertical">
                  <Tag icon={<CalendarOutlined />} color="blue">
                    {dayjs(project.start_date).format('DD.MM.YYYY')}
                  </Tag>
                  <Tag icon={<UsergroupAddOutlined />} color="geekblue">
                    {project.participant_count} Teilnehmer
                  </Tag>
                  <Tag icon={<TeamOutlined />} color="purple">
                    Teamgröße {project.group_size}
                  </Tag>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Neues Projekt anlegen"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>Abbrechen</Button>,
          <Button key="create" type="primary" onClick={() => form.submit()}>Erstellen</Button>
        ]}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreate}
          initialValues={{ participant_count: 8, group_size: 4 }}
        >
          <Form.Item
            name="name"
            label="Projektname"
            rules={[{ required: true, message: 'Bitte gib einen Projektnamen an' }]}
          >
            <Input placeholder="z. B. Projektseminar KI" />
          </Form.Item>

          <Form.Item name="description" label="Beschreibung">
            <Input.TextArea rows={3} placeholder="Optional" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Startdatum"
            rules={[{ required: true, message: 'Bitte wähle ein Startdatum' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>

          <Form.Item
            name="participant_count"
            label="Teilnehmeranzahl"
            rules={[{ required: true, type: 'number', message: 'Bitte gib eine Anzahl ein' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="group_size"
            label="Teamgröße"
            rules={[{ required: true, type: 'number', message: 'Bitte gib eine Teamgröße ein' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectOverview;
