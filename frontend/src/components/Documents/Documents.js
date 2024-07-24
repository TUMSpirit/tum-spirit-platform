import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Space, Tag, Col, Row } from 'antd';
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
} from '@ant-design/icons';
import { useAuthHeader } from 'react-auth-kit';
import { SubHeader } from '../../layout/SubHeader';

const { Search } = Input;

const FileTable = () => {
    const [fileList, setFileList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const authHeader = useAuthHeader();

    useEffect(() => {
      const fetchFiles = async () => {
          try {
              const response = await axios.get('/api/files/get-files',
              {
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

    const downloadFile = (fileId) => {
        window.location.href = `http://localhost:8000/downloadfile/${fileId}`;
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

    const tagsData = ['image', 'pdf', 'word', 'excel'];

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
            render: (text) => <Space>{getFileIcon(text)}{text}</Space>,
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (size) => `${(size / 1024).toFixed(2)} KB`,
        },
        {
            title: 'Uploaded At',
            dataIndex: 'uploaded_at',
            key: 'uploaded_at',
            render: (text) => moment(text).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button onClick={() => downloadFile(record.file_id)} icon={<DownloadOutlined />}>Download</Button>
            ),
        },
    ];

    return (
          <div style={{borderRadius: '8px' }}>
            <SubHeader>
            <Row gutter={[24, 0]} style={{ marginBottom: '20px' }}>
                <Col xs={12} sm={12}>
                    <Search
                        placeholder="Search files"
                        onSearch={onSearch}
                        enterButton
                        style={{ marginBottom: '10px' }}
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>
                <Col xs={8} sm={12}>
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
            </Row>
            </SubHeader>
            <Table
                columns={columns}
                dataSource={filteredList.map(file => ({ ...file, key: file.file_id }))}
                pagination={{ pageSize: 10 }}
                style={{margin:"20px"}}
                scroll={{ x: true }}
            />
        </div>
    );
};

export default FileTable;
