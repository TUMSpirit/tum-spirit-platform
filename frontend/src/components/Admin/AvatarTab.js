import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined, SendOutlined, FileTextOutlined, FileAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { createReactEditorJS } from 'react-editor-js';

// EditorJS tools
import Paragraph from '@editorjs/paragraph';
import Checklist from '@editorjs/checklist';
import List from '@editorjs/list';
import Code from '@editorjs/code';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// EditorJS instance
const EditorJs = createReactEditorJS();

const predefinedTags = [
  { title: 'Organization', bg: '#f50', text: '#fff' },
  { title: 'Design', bg: '#2db7f5', text: '#fff' },
  { title: 'Prototyping', bg: '#87d068', text: '#fff' },
  { title: 'Development', bg: '#108ee9', text: '#fff' },
  { title: 'Testing', bg: '#531dab', text: '#fff' }
];

const AvatarTab = ({ projectId }) => {
  const [formMessage] = Form.useForm();
  const [formKanban] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const authHeader = useAuthHeader();

  const editorCoreRef = React.useRef(null);

  const handleSendMessage = async (values) => {
    try {
      await axios.post('/api/avatar/broadcast-message', null, {
        params: {
          content: values.message,
          project_id: projectId,
        },
        headers: { Authorization: authHeader() },
      });
      message.success('Nachricht gesendet');
      formMessage.resetFields();
    } catch (err) {
      message.error('Fehler beim Senden');
    }
  };

  const handleCreateKanban = async (values) => {
    try {
      const editorData = await editorCoreRef.current.save();

      const payload = {
        title: values.title,
        description: JSON.stringify(editorData),
        priority: values.priority || "",
        deadline: values.deadline ? parseInt(values.deadline) : 0,
        milestone: values.milestone || "",
        tags: values.tags || [],
        project_id: projectId,
      };

      await axios.post('/api/avatar/create-kanban-card', payload, {
        headers: { Authorization: authHeader() },
      });

      message.success('Kanban-Karte erstellt');
      formKanban.resetFields();
    } catch (err) {
      console.error(err);
      message.error('Fehler beim Erstellen der Karte');
    }
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    fileList.forEach(file => formData.append('files', file));
    formData.append('project_id', projectId);
    try {
      await axios.post('/api/avatar/upload-document-avatar', formData, {
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Datei(en) hochgeladen');
      setFileList([]);
    } catch (err) {
      message.error('Fehler beim Hochladen');
    }
  };

  return (
    <Card title="Interaktionen mit Spirit (Avatar)">
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><SendOutlined /> Nachricht</span>} key="1">
          <Form form={formMessage} onFinish={handleSendMessage} layout="vertical">
            <Form.Item name="message" label="Nachricht an alle Teams" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="z.B. Vergesst nicht das Kickoff morgen!" />
            </Form.Item>
            <Button type="primary" htmlType="submit">Senden</Button>
          </Form>
        </TabPane>

        <TabPane tab={<span><FileTextOutlined /> Kanban</span>} key="2">
          <Form form={formKanban} onFinish={handleCreateKanban} layout="vertical">
            <Form.Item name="title" label="Titel" rules={[{ required: true }]}>
              <Input placeholder="z.B. Thema wählen" />
            </Form.Item>

            <Form.Item label="Beschreibung">
              <EditorJs
                style={{ border: '1px solid #000000', borderRadius: 4, padding: 8, marginTop: 8 }}
                tools={{
                  paragraph: Paragraph,
                  checklist: Checklist,
                  list: List,
                  code: Code,
                  marker: Marker,
                  inlineCode: InlineCode,
                  embed: Embed,
                  table: Table
                }}
                defaultValue={{ blocks: [] }}
                holder="editorjs-container"
                onInitialize={(instance) => editorCoreRef.current = instance}
              />
            </Form.Item>

            <Form.Item name="priority" label="Priorität">
              <Input placeholder="z.B. Hoch, Mittel, Niedrig (optional)" />
            </Form.Item>

            <Form.Item name="deadline" label="Deadline (UNIX Timestamp)">
              <Input type="number" />
            </Form.Item>

            <Form.Item name="milestone" label="Milestone">
              <Input placeholder="z.B. Kickoff, Abgabe 1 (optional)" />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
              <Select mode="multiple" placeholder="Wähle Tags">
                {predefinedTags.map(tag => (
                  <Option key={tag.title} value={tag.title}>{tag.title}</Option>
                ))}
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit">Erstellen</Button>
          </Form>
        </TabPane>

        <TabPane tab={<span><FileAddOutlined /> Materialien</span>} key="3">
          <Upload
            multiple
            beforeUpload={file => {
              setFileList(prev => [...prev, file]);
              return false;
            }}
            fileList={fileList}
            onRemove={file => setFileList(prev => prev.filter(f => f.uid !== file.uid))}
          >
            <Button icon={<UploadOutlined />}>Dateien auswählen</Button>
          </Upload>
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={handleFileUpload}
            disabled={fileList.length === 0}
          >
            Hochladen
          </Button>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default AvatarTab;
