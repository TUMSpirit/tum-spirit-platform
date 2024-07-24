import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Typography } from 'antd';
import { FolderOpenOutlined, FileOutlined } from '@ant-design/icons';
import { useAuthHeader } from 'react-auth-kit';

const { Text } = Typography;

const FileList = () => {
  const [fileList, setFileList] = useState([]);
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
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const downloadFile = (fileId) => {
    window.location.href = `http://localhost:8000/downloadfile/${fileId}`;
  };

  return (
    <List
      header={<div><FolderOpenOutlined /> Files</div>}
      dataSource={fileList}
      renderItem={(file) => (
        <List.Item
          actions={[<a onClick={() => downloadFile(file.file_id)}>Download</a>]}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <FileOutlined style={{ marginRight: 8 }} />
          <Text>{file.filename}</Text>
        </List.Item>
      )}
      style={{ padding: '16px', borderRadius: '8px' }}
    />
  );
};

export default FileList;