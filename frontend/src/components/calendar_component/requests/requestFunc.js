import axios from "axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import moment from "moment";
import {queryClient} from "../../../index";
import {message} from "antd";
import { useAuthHeader } from 'react-auth-kit';

/*
export const getFn = async () => {
    return fetch('http://localhost:8000/calendar').then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        console.log(res)
        return res;
    }).catch(error => {
        console.error('Error:', error);
    });
}*/

//-------------------------------------------------------get-------------------------------------------------
export const useEntries = (userId) => {
    const authHeader = useAuthHeader();
    return useQuery({
        queryFn: async () => {
            const {data} = await axios.get(`http://localhost:8000/api/calendar/get-entries`, {
                headers: {
                    "Authorization": authHeader()
                }
            });
            console.log('form Get: ', data)
            return data;
        },
        queryKey: ['GET_ENTRIES']
    })
}

//-------------------------------------------------------post-------------------------------------------------
const postEntry = async (newEntry, authHeader) => {

    console.log('new Entry: ', newEntry)
    const {data} = await axios.post('http://localhost:8000/api/calendar/add-entry', {

        title: newEntry.title,
        color: newEntry.color,
        startDate: moment(newEntry.start).format(),
        endDate: moment(newEntry.end).format(),
        allDay: newEntry.allDay? newEntry.allDay : false,
        isOnSite: newEntry.isOnSite? newEntry.isOnSite : false,
        textArea: newEntry.textArea? newEntry.textArea : '',
        room: newEntry.room? newEntry.room : null,
        remoteLink: newEntry.remoteLink? newEntry.remoteLink : null,
        isMilestone:  newEntry.isMilestone? newEntry.isMilestone : false,
        files: [],
        users: newEntry.users,

    }, {
        headers: {
            "Authorization": authHeader
        }
    });
    return data;
}

export const useCreateEntries = () => {
    const authHeader = useAuthHeader();
    return useMutation({
        mutationFn: (newEntry) => postEntry(newEntry, authHeader()),
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
    }})
};

//-------------------------------------------------------put-------------------------------------------------

const putEntry = async (newEntry) => {
    //const authHeader = useAuthHeader();
    console.log('putEntry: ', newEntry)
    const {data} = await axios.put('/api/calendar/update-entry/' + newEntry.id, {

        title: newEntry.title,
        color: newEntry.color,
        startDate: moment(newEntry.start).format(),
        endDate: moment(newEntry.end).format(),
        allDay: newEntry.allDay? newEntry.allDay : false,
        isOnSite: newEntry.isOnSite? newEntry.isOnSite : false,
        textArea: newEntry.textArea? newEntry.textArea : '',
        room: newEntry.room? newEntry.room : null,
        remoteLink: newEntry.remoteLink? newEntry.remoteLink : null,
        isMilestone:  newEntry.isMilestone? newEntry.isMilestone : false,
        users: newEntry.users,
    }, /*{
        headers: {
            "Authorization": authHeader()
        }
    }*/);
    return data;

}
export const useUpdateEntries = () => {
    return useMutation({
        mutationFn: putEntry,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }})
};

//-------------------------------------------------delete--------------------------------------------
const deleteEntry = async (id) => {
    //const authHeader = useAuthHeader();
    console.log(id+' deleted')
    const {data} = await axios.delete('http://localhost:8000/api/calendar/delete-entry/' + id/*, {
        headers: {
            "Authorization": authHeader()
        }
    }*/);
    return data;

}
export const useDeleteEntries = () => {

    return useMutation({
        mutationFn: deleteEntry,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }})
};

//----------------------------------------------post file-----------------------------------
//TODO: Associate uploaded file with according event - due to new backend
const postFiles = async ({files, eventID}) => {
    //const authHeader = useAuthHeader();
    //console.log('event id aus req' , files, eventID)
    const formData = new FormData();
    files.fileList.forEach((file) => {
        if (file.originFileObj) { // Check if file is available for upload
            formData.append('files', file.originFileObj);
        }
    });

    try {
        const response = await axios.post(`/api/files/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                //"Authorization": authHeader()
            }
        });
        //message.success('File uploaded successfully');

    } catch (error) {
        console.error('Error uploading file:', error);
        message.error('Error uploading file');
    }
}

export const useUploadFile = () => {
    return useMutation({
        mutationFn: postFiles,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }})
};

//------------------------------ delete File ----------------------------------
const deleteFile = async ({eventId, fileId}) => {
    //const authHeader = useAuthHeader();
    console.log(fileId+' deleted, event id: ', eventId)
    const {data} = await axios.delete(`/api/files/delete/` + fileId/*, {
        headers: {
            "Authorization": authHeader()
        }
    }*/);
    return data;

}
export const useDeleteFile = () => {

    return useMutation({
        mutationFn: deleteFile,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }})
};