// Popup.js
import React, {useState} from 'react';
import {
    Button,
    Form,
    Input,
    DatePicker,
    ColorPicker,
    Upload,
    Modal,
    Row,
    Col,
    message,
    Select,
    Avatar,
    Space,
    Image, Switch
} from "antd";
import './AddEventPopup.css';
import dayjs from "dayjs";
import {DeleteOutlined, DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import {useDeleteFile, useUploadFile} from "../requests/requestFunc";
//import {useDeleteEntries, useUpdateEntries} from "../requests/requestFunc";

const fallbackImgRoomfinder = require('../img/Room not found.png')
const {RangePicker} = DatePicker


const AddEventPopup = ({onCancel, onFinish, isNewOpen, event, deleteEntry, isExistingOpen, users, currentUser}) => {

    const [sharedUsers, setSharedUsers] = useState( isNewOpen? [currentUser] : users.filter(user => event.users.includes(user.id)))
    const [isOnSite, setIsOnSite] = useState(event? event.isOnSite : true)
    const [room, setRoom] = useState(event? event.room : null)
    const {mutateAsync: deleteFile} = useDeleteFile()

    console.log('Popup: ', users, sharedUsers)

    const onChangeParticipants = (selectedUserIds) => {
        if(selectedUserIds.length === 0)
        {
            message.error('Event needs at least one Participant')
        }
            setSharedUsers(users.filter(user => selectedUserIds.includes(user.id)));


        console.log('shared:', sharedUsers)
    }

    const defFileList = () => {
        //console.log('file: ', event.files)
        if (event?.files) {
            return event.files.map(file => ({
                uid: file.fileRef,  // Use the file's ID as the unique identifier
                name: file.filename,  // File name
                status: 'done', url: `http://localhost:8000/calendar/files/${file.fileRef}`, // Construct the file URL (adjust as needed)
            }));
        } else {
            return null
        }

    };

    const beforeUpload = (file) => {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isLt2M;
    }

    const onRemoveUpload = (file) => {
        console.log('id: ', file);
        deleteFile({eventId: event.id, fileId: file.uid})
    }

    const uploadProps = {
        onChange({file, fileList}) {
            if (file.status !== 'uploading') {
                //console.log(file, fileList);
            }
        },
        openFileDialogOnClick: true,
        showPreviewIcon: true,
        defaultFileList: defFileList(), showUploadList: {
            showDownloadIcon: true,
            showRemoveIcon: true,
            downloadIcon: <DownloadOutlined/>,
            removeIcon: <DeleteOutlined onClick={(e) => console.log(e, 'custom removeIcon event')}/>,

        },
    };

    const initialValues = {
        title: isExistingOpen ? event.title : '',
        start: isExistingOpen ? event.start : moment(),
        end: isExistingOpen ? event.end : moment().add(1, 'hour'),
        color: isExistingOpen ? event.color : '#1677FF',
    }

    //FileUpload Stuff


    return (<Modal open={isExistingOpen || isNewOpen} footer={null} closeIcon={false}>
        <Row>
            <h1>Details</h1>
        </Row>


        <Form layout={'vertical'} onFinish={onFinish}>

        <Row gutter={[16, 0]}>
                <Col>
                    <Form.Item label={"Title"} name="eventTitle" initialValue={initialValues.title}>
                        <Input required placeholder={"Enter Title"}></Input>
                    </Form.Item>
                </Col>

                <Col>
                    <Form.Item label={' '} name={'colorPicker'} initialValue={initialValues.color}>
                        <ColorPicker disabledAlpha presets={[{
                            label: 'Recommended',
                            colors: ['#F5222D', '#FA8C16', '#FADB14', '#8BBB11', '#52C41A', '#13A8A8', '#1677FF', '#2F54EB', '#722ED1', '#EB2F96',],
                        }]}/>
                    </Form.Item>
                </Col>
        </Row>

            <Row gutter={[16, 0]}>
                <Form.Item label={"Date"} name="rangepicker"
                           initialValue={[dayjs(initialValues.start), dayjs(initialValues.end)]}>
                    <RangePicker format="DD.MM.YYYY HH:mm" showTime={{format: 'HH:mm'}} required></RangePicker>
                </Form.Item>
            </Row>

            <Row gutter={[16, 0]}>
                <Form.Item name='files'>
                    <Upload {...uploadProps} beforeUpload={beforeUpload} onRemove={onRemoveUpload} maxCount={10} multiple={true}>
                        <Button icon={<UploadOutlined/>}>Upload</Button>
                    </Upload>
                </Form.Item>
            </Row>

            <Form.Item name="params" type="hidden"
                       initialValue={{isNew: isNewOpen, id: event?.id, allDay: event?.allDay, event: event}}>
                <input type={'hidden'}/>
            </Form.Item>

            <Row gutter={[16, 0]}>
                <Col>
                    <Form.Item name={'sharedUsers'}>
                        <Select required maxTagCount={0} fieldNames={{label: 'name', value: 'id'}} defaultValue={sharedUsers.map(user => user.id)} maxTagPlaceholder={'Add Participants'} placeholder="Add Participants" mode="tags" allowClear={false} options={users} onChange={onChangeParticipants} style={{width: 200}}  />
                    </Form.Item>
                    </Col>
            </Row>

            <Row gutter={[16, 0]}>
                <Col>
                    <AvatarDisplay selectedUsers={sharedUsers}></AvatarDisplay>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Item name={'isOnSite'}>
                        <Switch checked={isOnSite} checkedChildren={'On Site'} unCheckedChildren={'Remote'} onChange={() => {setIsOnSite(!isOnSite)}}/>
                    </Form.Item>
                </Col>
            </Row>

            {isOnSite &&
            <Row>
                <Col>
                     <Form.Item label={'Room'} name={'room'}>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input defaultValue={room} placeholder="Room ID" onChange={(event) => {setRoom(event.target.value)}}/>
                        </Space.Compact>
                    </Form.Item>
                    <Image width={400} src={`https://nav.tum.de/api/preview/${room}`} fallback={fallbackImgRoomfinder}/>

                </Col>
            </Row>}

            {
                !isOnSite &&
                <Row>
                    <Col>
                        <Form.Item name={'remoteLink'} label={'Link'} >
                            <Space.Compact style={{ width: '100%' }}>
                                <Input placeholder={'Insert Meeting Link'} defaultValue={event? event.remoteLink : null}/>
                                <Button>Open Meeting</Button>
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                </Row>
            }


            <Row justify={'end'} gutter={[16, 0]}>

                <Col>
                    {!isNewOpen && <Button type='primary' icon={<DeleteOutlined/>} onClick={() => {
                        deleteEntry(event.id)
                    }}></Button>}
                </Col>

                <Col>
                    <Button onClick={onCancel}>Cancel</Button>
                </Col>



                <Col>
                    <Form.Item>
                        <Button type="primary" htmlType={"submit"}>Save</Button>
                    </Form.Item>
                </Col>
            </Row>



        </Form>
    </Modal>);
};

export default AddEventPopup;

const transformMonth = (m) => {
    return (parseInt(m) - 1).toString().padStart(2, '0')
}
export const createEvent = (fieldsValue, currUserId) => {
    console.log('fieldsValue: ', fieldsValue)
    let color = fieldsValue['colorPicker'];


    if (typeof color !== "string") {
        color = color.toHexString()
    }

    const startYear = fieldsValue["rangepicker"][0].format('YYYY');
    const startMonth = transformMonth(fieldsValue["rangepicker"][0].format('MM'));

    const startDay = fieldsValue["rangepicker"][0].format('DD');
    const startHour = fieldsValue["rangepicker"][0].format('HH');
    const startMinute = fieldsValue["rangepicker"][0].format('mm');
    const endYear = fieldsValue["rangepicker"][1].format('YYYY');
    const endMonth = transformMonth(fieldsValue["rangepicker"][1].format('MM'));
    const endDay = fieldsValue["rangepicker"][1].format('DD');
    const endHour = fieldsValue["rangepicker"][1].format('HH');
    const endMinute = fieldsValue["rangepicker"][1].format('mm');
    const id = fieldsValue['params'].id ? fieldsValue['params'].id : undefined;
    const users = fieldsValue['sharedUsers']? fieldsValue['sharedUsers'] : [currUserId]
    const room = fieldsValue['room']
    console.log('users: ', users)
    const newEvent = {
        id: id,
        title: fieldsValue["eventTitle"],
        start: new Date(startYear, startMonth, startDay, startHour, startMinute),
        end: new Date(endYear, endMonth, endDay, endHour, endMinute),
        color: color,
        isOnSite: fieldsValue['isOnSite'],
        room: room,
        remoteLink: fieldsValue['isRemoteLink'],
        users: users,
    }

    return newEvent;
}



const AvatarDisplay = ({ selectedUsers }) => {
    return (
        <Avatar.Group>
            {selectedUsers.map(user => (
                <Avatar key={user.id} style={{backgroundColor: user.color, color:'white'}}>
                    {user.initialen}
                </Avatar>
            ))}
        </Avatar.Group>
    );
};



/*
export async function uploadFile  (files, eventID) {

    const formData = new FormData();
    files.fileList.forEach((file) => {
        if (file.originFileObj) { // Check if file is available for upload
            formData.append('files', file.originFileObj);
        }
    });

    try {
        const response = await axios.post(`http://localhost:8000/calendar/${eventID}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        message.success('File uploaded successfully');

    } catch (error) {
        console.error('Error uploading file:', error);
        message.error('Error uploading file');
    }


}
*/

