import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Space, Tag, Col, Row, Modal, message, Upload } from 'antd';
import moment from 'moment';
import {
    FileOutlined,
    FileImageOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileZipOutlined,
    DownloadOutlined,
    SearchOutlined,
    UploadOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useAuthHeader } from 'react-auth-kit';
import { SubHeader } from '../../layout/SubHeader';
import { useSubHeaderContext } from '../../layout/SubHeaderContext';

const { Search } = Input;

const FileTable = () => {
    const [fileList, setFileList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [fileListUpload, setFileListUpload] = useState([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const authHeader = useAuthHeader();

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

    const downloadFile = async (fileId) => {
        try {
            const response = await axios.get(`/api/files/download/${fileId}`, {
                responseType: 'blob',
                headers: {
                    "Authorization": authHeader()
                }
            });

            const contentType = response.headers['content-type'];
            const contentDisposition = response.headers['content-disposition'];
            
            const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
            const filename = filenameMatch ? filenameMatch[1] : 'downloaded-file';

            const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
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

    const deleteFile = async (file_id) => {
        try {
            await axios.delete(`/api/files/delete/${fileToDelete}`, {
                headers: {
                    "Authorization": authHeader()
                }
            });
            message.success('File deleted successfully');
            setIsDeleteModalVisible(false);
            setFileToDelete(null);
            // Refresh file list
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
            case '7z':
                return <FileZipOutlined />;
            default:
                return <FileOutlined />;
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
            render: (text) => (
                <Space>
                    {getFileIcon(text)}{text}
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
            defaultSortOrder: 'ascend', // Default sort by date descending
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

    const showUploadModal = () => {
        setIsUploadModalVisible(true);
    };

    const handleUploadModalOk = async () => {
        const formData = new FormData();
        fileListUpload.forEach(file => {
            if (file.originFileObj) {
                formData.append('files', file.originFileObj);
            }
        });

        try {
            await axios.post('/api/files/upload', formData, {
                headers: {
                    Authorization: authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            message.success('Files uploaded successfully');
            setIsUploadModalVisible(false);
            setFileListUpload([]);
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
    };

    const handleFileChange = ({ fileList }) => {
        setFileListUpload(fileList);
    };

    const handleDeleteModalCancel = () => {
        setIsDeleteModalVisible(false);
        setFileToDelete(null);
    };

    return (
        <div>
            <SubHeader>
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
                            onClick={showUploadModal}
                            style={{ float: 'right' }}
                        >
                            Upload File
                        </Button>
                    </Col>
                </Row>
            </SubHeader>
            <Table
                className='documents-table'
                columns={columns}
                dataSource={filteredList.map(file => ({ ...file, key: file.file_id }))}
                pagination={{ pageSize: 10 }}
                style={{ margin: "10px", minHeight: "52vh" }}
                scroll={{ x: true }}
            />
            <Modal
                title="Upload Document"
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
                <Upload
                    fileList={fileListUpload}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
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
