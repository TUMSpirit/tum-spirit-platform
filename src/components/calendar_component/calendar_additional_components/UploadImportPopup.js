import moment from "moment/moment";
import {Button, ColorPicker, Form, Input, Upload, message} from "antd";
import dayjs from "dayjs";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import './UploadImportPopup.css'
import React, {useState} from "react";
import Papa from 'papaparse'
import {func, object} from "prop-types";
import {useCreateEntries} from "../requests/requestFunc";



const UploadImportPopup = ({ onCancel,setIsUploadImportPopupOpen}) => {
    const {mutateAsync: createEntry} = useCreateEntries()
    const [data, setData] = useState([])

    //Parse csv into array
    const onClickUpload = (fileContent) => {
        if (fileContent) {

            const [keys, ...rest] = fileContent.target.result
                .trim()
                .split("\n")
                .map((item) => item.replace(/['"]/g, '').split(';'));

            const formedArr = rest.map((item) => {
                const object = {};
                keys.forEach((key, index) => (object[key] = item.at(index)));
                return object;
            });

            //create calendar entrys from events and store them

            //console.log(formedArr[0].TITEL)
            //console.log((formedArr))
            formedArr.forEach((tumEntry) => {
                console.log(tumEntry)
                const [day, month, year] = tumEntry.DATUM.split(".");
                const [hourVon, minuteVon] = tumEntry.VON.split(":");
                const [hourBis, minuteBis] = tumEntry.BIS.split(":");
                const calendarEntry = {
                    "title": tumEntry.TITEL,
                    start: new Date(year, month - 1, day, hourVon, minuteVon),
                    end: new Date(year, month - 1, day, hourBis, minuteBis),
                    color: '#1677FF',
                    allDay: false,
                }
                createEntry(calendarEntry)
            })

            setIsUploadImportPopupOpen(false)
        }
        else
        {
            //message.error('No file selected')
        }
    }

    const [uploadFileContent, setUploadFileContent] = useState()
    //console.log('initialValues: ', initialValues)
    return (
        <div className="popup-container">
            <div className="popup">
                <Form >
                <Form.Item name='file' valuePropName="fileList" rules={[{required: true, message:'please add a file'}]}>
                    <div className={'upload'}>
                    <Upload action="/upload.do" listType="picture-card" maxCount={1} accept=".txt, .csv"
                            beforeUpload={file => {
                                const reader = new FileReader();

                                reader.onload = e => {
                                    //console.log(e.target.result);
                                    setUploadFileContent(e)
                                };
                                reader.readAsText(file);

                                // Prevent upload
                                return false
                            }}>
                        <div >
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Upload>
                    </div>
                </Form.Item>
                <div className={"formButtons"}>
                    <Button type="primary" htmlType={"submit"} onClick={() => {onClickUpload(uploadFileContent)}}>Save</Button>


                    <Button onClick={onCancel}>Cancel</Button>
                </div>
                </Form>
            </div>
        </div>
    );
};

export default UploadImportPopup