// Popup.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    Radio, TimePicker, Tooltip
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
import axios from 'axios';
//import {useDeleteEntries, useUpdateEntries} from "../requests/requestFunc";

const fallbackImgRoomfinder = require('../img/Room not found.png')
const { RangePicker } = DatePicker


const AddEventPopup = ({
    isCreateEventOpen,
    isUpdateEventOpen,
    setIsCreateEventOpen,
    setIsUpdateEventOpen,
    event,
    users,
    currentUser,
    startDate,
    endDate,
    fileList
}) => {


    const init_formData = {
        id: isUpdateEventOpen ? event.id : undefined,
        title: isUpdateEventOpen ? event.title : '',
        start: startDate ? moment(startDate) : isUpdateEventOpen ? event.start : moment(),
        end: endDate ? moment(endDate) : isUpdateEventOpen ? event.end : moment().add(1, 'hour'),
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
    const [isLocationHelpOpen, setIsLocationHelpOpen] = useState(false)
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const [isMensaModalVisible, setIsMensaModalVisible] = useState(false);

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

    const [selectedFiles, setSelectedFiles] = useState([]); // State to track selected files

    const handleFileSelection = (value) => {
        setSelectedFiles(value);
    };


    const { mutateAsync: createEntry } = useCreateEntries()
    const { mutateAsync: updateEntry } = useUpdateEntries()
    const { mutateAsync: deleteEntry } = useDeleteEntries()
    const { mutateAsync: deleteFile } = useDeleteFile()
    const { mutateAsync: uploadFile } = useUploadFile()

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
        if (newEvent.start > newEvent.end) {
            message.error('End Date must be greater than Start Date')
        }

        else {
            if (isCreateEventOpen) {
                console.log('new event', newEvent)
                const createdEvent = await createEntry(newEvent)
                console.log('created event', createdEvent)
                if (fieldsValue['files']) {
                    uploadFile({ files: fieldsValue['files'], eventID: createdEvent._id })
                }

            } else {
                const createdEvent = await updateEntry(newEvent)
                if (fieldsValue['files']) {
                    console.log('updated event id', createdEvent._id)
                    uploadFile({ files: fieldsValue['files'], eventID: createdEvent._id })
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

    // Function to open the Mensa Meal Plan modal
    const openMensaPlan = () => {
        setIsMensaModalVisible(true);
    };

    // Function to close the Mensa Meal Plan modal
    const handleMensaModalCancel = () => {
        setIsMensaModalVisible(false);
    };

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
                url: `/calendar/files/${file.fileRef}`, // Construct the file URL
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
        deleteFile({ eventId: event.id, fileId: file.uid })
    }

    const uploadProps = {
        onChange({ file, fileList }) {
            if (file.status !== 'uploading') {
                //console.log(file, fileList);
            }
        }, openFileDialogOnClick: true, showPreviewIcon: true, defaultFileList: defFileList(), showUploadList: {
            showDownloadIcon: true,
            showRemoveIcon: true,
            downloadIcon: <DownloadOutlined />,
            removeIcon: <DeleteOutlined onClick={(e) => console.log(e, 'custom removeIcon event')} />,

        },
    };


    const onClickRemoteLink = () => {
        console.log('open meeting');
        console.log(formData.remoteLink);
        if (formData.remoteLink) {
            window.open(formData.remoteLink, '_blank')
        } else {
            message.error('Please enter a URL.');
        }
    }

    const onRoomChange = useCallback(async (event) => {
        const newRoom = event.target.value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            room: newRoom,
        }));
        // Update the local state

        // Make the Axios request
        try {
            //setLoading(true);
            //setError(null); // Reset error state before making request

            const response = await axios.get(`https://nav.tum.de/api/search?q=${newRoom}`);
            // Handle response data as needed
            console.log(response.data);
            if (response.data.sections[0].entries.length) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    room: response.data.sections[0].entries[0].id,
                }));
            } else {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    room: newRoom,
                }));
            }
        } catch (err) {
            //setError(err);
            console.error(err);
        } finally {
            //setLoading(false);
        }
    }, []);

    return (


        <Modal open={isCreateEventOpen || isUpdateEventOpen} title={"Details"} onCancel={onCancel}
            className={'modal-addEvent'}
            footer={[
                isUpdateEventOpen && (<Button data-testid='deleteEventButton' type='primary' onClick={() => onDelete(event.id)} icon={<DeleteOutlined />} />),
                <Button onClick={onCancel}>Cancel</Button>,
                <Button data-testid='saveEventButton' key="submit" type='primary' onClick={form.submit}>Save</Button>
            ]}
        >

            <Form layout={'vertical'} onFinish={onSubmit} form={form} ref={formRef}
                initialValues={getInitialFormValues()} requiredMark={false} >
                <Row gutter={[32, 16]}>
                    <Col lg={12} md={24}>
                        <Row gutter={[0, 16]}>
                            <Form.Item rules={[{ required: true, message: 'This field is required' }]} label={"Title"} name="title">
                                <Input data-testid='titleInput' required placeholder={"Enter Title"} onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, title: e.target.value
                                    }))
                                }} />
                            </Form.Item>

                            <Form.Item label={' '} name="color" style={{ marginLeft: '2px' }}>
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
                                <Form.Item label={"Start"} name="datepickerStart">
                                    <DatePicker format="DD.MM.YYYY" placeholder={"start date"}></DatePicker>
                                </Form.Item>
                            </Col>

                            <Col>
                                <Form.Item label={' '} name="timepickerStart">
                                    <TimePicker format="HH:mm" placeholder={"start time"} needConfirm={false}></TimePicker>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col>
                                <Form.Item label={"End"} name="datepickerEnd">
                                    <DatePicker format="DD.MM.YYYY" placeholder={"end date"}></DatePicker>
                                </Form.Item>
                            </Col>

                            <Col>
                                <Form.Item label={' '} name="timepickerEnd">
                                    <TimePicker format="HH:mm" placeholder={"end time"} needConfirm={false}></TimePicker>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row className={'row-upload'} gutter={[0, 16]}>
                            <Form.Item name={'textArea'} label="Info">
                                <TextArea rows={4} onChange={(e) => {
                                    setFormData((prevFormData) => ({
                                        ...prevFormData, textArea: e.target.value
                                    }))
                                }} />
                            </Form.Item>
                        </Row>

                        <Row className={'row-participants'} >
                            <Form.Item name={'sharedUsers'} style={{ marginBottom: '8px' }}>
                                <Select required maxTagCount={0} fieldNames={{ label: 'name', value: 'id' }}
                                    maxTagPlaceholder={'Add Participants'}
                                    placeholder="Add Participants" mode="tags" allowClear={false} options={users}
                                    onChange={onChangeParticipants} style={{ width: 200 }} />
                            </Form.Item>

                            <AvatarDisplay selectedUsers={formData.sharedUsers}></AvatarDisplay>
                        </Row>

                        <Row>

                        </Row>

                    </Col>


                    <Col lg={12} md={24}>
                        <div className='inset-shadow'>
                            <Row gutter={[0, 16]}>
                                <Col>
                                    <Form.Item label={'Location'} name={'isOnSite'}>
                                        <Radio.Group defaultValue={formData.isOnSite ? 'onSite' : 'remote'} onChange={(e) => {
                                            setFormData((prevFormData) => ({
                                                ...prevFormData, isOnSite: !(formData.isOnSite)
                                            }))
                                        }}>
                                            <Radio.Button value={'onSite'}>On Site</Radio.Button>
                                            <Radio.Button value={'remote'}>Remote</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>

                                <Col style={{ marginLeft: '30%' }}>
                                    <Tooltip title={'Can\'t decide remote/online?'}>
                                        <Button style={{ position: 'absolute', width: '30px', height: '30px', justifyContent: 'center', alignItems: 'center', padding: '0', display: 'flex' }} data-testid='deleteEventButton' shape={'circle'} onClick={() => setIsLocationHelpOpen(true)} icon={<QuestionOutlined />} />
                                    </Tooltip>

                                    <Modal title={'Location'} open={isLocationHelpOpen} footer={<Button type='primary' onClick={() => { setIsLocationHelpOpen(false) }}>ok</Button>}>
                                        In the initial phase of the project, you should mainly plan on-site meetings to strengthen team building. Later on, you can also schedule more and more remote meetings
                                    </Modal>

                                </Col>
                            </Row>

                            {formData.isOnSite && <Row className={'row-navigate'} >
                                <Form.Item label={'Room'} name={'room'}>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input data-testid='roomNumberInput' defaultValue={formData.room} placeholder="Room ID" onChange={onRoomChange}
                                        />
                                    </Space.Compact>
                                </Form.Item>
                                <Image width={400} src={`https://nav.tum.de/api/locations/${formData.room}/preview`}
                                    fallback={fallbackImgRoomfinder} />
                            </Row>}

                            {!formData.isOnSite && <Row>

                                <Form.Item name={'remoteLink'} label={'Link'}>
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input placeholder={'Insert Meeting Link'}
                                            defaultValue={formData.remoteLink} onChange={(event) => {
                                                setFormData((prevFormData) => ({
                                                    ...prevFormData, remoteLink: event.target.value
                                                }))
                                            }} />
                                        <Button onClick={onClickRemoteLink}>Open Meeting</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Row>}
                        </div>

                        <Row >
                            <Form.Item name={'isMilestone'} label={'Meeting Type'}>
                                <Row align="middle">
                                    <Col flex="none">
                                        <span style={{ marginRight: 8 }}>Regular</span>
                                    </Col>
                                    <Col flex="auto">
                                        <Switch
                                            data-testid='milestoneSwitch'
                                            checked={formData.isMilestone}
                                            onChange={(e) => {
                                                setFormData((prevFormData) => ({
                                                    ...prevFormData, isMilestone: e
                                                }))
                                            }}
                                        />
                                    </Col>
                                    <Col flex="none">
                                        <span style={{ marginLeft: 8 }}>Milestone</span>
                                    </Col>
                                </Row>
                                <Row >
                                    <Button icon={<QuestionCircleOutlined />}
                                        style={{ marginTop: 16 }} onClick={openMensaPlan}>
                                    Lunch Meeting?
                                    </Button>
                                </Row>
                            </Form.Item>
                        </Row>
                    </Col>
                </Row>
            </Form>
            <Modal
                title="Mensa Meal Plan"
                open={isMensaModalVisible}
                onCancel={handleMensaModalCancel}
                footer={null}  // No footer to keep it clean
                width={800}    // Adjust as needed
                bodyStyle={{ height: '600px', padding: 0 }}  // Adjust height
            >
                {/* Iframe for the mensa meal plan */}
                <iframe
                    src="https://www.studierendenwerk-muenchen-oberbayern.de/mensa/speiseplan/speiseplan_422_-de.html#heute"  // Replace with actual mensa meal plan URL
                    width="100%"
                    height="100%"
                    title="Mensa Meal Plan"
                />
            </Modal>
        </Modal>);

};

export default AddEventPopup;


const AvatarDisplay = ({ selectedUsers }) => {
    return (<Avatar.Group>
        {selectedUsers.map(user => (<Avatar key={user.id} style={{ backgroundColor: user.color, color: 'white' }}>
            {user.initialen}
        </Avatar>))}
    </Avatar.Group>);
};

/*        

           
                          <Form.Item label="Attach Files">
                          <Select
                            mode="multiple"
                            placeholder="Select files to attach"
                            value={selectedFiles}
                            onChange={handleFileSelection}
                          >
                            {fileList.map((file) => (
                              <Select.Option key={file.file_id} value={file.file_id}>
                                {file.filename}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>



                                  <Form.Item name='files'>
                                <Upload {...uploadProps} beforeUpload={beforeUpload} onRemove={onRemoveUpload}
                                    maxCount={10}
                                    multiple={true}>
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
                            </Form.Item>


<Switch data-testid='milestoneSwitch' checked={formData.isMilestone} checkedChildren={'Milestone'} unCheckedChildren={'Regular'}
                                    onChange={(e) => {
                                        setFormData((prevFormData) => ({
                                            ...prevFormData, isMilestone: e
                                        }))
                                    }} />
                                    ALTERNATIVER SWITCH


                                    
                                    */