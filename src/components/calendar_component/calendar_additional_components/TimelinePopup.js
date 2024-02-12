
import {Button, ColorPicker, Form, Input, Upload, message, Modal} from "antd";

import './UploadImportPopup.css'
import React, {useState} from "react";


const TimelinePopup = ({ isTimelineOpen, setIsTimelineOpen}) => {


    //Parse csv into array

    //console.log('initialValues: ', initialValues)
    return (
       <Modal open={isTimelineOpen} onCancel={() => {setIsTimelineOpen(false)}}></Modal>
    );
};

export default TimelinePopup