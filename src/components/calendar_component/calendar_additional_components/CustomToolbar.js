import {Button, Radio} from "antd";
import {RightOutlined} from "@ant-design/icons";
import {LeftOutlined} from "@ant-design/icons";
import {UploadOutlined} from "@ant-design/icons";
import {Calendar, Navigate as navigate} from "react-big-calendar";
import React, {useState} from "react";
import './CustomToolbar.css'



const viewsOptions = [
    {label: "Month", value: "Month"},
    {label: "Week", value: "Week"},
    {label: "Day", value: "Day"}
]






const CustomToolbar = ({
                           label,
                           localizer: { messages },
                           onNavigate,
                           onView,
                           view,
                           views,
                           setIsAddEventPopupOpen,
                           setIsUploadImportPopupOpen
                       }) =>
{
    const [viewHook, setViewHook] = useState(views[0]);
    const onOpenAddEvent = () =>
    {
        setIsAddEventPopupOpen(true);
    }

    const onOpenUploadImportPopup = () => {
        setIsUploadImportPopupOpen(true)
    }
    const onChangeView = ({ target: { value } }) => {
        console.log('view checked', value);
        onView(value);
        setViewHook(value);}
    return(
        <div>
            <div className="toolbarWrapper">
                <div className="viewSwitch"><Radio.Group buttonStyle={"solid"} options={views} optionType={"button"} onChange={onChangeView} value={view}></Radio.Group></div>
                <div >
                    <Button icon={<LeftOutlined />} onClick={() => onNavigate(navigate.PREVIOUS)} type={"text"}></Button>
                    {label}
                    <Button icon={<RightOutlined />} onClick={() => onNavigate(navigate.NEXT)} type={"text"}></Button>
                </div>
                <div className="viewSwitch" >
                    <Button type={"primary"} onClick={onOpenUploadImportPopup} style={{marginRight: "10px"}} icon={<UploadOutlined />}></Button>
                    <Button type={"primary"} onClick={onOpenAddEvent}>+ add Event</Button>
                </div>
            </div>
        </div>



    /*<div>
        <h1 className="viewSwitch">
            <div className="viewSwitch"><Radio.Group options={viewsOptions} optionType={"button"}></Radio.Group></div>
            <div >
                <Button icon={<LeftOutlined />} onClick={onNavigate(navigate.PREVIOUS)} type={"text"}></Button>
                December
                <Button icon={<RightOutlined />} type={"text"}></Button>
            </div>
            <div className="viewSwitch" >
                <Button type={"primary"} style={{marginRight: "10px"}} icon={<UploadOutlined />}></Button>
                <Button type={"primary"}>+ add Event</Button>
            </div>
        </h1>
    </div>*/
    )}



export default CustomToolbar