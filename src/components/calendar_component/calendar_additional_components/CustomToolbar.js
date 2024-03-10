import {Button, Radio} from "antd";
import {RightOutlined, UnorderedListOutlined} from "@ant-design/icons";
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
                           setIsUploadImportPopupOpen,
                            isTimelineOpen,
                            setIsTimelineOpen
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
                    <Button data-testid='navigate-left' icon={<LeftOutlined />} onClick={() => onNavigate(navigate.PREVIOUS)} type={"text"}></Button>
                    {label}
                    <Button icon={<RightOutlined />} onClick={() => onNavigate(navigate.NEXT)} type={"text"}></Button>
                </div>
                <div className="viewSwitch" >
                    <Button type={"primary"} style={{marginRight: "10px"}} onClick={() => {setIsTimelineOpen(!isTimelineOpen)}} icon={<UnorderedListOutlined />}></Button>
                    <Button data-testid='openImportButton' type={"primary"} onClick={onOpenUploadImportPopup} style={{marginRight: "10px"}} icon={<UploadOutlined />}></Button>
                    <Button data-testid='addEventButton' type={"primary"} onClick={onOpenAddEvent}>+ add Event</Button>
                </div>
            </div>
        </div>
    )}



export default CustomToolbar