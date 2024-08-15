import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import moment from "moment";
import { queryClient } from "../../../index";
import { message } from "antd";
import { useAuthHeader } from 'react-auth-kit';

/*
export const getFn = async () => {
    return fetch('/calendar').then(res => {
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
            const { data } = await axios.get(`/api/calendar/get-entries`, {
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
    const { data } = await axios.post('/api/calendar/add-entry', {
        title: newEntry.title,
        color: newEntry.color,
        startDate: moment(newEntry.start).format(),
        endDate: moment(newEntry.end).format(),
        allDay: newEntry.allDay ? newEntry.allDay : false,
        isOnSite: newEntry.isOnSite ? newEntry.isOnSite : false,
        textArea: newEntry.textArea ? newEntry.textArea : "",
        room: newEntry.room ? newEntry.room : "",
        remoteLink: newEntry.remoteLink ? newEntry.remoteLink : "",
        isMilestone: newEntry.isMilestone ? newEntry.isMilestone : false,
        users: newEntry.users
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
        }
    })
};

//-------------------------------------------------------put-------------------------------------------------

const putEntry = async (newEntry, authHeader) => {
    //const authHeader = useAuthHeader();
    console.log('putEntry: ', newEntry)
    const { data } = await axios.put('/api/calendar/update-entry/' + newEntry.id, {
        title: newEntry.title,
        color: newEntry.color,
        startDate: moment(newEntry.start).format(),
        endDate: moment(newEntry.end).format(),
        allDay: newEntry.allDay ? newEntry.allDay : false,
        isOnSite: newEntry.isOnSite ? newEntry.isOnSite : false,
        textArea: newEntry.textArea ? newEntry.textArea : "",
        room: newEntry.room ? newEntry.room : "",
        remoteLink: newEntry.remoteLink ? newEntry.remoteLink : "",
        isMilestone: newEntry.isMilestone ? newEntry.isMilestone : false,
        users: newEntry.users,
    }, {
        headers: {
            "Authorization": authHeader
        }
    });
    return data;

}
export const useUpdateEntries = () => {
    const authHeader = useAuthHeader();
    return useMutation({
        mutationFn: (newEntry) => putEntry(newEntry, authHeader()),
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }
    })
};

//-------------------------------------------------delete--------------------------------------------
const deleteEntry = async (id, authHeader) => {
    //const authHeader = useAuthHeader();
    console.log(id + ' deleted')
    const { data } = await axios.delete('/api/calendar/delete-entry/' + id, {
        headers: {
            "Authorization": authHeader
        }
    });
    return data;

}
export const useDeleteEntries = () => {
    const authHeader = useAuthHeader();
    return useMutation({
        mutationFn: (id) => deleteEntry(id, authHeader()),
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }
    })
};

//----------------------------------------------post file-----------------------------------
//TODO: Associate uploaded file with according event - due to new backend
const postFiles = async ({ files, eventID }, authHeader) => {
    //const authHeader = useAuthHeader();
    //console.log('event id aus req' , files, eventID)
    const formData = new FormData();
    files.fileList.forEach(file => {
        if (file.originFileObj) { // Check if file is available for upload
            formData.append('files', file.originFileObj);
        }
    });

    try {
        const response = await axios.post(`/api/files/upload`, formData, {
            headers: {
                Authorization: authHeader,
                'Content-Type': 'multipart/form-data'
            }
        });
        //message.success('File uploaded successfully');

    } catch (error) {
        console.error('Error uploading file:', error);
        message.error('Error uploading file');
    }
}

export const useUploadFile = () => {
    const authHeader = useAuthHeader();
    return useMutation({
        mutationFn: postFiles,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }
    })
};

//------------------------------ delete File ----------------------------------
const deleteFile = async ({ eventId, fileId }, authHeader) => {
    //const authHeader = useAuthHeader();
    console.log(fileId + ' deleted, event id: ', eventId)
    const { data } = await axios.delete(`/api/files/delete/` + fileId, {
        headers: {
            "Authorization": authHeader
        }
    });
    return data;

}
export const useDeleteFile = () => {
    const authHeader = useAuthHeader();
    return useMutation({
        mutationFn: ({files, eventId}) => deleteFile({files, eventId}, authHeader()),
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }
    })
};