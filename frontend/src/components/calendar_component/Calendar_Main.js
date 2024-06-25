import React, { useState } from "react";
import "./Calendar_Main.css"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from 'moment';
import CustomToolbar from "./calendar_additional_components/CustomToolbar";
import AddEventPopup, { uploadFile } from "./calendar_additional_components/AddEventPopup";
import { lighten, modularScale, rgba } from 'polished'
import {
    getFn,
    useCreateEntries,
    useDeleteEntries,
    useEntries,
    useUpdateEntries,
    useUploadFile
} from "./requests/requestFunc";
import UploadImportPopup from "./calendar_additional_components/UploadImportPopup";
import TimelinePopup from "./calendar_additional_components/TimelinePopup";
import { Button, Modal } from "antd";
import TutorialPopup from "./calendar_additional_components/Tutorial Popup";


const localizer = momentLocalizer(moment);

const currentUser = {
    name: "Josef Suckhart",
    id: "664be96862095d5c01fafb58",
    color: "green",
    initialen: "YOU",
    isFirstLogin: true
};

const users = [
    {
        name: "You",
        id: "664be96862095d5c01fafb58",
        color: "green",
        initialen: "You",
        isFirstLogin: true
    },

    {
        name: "Clara Copyright",
        id: "333333",
        color: "blue",
        initialen: "CC",
        isFirstLogin: false
    },

    {
        name: "Max Muster",
        id: "444444",
        color: "red",
        initialen: "MM",
        isFirstLogin: false
    },

]

const Calendar_Main = () => {

    const fetchedData = useEntries(currentUser.id);

    const entries = fetchedData.data?.map(entry => ({
        title: entry.title,
        start: new Date(entry.startDate),
        end: new Date(entry.endDate),
        color: entry.color,
        allDay: entry.allDay,
        id: entry._id,
        isOnSite: entry.isOnSite,
        textArea: entry.textArea,
        room: entry.room,
        remoteLink: entry.remoteLink,
        isMilestone: entry.isMilestone,
        files: entry.files,
        users: entry.users,
    }))
    //------------------------- State Hooks -------------------------------------------
    const [isCreateEventPopupOpen, setIsCreateEventPopupOpen] = useState(false)
    const [isUpdateEventPopupOpen, setIsUpdateEventPopupOpen] = useState(false)
    const [isUploadImportPopupOpen, setIsUploadImportPopupOpen] = useState(false)
    const [isTimelineOpen, setIsTimelineOpen] = useState(false)
    const [currentEvent, setCurrentEvent] = useState(null)
    const [isFirstLogin, setIsFirstLogin] = useState(currentUser.isFirstLogin)
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    //------------------------- Button Events Handler -------------------------------------------


    const closeEventPopup = () => {
        setIsUploadImportPopupOpen(false)
        setIsCreateEventPopupOpen(false)
    }

    const onCancelUploadImport = () => {
        setIsUploadImportPopupOpen(false)
    }

    const onClickEvent = (event) => {
        // console.log('eventClickHandler: ', event)
        setCurrentEvent(event);
        setIsUpdateEventPopupOpen(true);
    }

    const eventStyleGetter = (event, start, end, isSelected) => {
        var backgroundColor = lighten(0.42, event.color);
        var style = {
            backgroundColor: backgroundColor,
            borderRadius: '4px',
            backgroundOpacity: 'rgba(0,0,0,0.5)',
            color: event.color,
            border: event.isMilestone ? '2px solid ' + event.color : '0px',
            display: 'block'
        };
        return {
            style: style
        };
    }

    const openAddEventFromCalendar = (event) => {
        // console.log('eventClickHandler: ', event)
        setStartDate(event.start);
        setEndDate(event.end);
        setIsCreateEventPopupOpen(true);
    }

    const components = {
        toolbar: props => (<CustomToolbar {...props} setIsAddEventPopupOpen={setIsCreateEventPopupOpen} />),
        //event: props => (<CustomEvent {...props} color={'#0047ab'}/>)
    }

    return (
        <div style={{ padding: "20px" }}>
            {(isUpdateEventPopupOpen || isCreateEventPopupOpen) && <AddEventPopup isUpdateEventOpen={isUpdateEventPopupOpen} isCreateEventOpen={isCreateEventPopupOpen}
                setIsCreateEventOpen={setIsCreateEventPopupOpen} setIsUpdateEventOpen={setIsUpdateEventPopupOpen}
                event={currentEvent}
                users={users} currentUser={currentUser} startDate={startDate}  endDate={endDate} />}
            {isUploadImportPopupOpen && <UploadImportPopup user={currentUser} isUploadImportPopupOpen={isUploadImportPopupOpen} onCancel={onCancelUploadImport} setIsUploadImportPopupOpen={setIsUploadImportPopupOpen} />}
            <div style={{ height: "80vh" }} className="kachel">
                <Calendar
                    components={{
                        toolbar: props => (<CustomToolbar data-testid='Toolbar' {...props} isTimelineOpen={isTimelineOpen} setIsTimelineOpen={setIsTimelineOpen} setIsAddEventPopupOpen={setIsCreateEventPopupOpen} setIsUploadImportPopupOpen={setIsUploadImportPopupOpen} users={users} />)
                    }}
                    min={new Date(0, 0, 0, 6, 0)} // Minimale Uhrzeit (6:00 Uhr)
                    max={new Date(0, 0, 0, 20, 0)}
                    views={['month', 'week', 'day']}
                    onSelectEvent={onClickEvent}
                    localizer={localizer}
                    events={entries}
                    startAccessor="start"
                    endAccessor="end"
                    toolbar={true}
                    eventPropGetter={(eventStyleGetter)}
                    onSelectSlot={openAddEventFromCalendar} // Methode zum Behandeln der Auswahl eines Slots
                    selectable={true}
                    formats={{
                        timeGutterFormat: 'H:mm', // Format der Uhrzeiten im linken Bereich
                      }}
                />
            </div>

        </div>

    );
}
//                   <TimelinePopup isTimelineOpen={isTimelineOpen} setIsTimelineOpen={setIsTimelineOpen} events={entries} users={users} currentUser={currentUser} startDate={startDate} endDate={endDate}></TimelinePopup>


//<TutorialPopup isFirstLogin={isFirstLogin} setISFirstLogin={setIsFirstLogin}></TutorialPopup>
// <TimelinePopup isTimelineOpen={isTimelineOpen} setIsTimelineOpen={setIsTimelineOpen} events={entries}></TimelinePopup>
/*
{isAddEventPopupOpen && <AddEventPopup onCancel={onCancelAddEvent} onFinish={onFinishAddEvent} isNewOpen={true} users={users} currentUser={currentUser}/>}
            {isUpdateEventPopupOpen && <AddEventPopup onCancel={onCancelAddEvent} onFinish={onFinishAddEvent} isExistingOpen={true} event={currentEvent} deleteEntry={deleteEntryFuncArg} users={users}/>}
            */


export default Calendar_Main;