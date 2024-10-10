import {Button, Modal, Radio, Space} from "antd";
import {CalendarOutlined, PlusOutlined, RightOutlined, UnorderedListOutlined} from "@ant-design/icons";
import {LeftOutlined} from "@ant-design/icons";
import {UploadOutlined} from "@ant-design/icons";
import {Calendar, Navigate as navigate} from "react-big-calendar";
import React, {useEffect, useState} from "react";
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
    const [openExpandModal, setOpenExpandModal] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 650)
    const onOpenAddEvent = () =>
    {
        setIsAddEventPopupOpen(true);
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 650);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

                <div>
                    {!isMobile && <Radio.Group buttonStyle={"solid"} options={views} optionType={"button"} onChange={onChangeView} value={view}></Radio.Group>}
                    {isMobile && <Button type={'primary'}  onClick={() => setOpenExpandModal(true)}><CalendarOutlined /></Button>}
                </div>
                <div>
                    <Button data-testid='navigate-left' icon={<LeftOutlined />} onClick={() => onNavigate(navigate.PREVIOUS)} type={"text"}></Button>
                    {label}
                    <Button icon={<RightOutlined />} onClick={() => onNavigate(navigate.NEXT)} type={"text"}></Button>
                </div>
                <div>
                    {/*!isMobile && <Button type={"primary"} style={{marginRight: "10px"}} onClick={() => {setIsTimelineOpen(!isTimelineOpen)}} icon={<UnorderedListOutlined />}></Button>*/}
                    {!isMobile && <Button data-testid='openImportButton' type={"primary"} onClick={onOpenUploadImportPopup} style={{marginRight: "10px"}} icon={<UploadOutlined />}></Button>}
                    <Button data-testid='addEventButton'  type={"primary"} onClick={onOpenAddEvent}>{isMobile?<PlusOutlined/>:'+ add Event'}</Button>
                </div>
            </div>
            <Modal title={'View'} open={openExpandModal} footer={null} onCancel={() => setOpenExpandModal(false)} closable={true}>
                <Radio.Group style={{ width: '100%' }} buttonStyle={"solid"} optionType={"button"} onChange={onChangeView} value={view}>
                    <Space style={{ width: '100%', textAlign: 'left' }} direction="vertical">
                        <Radio style={{ width: '100%', textAlign: 'left' }} value={'month'}>month</Radio>
                        <Radio style={{ width: '100%', textAlign: 'left' }} value={'week'}>week</Radio>
                        <Radio style={{ width: '100%', textAlign: 'left' }} value={'day'}>day</Radio>
                    </Space>
                </Radio.Group>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                   {/* <Button type={"primary"}  onClick={() => {setIsTimelineOpen(!isTimelineOpen)}} icon={<UnorderedListOutlined />}></Button>*/}
                    <Button data-testid='openImportButton' type={"primary"} onClick={onOpenUploadImportPopup}  icon={<UploadOutlined />}></Button>
                </div>
            </Modal>
        </div>
    )}



export default CustomToolbar