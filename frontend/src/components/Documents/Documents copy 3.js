import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Modal, Upload, message, Select, Space, Progress, Tag, Tabs, Col, Row } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined, FileImageOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileZipOutlined, FileOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useAuthHeader } from 'react-auth-kit';
import { useSubHeader } from '../../layout/SubHeaderContext';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const FileTable = () => {
    const [fileList, setFileList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [isMilestoneSubmission, setIsMilestoneSubmission] = useState(false); // New state for mode
    const [fileListUpload, setFileListUpload] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const authHeader = useAuthHeader();
    const { setSubHeaderComponent } = useSubHeader();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get('/api/files/get-files', {
                    headers: {
                        "Authorization": authHeader()
                    }
                });
                setFileList(response.data);
                setFilteredList(response.data);
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };
        fetchFiles();
    }, []);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const response = await axios.get('/api/milestones', {
                    headers: {
                        "Authorization": authHeader()
                    }
                });
                setMilestones(response.data);
            } catch (error) {
                console.error('Error fetching milestones:', error);
            }
        };
        fetchMilestones();
    }, []);

    const downloadFile = async (fileId) => {
        try {
            const response = await axios.get(`/api/files/download/${fileId}`, {
                responseType: 'blob',
                headers: {
                    "Authorization": authHeader()
                }
            });

            const contentDisposition = response.headers['content-disposition'];
            const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
            const filename = filenameMatch ? filenameMatch[1] : 'downloaded-file';

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            message.error('Error downloading file');
        }
    };

    const deleteFile = async () => {
        try {
            await axios.delete(`/api/files/delete/${fileToDelete}`, {
                headers: {
                    "Authorization": authHeader()
                }
            });
            message.success('File deleted successfully');
            setIsDeleteModalVisible(false);
            setFileToDelete(null);
            const response = await axios.get('/api/files/get-files', {
                headers: {
                    "Authorization": authHeader()
                }
            });
            setFileList(response.data);
            setFilteredList(response.data);
        } catch (error) {
            console.error('Error deleting file:', error);
            message.error('Error deleting file');
        }
    };

    const getFileType = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'image';
            case 'pdf':
                return 'pdf';
            case 'doc':
            case 'docx':
                return 'word';
            case 'xls':
            case 'xlsx':
                return 'excel';
            default:
                return 'other';
        }
    };
    
    const getFileIcon = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <FileImageOutlined />;
            case 'pdf':
                return <FilePdfOutlined />;
            case 'doc':
            case 'docx':
                return <FileWordOutlined />;
            case 'xls':
            case 'xlsx':
                return <FileExcelOutlined />;
            case 'zip':
            case 'rar':
                return <FileZipOutlined />;
            default:
                return <FileOutlined />;
        }
    };

    const handleTagChange = (tag, checked) => {
        const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
        setSelectedTags(nextSelectedTags);
        filterList(searchText, nextSelectedTags);
    };

    const tagsData = ['image', 'pdf', 'word'];

    const onSearch = (value) => {
        filterList(value, selectedTags);
    };

    const filterList = (searchText, selectedTags) => {
        let filteredData = fileList.filter(file => file.filename.toLowerCase().includes(searchText.toLowerCase()));
        if (selectedTags.length > 0) {
            filteredData = filteredData.filter(file => selectedTags.includes(getFileType(file.filename)));
        }
        setFilteredList(filteredData);
    };

    const [searchText, setSearchText] = useState('');

    const columns = [
        {
            title: 'Filename',
            dataIndex: 'filename',
            key: 'filename',
            sorter: (a, b) => a.filename.localeCompare(b.filename),
            render: (text, record) => (
                <Space>
                    {getFileIcon(text)} {text} {record.isMilestone ? <Tag color="blue">Milestone</Tag> : null}
                </Space>
            ),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            sorter: (a, b) => a.size - b.size,
            render: (size) => `${(size / 1024).toFixed(2)} KB`,
        },
        {
            title: 'Uploaded At',
            dataIndex: 'timestamp',
            key: 'timestamp',
            sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
            render: (text) => moment(text).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space>
                    <Button onClick={() => downloadFile(record._id)} icon={<DownloadOutlined />} />
                    <Button onClick={() => {
                        setFileToDelete(record._id);
                        setIsDeleteModalVisible(true);
                    }} icon={<DeleteOutlined />} />
                </Space>
            ),
        },
    ];

    const showUploadModal = (milestone = false) => {
        setIsMilestoneSubmission(milestone); // Set mode based on user selection
        setIsUploadModalVisible(true);
    };

    const handleUploadModalOk = async () => {
        const formData = new FormData();
        fileListUpload.forEach(file => {
            if (file.originFileObj) {
                formData.append('files', file.originFileObj);
            }
        });
        if (isMilestoneSubmission && selectedMilestone) {
            formData.append('milestone_id', selectedMilestone);
        }

        try {
            await axios.post('/api/files/upload', formData, {
                headers: {
                    Authorization: authHeader(),
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            message.success('Files uploaded successfully');
            setIsUploadModalVisible(false);
            setFileListUpload([]);
            setUploadProgress(0);
            const response = await axios.get('/api/files/get-files', {
                headers: {
                    "Authorization": authHeader()
                }
            });
            setFileList(response.data);
            setFilteredList(response.data);
        } catch (error) {
            console.error('Error uploading files:', error);
            message.error('Error uploading files');
        }
    };

    const handleUploadModalCancel = () => {
        setIsUploadModalVisible(false);
        setFileListUpload([]);
        setUploadProgress(0);
    };

    const handleFileChange = ({ fileList }) => {
        setFileListUpload(fileList);
    };

    const handleDeleteModalCancel = () => {
        setIsDeleteModalVisible(false);
        setFileToDelete(null);
    };

    useEffect(() => {
        setSubHeaderComponent({
            component: (
                <>
                    <Row gutter={[24, 16]} style={{ marginBottom: '10px' }}>
                        <Col xs={13} sm={16}>
                            <div>
                                {tagsData.map(tag => (
                                    <Tag.CheckableTag
                                        key={tag}
                                        checked={selectedTags.includes(tag)}
                                        onChange={checked => handleTagChange(tag, checked)}
                                    >
                                        {tag.toUpperCase()}
                                    </Tag.CheckableTag>
                                ))}
                            </div>
                        </Col>
                        <Col xs={11} sm={8}>
                            <Search
                                placeholder="Search files"
                                onSearch={onSearch}
                                enterButton
                                style={{ marginBottom: '10px', width: '100%' }}
                                prefix={<SearchOutlined />}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={24} style={{ marginBottom: '10px' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showUploadModal(false)}
                                style={{ marginRight: '10px' }}
                            >
                                Upload General File
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showUploadModal(true)}
                            >
                                Upload File for Milestone
                            </Button>
                        </Col>
                    </Row>
                </>
            )
        });

        return () => setSubHeaderComponent(null); // Clear subheader when unmounting
    }, [filteredList, selectedTags]);

    return (
        <div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="General Uploads" key="1">
                    <Table
                        columns={columns.filter(col => col.dataIndex !== 'milestone_id')} // Don't show milestone for general uploads
                        dataSource={filteredList.filter(file => !file.milestone_id).map(file => ({ ...file, key: file.file_id }))}
                        pagination={{ pageSize: 10 }}
                        style={{ margin: "10px", minHeight: "52vh" }}
                        scroll={{ x: true }}
                    />
                </TabPane>
                <TabPane tab="Milestone Submissions" key="2">
                    <Table
                        columns={columns}
                        dataSource={filteredList.filter(file => file.milestone_id).map(file => ({ ...file, key: file.file_id }))}
                        pagination={{ pageSize: 10 }}
                        style={{ margin: "10px", minHeight: "52vh" }}
                        scroll={{ x: true }}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={isMilestoneSubmission ? "Upload File for Milestone" : "Upload General File"}
                open={isUploadModalVisible}
                onOk={handleUploadModalOk}
                onCancel={handleUploadModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleUploadModalCancel}>
                        Cancel
                    </Button>,
                    <Button key="upload" type="primary" onClick={handleUploadModalOk}>
                        Upload
                    </Button>,
                ]}
            >
                {isMilestoneSubmission && (
                    <Select
                        placeholder="Select Milestone"
                        onChange={(value) => setSelectedMilestone(value)}
                        style={{ width: '100%', marginBottom: 20 }}
                    >
                        {milestones.map(milestone => (
                            <Option key={milestone.id} value={milestone.id}>
                                {milestone.name} (Due: {milestone.due_date})
                            </Option>
                        ))}
                    </Select>
                )}
                <Upload
                    fileList={fileListUpload}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                    multiple
                >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
                <Progress percent={uploadProgress} />
            </Modal>

            <Modal
                title="Confirm Deletion"
                open={isDeleteModalVisible}
                onCancel={handleDeleteModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleDeleteModalCancel}>
                        Cancel
                    </Button>,
                    <Button key="delete" type="primary" danger onClick={deleteFile}>
                        Delete
                    </Button>,
                ]}
            >
                <p>Are you sure you want to delete this file?</p>
            </Modal>
        </div>
    );
};

export default FileTable;
