import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Button, Modal, Form, Input, DatePicker, Table,
  message, Row, Col, Divider, Spin, Card, Steps, Tag, Tabs
} from 'antd';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import dayjs from 'dayjs';
import StatisticsTab from './StatisticsTab'
import AvatarTab from './AvatarTab';


const { Title, Text } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const authHeader = useAuthHeader();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneForm] = Form.useForm();

  useEffect(() => {
    if (!courseId) {
      message.error("Ungültige Kurs-ID");
      navigate("/admin/courses");
      return;
    }
    fetchDetails();
  }, [courseId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/get-project-details/${courseId}`, {
        headers: { Authorization: authHeader() },
      });
      setProject(res.data.project);
      setMilestones(res.data.milestones);
      setParticipants(res.data.participants);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      message.error("Kursdetails konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async (values) => {
    try {
      await axios.post(`/api/create-milestones?project_id=${courseId}`, [
        {
          title: values.title,
          date: values.date.toISOString(),
          details: values.details || '',
        },
      ], {
        headers: { Authorization: authHeader() },
      });

      message.success('Meilenstein hinzugefügt');
      setIsMilestoneModalOpen(false);
      milestoneForm.resetFields();
      fetchDetails();
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      message.error('Meilenstein konnte nicht hinzugefügt werden');
    }
  };

  const groupedParticipants = participants.reduce((acc, p) => {
    const team = p.team_name || 'Unbekannt';
    if (!acc[team]) acc[team] = [];
    acc[team].push(p);
    return acc;
  }, {});

  const CourseOverview = () => (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}><Text><strong>Startdatum:</strong> {dayjs(project.start_date).format('DD.MM.YYYY')}</Text></Col>
          <Col span={8}><Text><strong>Teilnehmer:</strong> {project.participant_count}</Text></Col>
          <Col span={8}><Text><strong>Teamgröße:</strong> {project.group_size}</Text></Col>
        </Row>
      </Card>

      <Card
        title="Meilensteine"
        extra={<Button type="primary" onClick={() => setIsMilestoneModalOpen(true)}>+ Meilenstein</Button>}
        style={{ marginBottom: 24 }}
      >
        {milestones.length > 0 ? (
          <Steps direction="vertical">
            {milestones.map((m, idx) => (
              <Step
                key={idx}
                title={m.title}
                description={<>
                  <Text>{dayjs(m.date).format('DD.MM.YYYY')}</Text><br />
                  <Text type="secondary">{m.details}</Text>
                </>}
              />
            ))}
          </Steps>
        ) : (
          <Text type="secondary">Noch keine Meilensteine vorhanden.</Text>
        )}
      </Card>

      <Card title="Teilnehmende nach Team">
        {Object.keys(groupedParticipants).map((team) => (
          <div key={team} style={{ marginBottom: 24 }}>
            <Divider orientation="left"><Tag color="blue">{team}</Tag></Divider>
            <Table
              dataSource={groupedParticipants[team].map((p, idx) => ({ ...p, key: idx }))}
              columns={[
                { title: 'Benutzername', dataIndex: 'username', key: 'username' },
                {
                  title: 'Passwortstatus',
                  dataIndex: 'password_changed',
                  key: 'password_changed',
                  render: (val) => val ? <Tag color="green">gesetzt</Tag> : <Tag color="red">nicht gesetzt</Tag>,
                },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        ))}
      </Card>
    </>
  );

  const CourseStatistics = () => (
    <Card>
      <StatisticsTab></StatisticsTab>
    </Card>
  );

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spin tip="Lade Kursdetails..." /></div>;
  }

  if (!project) {
    return <Text style={{ padding: 24 }}>Projekt nicht gefunden.</Text>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={3}>{project.name}</Title>
        <Button onClick={() => navigate("/admin/courses")}>Zurück zu den Kursen</Button>
      </Row>

      <Tabs defaultActiveKey="overview" type="card">
        <TabPane tab="Übersicht" key="overview">
          <CourseOverview />
        </TabPane>
        <TabPane tab="Statistiken" key="stats">
          <CourseStatistics />
        </TabPane>
        <TabPane tab="Avatar" key="avatar">
          <AvatarTab projectId={project._id} />
        </TabPane>
‚

      </Tabs>

      <Modal
        title="Neuen Meilenstein hinzufügen"
        open={isMilestoneModalOpen}
        onCancel={() => {
          milestoneForm.resetFields();
          setIsMilestoneModalOpen(false);
        }}
        footer={null}
      >
        <Form
          form={milestoneForm}
          layout="vertical"
          name="milestoneForm"
          onFinish={handleAddMilestone}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="Titel"
            rules={[{ required: true, message: 'Bitte gib einen Titel ein' }]}
          >
            <Input placeholder="z. B. Abgabe Projekt 1" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Datum"
            rules={[{ required: true, message: 'Bitte wähle ein Datum' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Datum auswählen" />
          </Form.Item>

          <Form.Item
            name="details"
            label="Details"
          >
            <Input.TextArea rows={3} placeholder="Optional: Beschreibung oder Hinweise" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Hinzufügen
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetail;
