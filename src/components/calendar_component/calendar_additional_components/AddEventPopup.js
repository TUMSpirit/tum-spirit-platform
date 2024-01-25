// Popup.js
import React, {useState} from 'react';
import {Button, Form, Input, DatePicker, ColorPicker, Upload, Modal, Row, Col, message} from "antd";
import './AddEventPopup.css';
import dayjs from "dayjs";
import {DeleteOutlined, DownloadOutlined, UploadOutlined} from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import {useDeleteFile, useUploadFile} from "../requests/requestFunc";
//import {useDeleteEntries, useUpdateEntries} from "../requests/requestFunc";

const {RangePicker} = DatePicker


const AddEventPopup = ({onCancel, onFinish, isNewOpen, event, deleteEntry, isExistingOpen}) => {

    const {mutateAsync: deleteFile} = useDeleteFile()

    const defFileList = () => {
        //console.log('file: ', event.files)
        if(event?.files)
        {
            return event.files.map(file => ({
            uid: file.fileRef,  // Use the file's ID as the unique identifier
            name: file.filename,  // File name
            status: 'done',
            url: `http://localhost:8000/calendar/files/${file.fileRef}`, // Construct the file URL (adjust as needed)
        }));
        }

        else{
            return null
        }

    };

    console.log('event aus popup: ', event)
    const uploadProps = {
        onChange({file, fileList}) {
            if (file.status !== 'uploading') {
                //console.log(file, fileList);
            }
        },
            defaultFileList: defFileList(),
            showUploadList: {
            showDownloadIcon: false,
            downloadIcon: <DownloadOutlined/>,
            showRemoveIcon: true,
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
                <Col span={24}>
                    <h1>Details</h1>
                </Col>
            </Row>

            <Form layout={'vertical'} onFinish={onFinish}>

                <Row>
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

                <Row>
                    <Form.Item label={"Date"} name="rangepicker"
                               initialValue={[dayjs(initialValues.start), dayjs(initialValues.end)]}>
                        <RangePicker format="DD.MM.YYYY HH:mm" showTime={{format: 'HH:mm'}} required></RangePicker>
                    </Form.Item>
                </Row>
                <Row>

                    <Form.Item name='files'>
                        <Upload {...uploadProps}  onRemove = {(file) => {console.log('id: ', file); deleteFile({eventId: event.id, fileId: file.uid})}} maxCount={10} multiple={true}>
                            <Button icon={<UploadOutlined/>}>Upload</Button>
                        </Upload>
                    </Form.Item>
                </Row>
                <Form.Item name="params" type="hidden"
                           initialValue={{isNew: isNewOpen, id: event?.id, allDay: event?.allDay}}>
                    <input type={'hidden'}/>
                </Form.Item>

                <Row>
                    <Col push={20}>
                        <Form.Item>
                            <Button type="primary" htmlType={"submit"}>Save</Button>
                        </Form.Item>
                    </Col>

                    <Col push={13}>
                        <Button onClick={onCancel}>Cancel</Button>
                    </Col>
                    <Col>
                        {!isNewOpen && <Button type='primary' icon={<DeleteOutlined/>} onClick={() => {
                            deleteEntry(event.id)
                        }}></Button>}
                    </Col>
                </Row>
            </Form>
        </Modal>);
};

export default AddEventPopup;

const transformMonth = (m) => {
    return (parseInt(m) - 1).toString().padStart(2, '0')
}
export const createEvent = (fieldsValue) => {
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
    const newEvent = {
        id: id,
        title: fieldsValue["eventTitle"],
        start: new Date(startYear, startMonth, startDay, startHour, startMinute),
        end: new Date(endYear, endMonth, endDay, endHour, endMinute),
        color: color
    }
    return newEvent;
}

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

