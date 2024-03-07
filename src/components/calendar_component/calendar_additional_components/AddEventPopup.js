// Popup.js
import React, {useEffect, useRef, useState} from 'react';
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
    Image,
    Switch,
    Radio , TimePicker
} from "antd";
import './AddEventPopup.css';
import dayjs from "dayjs";
import {
    DeleteOutlined,
    DownloadOutlined,
    QuestionCircleOutlined,
    QuestionOutlined,
    UploadOutlined
} from "@ant-design/icons";
import moment from "moment";
import {
    useCreateEntries, useDeleteEntries, useDeleteFile, useUpdateEntries, useUploadFile
} from "../requests/requestFunc";
import TextArea from "antd/es/input/TextArea";
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
        textArea: isUpdateEventOpen ? event.textArea : '',
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
            textArea: formData.textArea,
            sharedUsers: formData.sharedUsers.map(user => user.id),
            datepickerStart: dayjs(formData.start),
            timepickerStart: dayjs(formData.start),
            datepickerEnd: dayjs(formData.end),
            timepickerEnd: dayjs(formData.end)
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
        console.log('formdata: ', formData.isOnSite)
        let color = fieldsValue['colorPicker'];


        const startYear = fieldsValue["datepickerStart"].format('YYYY');
        const startMonth = transformMonth(fieldsValue["datepickerStart"].format('MM'));

        const startDay = fieldsValue["datepickerStart"].format('DD');
        const startHour = fieldsValue["timepickerStart"].format('HH');
        const startMinute = fieldsValue["timepickerStart"].format('mm');
        const endYear = fieldsValue["datepickerEnd"].format('YYYY');
        const endMonth = transformMonth(fieldsValue["datepickerEnd"].format('MM'));
        const endDay = fieldsValue["datepickerEnd"].format('DD');
        const endHour = fieldsValue["timepickerEnd"].format('HH');
        const endMinute = fieldsValue["timepickerEnd"].format('mm');
        console.log('users: ', users)
        const newEvent = {
            id: formData.id,
            title: formData.title,
            start: new Date(startYear, startMonth, startDay, startHour, startMinute),
            end: new Date(endYear, endMonth, endDay, endHour, endMinute),
            color: formData.color,
            textArea: formData.textArea,
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
            if(newEvent.start > newEvent.end)
            {
                message.error('End Date must be greater than Start Date')
            }

            else {
                if (isCreateEventOpen) {
                    console.log('new event', newEvent)
                    const createdEvent = await createEntry(newEvent)
                    console.log('created event', createdEvent)
                    if (fieldsValue['files']) {
                        uploadFile({files: fieldsValue['files'], eventID: createdEvent._id})
                    }

                } else {
                    const createdEvent = await updateEntry(newEvent)
                    if (fieldsValue['files']) {
                        console.log('updated event id', createdEvent._id)
                        uploadFile({files: fieldsValue['files'], eventID: createdEvent._id})
                    }
                }

                form.resetFields()
                setIsCreateEventOpen(false);
                setIsUpdateEventOpen(false);
                //form.resetFields();
            }
    }

    const onCancel = () => {
        form.resetFields()
        setIsCreateEventOpen(false);
        setIsUpdateEventOpen(false);
        console.log('create, updat:', isCreateEventOpen, isUpdateEventOpen)
    }

    const onDelete = (id) => {
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
        if (isUpdateEventOpen) {
            //console.log('file: ', event.files)
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
        const isLt16M = file.size / 1024 / 1024 < 16;
        if (!isLt16M) {
            message.error('File must smaller than 16MB!');
        }
        return isLt16M;
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
        }, openFileDialogOnClick: true, showPreviewIcon: true, defaultFileList: defFileList(), showUploadList: {
            showDownloadIcon: true,
            showRemoveIcon: true,
            downloadIcon: <DownloadOutlined/>,
            removeIcon: <DeleteOutlined onClick={(e) => console.log(e, 'custom removeIcon event')}/>,

        },
    };


    const onClickRemoteLink = () => {
        console.log('open meeting')
        if (formData.remoteLink) {
            window.open(formData.remoteLink, '_blank')
        } else {
            message.error('Please enter a URL.');
        }
    }


    return (


        <Modal open={isCreateEventOpen || isUpdateEventOpen} closeIcon={false} title={"Details"}
               className={'modal-addEvent'}
               footer={[
                   isUpdateEventOpen && (<Button data-testid='deleteEventButton' type='primary' onClick={() => onDelete(event.id)} icon={<DeleteOutlined/>}/>),
                   <Button onClick={onCancel}>Cancel</Button>,
                   <Button data-testid='saveEventButton' key="submit" type='primary' onClick={form.submit}>Save</Button>
               ]}
        >

            <Form layout={'vertical'} onFinish={onSubmit} form={form} ref={formRef}
                  initialValues={getInitialFormValues()} requiredMark={false} >
                <Row gutter={[32, 16]}>
                    <Col span={12}>
                        <Row gutter={[0, 16]}>
                            <Form.Item rules={[{ required: true, message: 'This field is required' }]} label={"Title"} name="title">
                                <Input data-testid='titleInput' required placeholder={"Enter Title"} onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, title: e.target.value
                                    }))
                                }}/>
                            </Form.Item>

                            <Form.Item label={' '} name="color" style={{marginLeft: '2px'}}>
                                <ColorPicker size={'large'} disabledAlpha onChange={(color) => {
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
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col>
                            <Form.Item label={"Start"}  name="datepickerStart">
                                <DatePicker format="DD.MM.YYYY" placeholder={"start date"}></DatePicker>
                            </Form.Item>
                            </Col>

                            <Col>
                                <Form.Item label={' '}   name="timepickerStart">
                                    <TimePicker format="HH:mm" placeholder={"start time"}></TimePicker>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col>
                                <Form.Item label={"End"}  name="datepickerEnd">
                                    <DatePicker format="DD.MM.YYYY" placeholder={"end date"}></DatePicker>
                                </Form.Item>
                            </Col>

                            <Col>
                                <Form.Item label={' '}   name="timepickerEnd">
                                    <TimePicker format="HH:mm" placeholder={"end time"}></TimePicker>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row className={'row-upload'} gutter={[0, 16]}>
                            <Form.Item name={'textArea'} label="TextArea">
                                <TextArea rows={4} onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, textArea: e.target.value
                                    }))
                                }}/>
                            </Form.Item>

                            <Form.Item name='files'>
                                <Upload {...uploadProps} beforeUpload={beforeUpload} onRemove={onRemoveUpload}
                                        maxCount={10}
                                        multiple={true}>
                                    <Button icon={<UploadOutlined/>}>Upload</Button>
                                </Upload>
                            </Form.Item>
                        </Row>

                        <Row className={'row-participants'} >
                            <Form.Item name={'sharedUsers'} style={{marginBottom: '8px'}}>
                                <Select required maxTagCount={0} fieldNames={{label: 'name', value: 'id'}}
                                        maxTagPlaceholder={'Add Participants'}
                                        placeholder="Add Participants" mode="tags" allowClear={false} options={users}
                                        onChange={onChangeParticipants} style={{width: 200}}/>
                            </Form.Item>

                            <AvatarDisplay selectedUsers={formData.sharedUsers}></AvatarDisplay>
                        </Row>

                        <Row>

                        </Row>

                    </Col>


                    <Col span={12}>
                        <div className='inset-shadow'>
                        <Row gutter={[0, 16]}>
                            <Form.Item label={'Location'} name={'isOnSite'}>
                                <Radio.Group defaultValue={formData.isOnSite? 'onSite' : 'remote'} onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, isOnSite: !(formData.isOnSite)
                                    }))
                                }}>
                                    <Radio.Button value={'onSite'}>On Site</Radio.Button>
                                    <Radio.Button value={'remote'}>Remote</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Row>

                        {formData.isOnSite && <Row className={'row-navigate'} >
                            <Form.Item label={'Room'} name={'room'}>
                                <Space.Compact style={{width: '100%'}}>
                                    <Input data-testid='roomNumberInput' defaultValue={formData.room} placeholder="Room ID" onChange={(event) => {
                                        setFormData((prevFormData) => ({
                                            ...prevFormData, room: event.target.value
                                        }))
                                    }}/>
                                </Space.Compact>
                            </Form.Item>
                            <Image width={400} src={`https://nav.tum.de/api/preview/${formData.room}`}
                                   fallback={fallbackImgRoomfinder}/>
                        </Row>}

                        {!formData.isOnSite && <Row>

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
                        </Row>}
                    </div>

                        <Row >
                            <Form.Item name={'isMilestone'}>
                                <Switch data-testid='milestoneSwitch' checked={formData.isMilestone} checkedChildren={'Milestone'} unCheckedChildren={'Regular'}
                                        onChange={(e) => {
                                            setFormData((prevFormData) => ({
                                                ...prevFormData, isMilestone: e
                                            }))
                                        }}/>
                            </Form.Item>
                        </Row>
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

