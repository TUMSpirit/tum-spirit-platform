import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, Modal, Form, Input, message, Select, Tag, Slider } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const predefinedTags = [
    { title: 'Planning', bg: '#f50', text: '#fff' },
    { title: 'UI', bg: '#2db7f5', text: '#fff' },
    { title: 'Organization', bg: '#87d068', text: '#fff' },
    { title: 'Hi-Fi', bg: '#108ee9', text: '#fff' },
    { title: 'Lo-Fi', bg: '#531dab', text: '#fff' }
];

const milestonesData = ['M1', 'M2', 'M3'];

const AddModal = ({ onClose, isCreateEventOpen, isUpdateEventOpen, handleAddTask, handleEditTask, handleDeleteTask, initValues }) => {
    const initialTaskData = {
        id: isUpdateEventOpen ? initValues._id : "",
        title: isUpdateEventOpen ? initValues.title : "",
        column: isUpdateEventOpen ? initValues.column : "",
        description: isUpdateEventOpen ? initValues.description : "",
        priority: isUpdateEventOpen ? initValues.priority : "",
        deadline: isUpdateEventOpen ? initValues.deadline : 0,
        tags: isUpdateEventOpen ? initValues.tags : [],
        milestone: isUpdateEventOpen ? initValues.milestone : ""
    };

    const [taskData, setTaskData] = useState(initialTaskData);
    const [form] = Form.useForm();
    const formRef = useRef(null);

    useEffect(() => {
        if (initValues && isUpdateEventOpen) {
            form.setFieldsValue(initValues);
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

    const handleSubmit = () => {
        if (isUpdateEventOpen) {
            handleEditTask(taskData);
        } else {
            handleAddTask(taskData);
        }
        form.resetFields();
        closeModal();
    };

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

    const getInitialFormValues = () => {
        return {
            title: taskData.title,
            column: taskData.column,
            description: taskData.description,
            priority: taskData.priority,
            deadline: taskData.deadline,
            tags: taskData.tags,
            milestone: taskData.milestone
        };
    };

    return (
        <Modal
            closeIcon={false}
            title={"Task"}
            open={isCreateEventOpen || isUpdateEventOpen}
            className={"modal-addEvent"}
            footer={[
                isUpdateEventOpen && (
                    <Button
                        data-testid='deleteEventButton'
                        onClick={confirmDelete}
                        type='primary'
                        icon={<DeleteOutlined />}
                    >
                        Delete
                    </Button>
                ),
                <Button onClick={closeModal}>Cancel</Button>,
                <Button data-testid='saveEventButton' key="submit" type='primary' onClick={form.submit}>Save</Button>
            ]}
        >
            <Form layout={'vertical'} onFinish={handleSubmit} requiredMark={false} form={form} ref={formRef} initialValues={getInitialFormValues()}>
                <Form.Item label={"Title"} name="title">
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
                        tooltip={{ formatter: value => `${value} min` }}
                    />
                </Form.Item>
                <Form.Item name="milestone" label="Milestone" rules={[{ required: true, message: 'Please select a milestone' }]}>
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
            </Form>
        </Modal>
    );
};

export default AddModal;
