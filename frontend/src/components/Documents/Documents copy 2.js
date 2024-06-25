import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Input, Space } from 'antd';
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

const { Search } = Input;

const FileTable = () => {
    const [fileList, setFileList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const authHeader = useAuthHeader();

    useEffect(() => {
      const fetchFiles = async () => {
          try {
              const response = await axios.get('http://localhost:8000/api/files/get-files',
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

    const onSearch = (value) => {
        const filteredData = fileList.filter(file => file.filename.toLowerCase().includes(value.toLowerCase()));
        setFilteredList(filteredData);
    };

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
        <div style={{ backgroundColor: '#f0f2f5', padding: '16px', borderRadius: '8px' }}>
            <Search
                placeholder="Search files"
                onSearch={onSearch}
                enterButton
                style={{ marginBottom: '20px' }}
                prefix={<SearchOutlined />}
            />
            <Table
                columns={columns}
                dataSource={filteredList.map(file => ({ ...file, key: file.file_id }))}
                pagination={{ pageSize: 10 }}
                style={{ backgroundColor: '#fff', borderRadius: '8px' }}
            />
        </div>
    );
};

export default FileTable;
