
import {Button, Modal, Steps} from "antd";

import './UploadImportPopup.css'
import React, {useState} from "react";
import AddEventPopup from "./AddEventPopup";
import {lighten } from 'polished'
import {momentLocalizer} from "react-big-calendar";


const TimelinePopup = ({isTimelineOpen, setIsTimelineOpen, events, users, currentUser}) => {
    const milestones = events?.filter(event => event.isMilestone).sort((a, b) => a.start -  b.start)

    const findCurrent = () => {
        //console.log(milestones)
        if(milestones) {
            let i = 0
            const currentDate = new Date()
            for (i = 0; i < milestones.length; i++) {
                if (milestones[i].start > currentDate) {
                    return i
                }
            }
            return i
        }
        return 0
    }
    const [current, setCurrent] = useState(findCurrent())
    const [isUpdateEventOpen, setIsUpdateEventOpen] = useState(false)
    const [clickedEvent, setClickedEvent] = useState(null)



    const onClickEvent = (index) => {
        setIsUpdateEventOpen(true)
        setClickedEvent(milestones[index])
    }


    //console.log('initialValues: ', initialValues)
    return (
        <div>
       <Modal width={'70%'} title={'Project Schedule'} closable={false} open={isTimelineOpen} footer={[
           // Custom footer without a cancel button
           <Button key="submit" type="primary" onClick={() => {setIsTimelineOpen(false)}}>
               OK
           </Button>,
       ]}>
           {(milestones?.length === 0) ? "you don't have any Milestone Meetings scheduled" : ''}
           <Steps labelPlacement="vertical" style={{padding: "5%"}} current={findCurrent()} items={milestones?.map((m, i) => ({title: m.title, icon: <Button style={{backgroundColor: lighten(0.42, m.color)}} onClick={() => onClickEvent(i)}>{i+1}</Button> }))} mode={'right'}></Steps>
       </Modal>

    {(isUpdateEventOpen) && <AddEventPopup isUpdateEventOpen={isUpdateEventOpen} isCreateEventOpen={false}
                                                                          setIsUpdateEventOpen={setIsUpdateEventOpen}
                                           setIsCreateEventOpen={(x)=>{setIsUpdateEventOpen(x)}}
                                                                          event={clickedEvent}
                                                                          users={users} currentUser={currentUser}/>}
        </div>
    );

};

export default TimelinePopup