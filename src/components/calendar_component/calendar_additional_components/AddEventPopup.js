// Popup.js
import React from 'react';
import {Button, Form, Input, DatePicker, ColorPicker} from "antd";
import './AddEventPopup.css';
import dayjs from "dayjs";
import {DeleteOutlined} from "@ant-design/icons";
import moment from "moment";
import {useDeleteEntries, useUpdateEntries} from "../requests/requestFunc";

const {RangePicker} = DatePicker

const AddEventPopup = ({ onCancel, onFinish, isNew, event, deleteEntry }) => {
    const initialValues = {
        title: event?.title || '',
        start: event?.start || moment(),
        end: event?.end || moment().add(1, 'hour'),
        color: event?.color || '#1677FF',
    }
    //console.log('initialValues: ', initialValues)
    return (
        <div className="popup-container">
            <div className="popup">
                <div className={'eventPopupLeftRight'}>
                <Form layout={'vertical'} onFinish={onFinish} >
                    <div className={'title'}>
                    <Form.Item name="eventTitle" initialValue={initialValues.title}>
                        <Input required placeholder={"Title"}></Input>
                    </Form.Item>

                    <Form.Item name={'colorPicker'} initialValue={initialValues.color}>
                        <ColorPicker  disabledAlpha presets={[
                            {
                                label: 'Recommended',
                                colors: [
                                    '#F5222D',
                                    '#FA8C16',
                                    '#FADB14',
                                    '#8BBB11',
                                    '#52C41A',
                                    '#13A8A8',
                                    '#1677FF',
                                    '#2F54EB',
                                    '#722ED1',
                                    '#EB2F96',
                                ],
                            }
                        ]}/>
                    </Form.Item>
                    </div>

                    <Form.Item label={"Date"} name="rangepicker" initialValue={[dayjs(initialValues.start), dayjs(initialValues.end)]}>
                        <RangePicker  format="DD.MM.YYYY HH:mm" showTime={{ format: 'HH:mm' }} required></RangePicker>
                    </Form.Item>

                    <Form.Item name="params" type="hidden" initialValue={{isNew: isNew, id: event?.id, allDay: event?.allDay}} >
                        <input type={'hidden'}/>
                    </Form.Item>

                    <div>
                        <div className={"formButtons"}>
                            <Form.Item>
                                <Button type="primary" htmlType={"submit"}>Save</Button>
                            </Form.Item>
                            <Button onClick={onCancel}>Cancel</Button>
                            {
                               !isNew && <Button type='primary' icon={<DeleteOutlined/>} onClick={() => {deleteEntry(event.id)}}></Button>
                            }

                        </div>
                    </div>

                </Form>
                </div>

            </div>
        </div>
    );
};

export default AddEventPopup;

const transformMonth = (m) => {
    return (parseInt(m) - 1).toString().padStart(2, '0')
}
export const createEvent = (fieldsValue) => {
    let color = fieldsValue['colorPicker'];
    /*if (fieldsValue['colorPicker'] !== undefined) {
        color = fieldsValue['colorPicker'].toHexString()? fieldsValue['colorPicker'].toHexString() : fieldsValue['colorPicker'];
    }*/

    if(typeof color !== "string")
    {
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
    const id = fieldsValue['params'].id? fieldsValue['params'].id:undefined;
    const newEvent = {
        id: id,
        title: fieldsValue["eventTitle"],
        start: new Date(startYear, startMonth, startDay, startHour, startMinute),
        end: new Date(endYear, endMonth, endDay, endHour, endMinute),
        color: color

    }
    return newEvent;
}


