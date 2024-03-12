import React, {useState} from "react";
import "./Calendar_Main.css"
import "react-big-calendar/lib/css/react-big-calendar.css"
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from 'moment';
import CustomToolbar from "./calendar_additional_components/CustomToolbar";
import AddEventPopup, {uploadFile} from "./calendar_additional_components/AddEventPopup";
import {lighten, modularScale, rgba} from 'polished'
import {
    getFn,
    useCreateEntries,
    useDeleteEntries,
    useEntries,
    useUpdateEntries,
    useUploadFile
} from "./requests/requestFunc";
import {createEvent} from "./calendar_additional_components/AddEventPopup";
import UploadImportPopup from "./calendar_additional_components/UploadImportPopup";


const localizer = momentLocalizer(moment);

const currentUser = {
    name: "Josef Suckart",
    id: "123456",
    color: "green",
    initialen: "JS"
};

const users = [
    {
        name: "Josef Suckart",
        id: "123456",
        color: "green",
        initialen: "JS"
    },

    {
        name: "Jonas Bender",
        id: "420420",
        color: "blue",
        initialen: "JB"
    },

    {
        name: "Degenhardt Hardt",
        id: "808080",
        color: "blue",
        initialen: "DH"
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
        room: entry.room,
        remoteLink: entry.remoteLink,
        files: entry.files,
        users: entry.users,
    }))
    //------------------------- State Hooks -------------------------------------------
    const [isAddEventPopupOpen, setIsAddEventPopupOpen] = useState(false)
    const [isUpdateEventPopupOpen, setIsUpdateEventPopupOpen] = useState(false)
    const [isUploadImportPopupOpen, setIsUploadImportPopupOpen] = useState(false)
    const [currentEvent, setCurrentEvent] = useState(null)

    //------------------------- Button Events Handler -------------------------------------------
    const onCancelAddEvent = () => {
        setIsAddEventPopupOpen(false);
        setIsUpdateEventPopupOpen(false);
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
            border: '0px',
            display: 'block'
        };
        return {
            style: style
        };
    }

    const {mutateAsync: createEntry} = useCreateEntries()
    const {mutateAsync: updateEntry} = useUpdateEntries()
    const {mutateAsync: deleteEntry} = useDeleteEntries()
    const {mutateAsync: uploadFile} = useUploadFile()


    const deleteEntryFuncArg = (id) =>
    {
        deleteEntry(id)
        setIsUpdateEventPopupOpen(false);
    }

    const onFinishAddEvent = async (fieldsValue) => {
        const newEvent = createEvent(fieldsValue, currentUser.id)
        if(fieldsValue['params'].isNew) {
           const createdEvent = await createEntry(newEvent)
           if(fieldsValue['files'])
           {
               console.log('created event', createdEvent)
               uploadFile({files: fieldsValue['files'], eventID: createdEvent._id})
           }

        }

        else
        {
            const createdEvent = await updateEntry(newEvent)
            if(fieldsValue['files'])
            {
                console.log('updated event id', createdEvent._id)
                uploadFile({files: fieldsValue['files'], eventID: createdEvent._id})
            }
        }

        //handleAddEvent(newEvent)
        setIsAddEventPopupOpen(false);
        setIsUpdateEventPopupOpen(false);
    }

    const components = {
        toolbar: props => (<CustomToolbar {...props} setIsAddEventPopupOpen={setIsAddEventPopupOpen}/>),
        //event: props => (<CustomEvent {...props} color={'#0047ab'}/>)
    }

    return (
        <div>
            {isAddEventPopupOpen && <AddEventPopup onCancel={onCancelAddEvent} onFinish={onFinishAddEvent} isNewOpen={true} users={users} currentUser={currentUser}/>}
            {isUpdateEventPopupOpen && <AddEventPopup onCancel={onCancelAddEvent} onFinish={onFinishAddEvent} isExistingOpen={true} event={currentEvent} deleteEntry={deleteEntryFuncArg} users={users}/>}
            {isUploadImportPopupOpen && <UploadImportPopup onCancel={onCancelUploadImport} setIsUploadImportPopupOpen={setIsUploadImportPopupOpen}/>}
            <div style={{height: "75vh"}}>
                <Calendar
                    components={{
                        toolbar: props => (<CustomToolbar {...props} setIsAddEventPopupOpen={setIsAddEventPopupOpen} setIsUploadImportPopupOpen={setIsUploadImportPopupOpen} users={users}/>)
                    }}
                    views={['month', 'week', 'day']}
                    onSelectEvent ={onClickEvent}
                    localizer={localizer}
                    events={entries}
                    startAccessor="start"
                    endAccessor="end"
                    toolbar={true}
                    eventPropGetter={(eventStyleGetter)}
                />

            </div>
        </div>

    );
}

export default Calendar_Main;