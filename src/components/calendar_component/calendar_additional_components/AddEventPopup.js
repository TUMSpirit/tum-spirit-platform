// Popup.js
import React, {useEffect, useRef, useState} from 'react';
import {
    Button, Form, Input, DatePicker, ColorPicker, Upload, Modal, Row, Col, message, Select, Avatar, Space, Image, Switch
} from "antd";
import './AddEventPopup.css';
import dayjs from "dayjs";
import {DeleteOutlined, DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import {
    useCreateEntries,
    useDeleteEntries,
    useDeleteFile,
    useUpdateEntries,
    useUploadFile
} from "../requests/requestFunc";
//import {useDeleteEntries, useUpdateEntries} from "../requests/requestFunc";

const fallbackImgRoomfinder = require('../img/Room not found.png')
const {RangePicker} = DatePicker


const AddEventPopup = ({
                           isCreateEventOpen,
                           isUpdateEventOpen,
                           setIsCreateEventOpen,
                           setIsUpdateEventOpen,
                           event,
                           users,
                           currentUser
                       }) => {


    const init_formData = {
        id: isUpdateEventOpen ? event.id : undefined,
        title: isUpdateEventOpen ? event.title : '',
        start: isUpdateEventOpen ? event.start : moment(),
        end: isUpdateEventOpen ? event.end : moment().add(1, 'hour'),
        color: isUpdateEventOpen ? event.color : '#1677FF',
        allDay: isUpdateEventOpen ? event.allDay : false,
        sharedUsers: isUpdateEventOpen ? users.filter(user => event.users.includes(user.id)) : [currentUser],
        isOnSite: isUpdateEventOpen ? event.isOnSite : true,
        room: isUpdateEventOpen ? event.room : null,
        remoteLink: isUpdateEventOpen ? event.remoteLink : null,
        isMilestone: isUpdateEventOpen ? event.isMilestone : false,
    }


    const [formData, setFormData] = useState(init_formData)
    const [form] = Form.useForm();
    const formRef = useRef(null);

    const getInitialFormValues = () => {
       return {
           title: formData.title,
           color: formData.color,
           rangepicker: [dayjs(formData.start), dayjs(formData.end)],
           sharedUsers: formData.sharedUsers.map(user => user.id),
       }
    }


    const {mutateAsync: createEntry} = useCreateEntries()
    const {mutateAsync: updateEntry} = useUpdateEntries()
    const {mutateAsync: deleteEntry} = useDeleteEntries()
    const {mutateAsync: deleteFile} = useDeleteFile()
    const {mutateAsync: uploadFile} = useUploadFile()

    //---------------------------------- form functions ---------------------------------------
    const fillNewEvent = (fieldsValue) => {
        console.log('fieldsValue: ', fieldsValue)
        let color = fieldsValue['colorPicker'];


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
        console.log('users: ', users)
        const newEvent = {
            id: formData.id,
            title: formData.title,
            start: new Date(startYear, startMonth, startDay, startHour, startMinute),
            end: new Date(endYear, endMonth, endDay, endHour, endMinute),
            color: formData.color,
            isOnSite: formData.isOnSite,
            room: formData.room,
            remoteLink: formData.remoteLink,
            isMilestone: formData.isMilestone,
            users: formData.sharedUsers.map(user => user.id),
        }

        return newEvent;
    }
    const onSubmit = async (fieldsValue) => {
        const newEvent = fillNewEvent(fieldsValue); //get rid of id
        if(isCreateEventOpen) {
            const createdEvent = await createEntry(newEvent)
            if(fieldsValue['files'])
            {
                console.log('created event', createdEvent)
                uploadFile({files: fieldsValue['files'], eventID: createdEvent._id})
            }

        }

        else
        {
            const createdEvent = await updateEntry(newEvent)
            if(fieldsValue['files'])
            {
                console.log('updated event id', createdEvent._id)
                uploadFile({files: fieldsValue['files'], eventID: createdEvent._id})
            }
        }

        form.resetFields()
        setIsCreateEventOpen(false);
        setIsUpdateEventOpen(false);
        //form.resetFields();
    }

    const onCancel = () => {
        form.resetFields()
        setIsCreateEventOpen(false);
        setIsUpdateEventOpen(false);
        console.log('create, updat:', isCreateEventOpen, isUpdateEventOpen)
    }

    const onDelete = (id) =>
    {
        form.resetFields()
        deleteEntry(id)
        setIsUpdateEventOpen(false);
        //form.resetFields();
    }
    //---------------------------------- helper functions -------------------------------------
    const transformMonth = (m) => {
        return (parseInt(m) - 1).toString().padStart(2, '0')
    }
    const onChangeDate = (e) => {
        const startYear = e.target.value[0].format('YYYY');
        const startMonth = transformMonth(e.target.value[0].format('MM'));
        const startDay = e.target.value[0].format('DD');
        const startHour = e.target.value[0].format('HH');
        const startMinute = e.target.value[0].format('mm');
        const endYear = e.target.value[1].format('YYYY');
        const endMonth = transformMonth(e.target.value[1].format('MM'));
        const endDay = e.target.value[1].format('DD');
        const endHour = e.target.value[1].format('HH');
        const endMinute = e.target.value[1].format('mm');

        setFormData((prevFormData) => ({
            ...prevFormData,
            start: new Date(startYear, startMonth, startDay, startHour, startMinute),
            end: new Date(endYear, endMonth, endDay, endHour, endMinute),
        }))
    }

    const onChangeParticipants = (selectedUserIds) => {
        if (selectedUserIds.length === 0) {
            message.error('Event needs at least one Participant')
        }
        setFormData((prevFormData) => ({
            ...prevFormData, sharedUsers: users.filter(user => selectedUserIds.includes(user.id))
        }));


        console.log('shared:', formData.sharedUsers)
    }

    const defFileList = () => {
        //console.log('file: ', event.files)
        if (event?.files) {
            return event.files.map(file => ({
                uid: file.fileRef,
                name: file.filename,
                status: 'done',
                url: `http://localhost:8000/calendar/files/${file.fileRef}`, // Construct the file URL
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
        }, openFileDialogOnClick: true,
           showPreviewIcon: true,
           defaultFileList: defFileList(),
           showUploadList: {
            showDownloadIcon: true,
            showRemoveIcon: true,
            downloadIcon: <DownloadOutlined/>,
            removeIcon: <DeleteOutlined onClick={(e) => console.log(e, 'custom removeIcon event')}/>,

        },
    };


    const onClickRemoteLink = () => {
        console.log('open meeting')
        if(formData.remoteLink)
        {
            window.open(formData.remoteLink, '_blank')
        }

        else {
            message.error('Please enter a URL.');
        }
    }


    return (<Modal open={isCreateEventOpen || isUpdateEventOpen} footer={null} closeIcon={false}>
        <Row>
            <h1>Details</h1>
        </Row>


        <Form layout={'vertical'} onFinish={onSubmit} form={form} ref={formRef} initialValues={getInitialFormValues()}>

            <Row gutter={[16, 0]}>
                <Col>
                    <Form.Item label={"Title"} name="title" >
                        <Input required placeholder={"Enter Title"} onChange={(e) => {
                            setFormData((prevFormData) => ({
                                ...prevFormData, title: e.target.value
                            }))
                        }}/>
                    </Form.Item>
                </Col>

                <Col>
                    <Form.Item label={' '} name="color" >
                        <ColorPicker disabledAlpha onChange={(color) => {
                            setFormData((prevFormData) => ({
                                ...prevFormData, color: color.toHexString()
                            }))
                        }}
                                     presets={[{
                                         label: 'Recommended',
                                         colors: ['#F5222D', '#FA8C16', '#FADB14', '#8BBB11', '#52C41A', '#13A8A8', '#1677FF', '#2F54EB', '#722ED1', '#EB2F96',],
                                     }]}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 0]}>
                <Form.Item label={"Date"} name="rangepicker">
                    <RangePicker format="DD.MM.YYYY HH:mm" showTime={{format: 'HH:mm'}} required></RangePicker>
                </Form.Item>
            </Row>

            <Row gutter={[16, 0]}>
                <Form.Item name='files'>
                    <Upload {...uploadProps} beforeUpload={beforeUpload} onRemove={onRemoveUpload} maxCount={10}
                            multiple={true}>
                        <Button icon={<UploadOutlined/>}>Upload</Button>
                    </Upload>
                </Form.Item>
            </Row>

            <Form.Item name="params" type="hidden"
                       initialValue={{isNew: isUpdateEventOpen, id: event?.id, allDay: event?.allDay, event: event}}>
                <input type={'hidden'}/>
            </Form.Item>

            <Row gutter={[16, 0]}>
                <Col>
                    <Form.Item name={'sharedUsers'}>
                        <Select required maxTagCount={0} fieldNames={{label: 'name', value: 'id'}}
                                maxTagPlaceholder={'Add Participants'}
                                placeholder="Add Participants" mode="tags" allowClear={false} options={users}
                                onChange={onChangeParticipants} style={{width: 200}}/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 0]}>
                <Col>
                    <AvatarDisplay selectedUsers={formData.sharedUsers}></AvatarDisplay>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Item name={'isOnSite'}>
                        <Switch checked={formData.isOnSite} checkedChildren={'On Site'} unCheckedChildren={'Remote'}
                                onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, isOnSite: e
                                    }))
                                }}/>
                    </Form.Item>
                </Col>
            </Row>

            {formData.isOnSite && <Row>
                <Col>
                    <Form.Item label={'Room'} name={'room'}>
                        <Space.Compact style={{width: '100%'}}>
                            <Input defaultValue={formData.room} placeholder="Room ID" onChange={(event) => {
                                setFormData((prevFormData) => ({
                                    ...prevFormData, room: event.target.value
                                }))
                            }}/>
                        </Space.Compact>
                    </Form.Item>
                    <Image width={400} src={`https://nav.tum.de/api/preview/${formData.room}`}
                           fallback={fallbackImgRoomfinder}/>

                </Col>
            </Row>}

            {!formData.isOnSite && <Row>
                <Col>
                    <Form.Item name={'remoteLink'} label={'Link'}>
                        <Space.Compact style={{width: '100%'}}>
                            <Input placeholder={'Insert Meeting Link'}
                                   defaultValue={formData.remoteLink} onChange={(event) => {
                                setFormData((prevFormData) => ({
                                    ...prevFormData, remoteLink: event.target.value
                                }))
                            }}/>
                            <Button onClick={onClickRemoteLink}>Open Meeting</Button>
                        </Space.Compact>
                    </Form.Item>
                </Col>
            </Row>}

            <Row>
                <Col>
                    <Form.Item name={'isMilestone'}>
                        <Switch checked={formData.isMilestone} checkedChildren={'Milestone'} unCheckedChildren={'Regular'}
                                onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, isMilestone: e
                                    }))
                                }}/>
                    </Form.Item>
                </Col>
            </Row>

            <Row justify={'end'} gutter={[16, 0]}>

                <Col>
                    {isUpdateEventOpen && <Button type='primary' icon={<DeleteOutlined/>} onClick={() => {
                        onDelete(event.id)
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
/*
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
    const users = fieldsValue['sharedUsers'] ? fieldsValue['sharedUsers'] : [currUserId]
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
*/

const AvatarDisplay = ({selectedUsers}) => {
    return (<Avatar.Group>
        {selectedUsers.map(user => (<Avatar key={user.id} style={{backgroundColor: user.color, color: 'white'}}>
            {user.initialen}
        </Avatar>))}
    </Avatar.Group>);
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

