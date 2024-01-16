import axios from "axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import moment from "moment";
import {queryClient} from "../index";

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
export const useEntries = () => {
    return useQuery({
        queryFn: async () => {
            const {data} = await axios.get('http://localhost:8000/calendar');
            console.log('form Get: ', data)
            return data;
        },
        queryKey: ['GET_ENTRIES']
    })
}

//-------------------------------------------------------post-------------------------------------------------
const postEntry = async (newEntry) => {
    const {data} = await axios.post('http://localhost:8000/calendar', {

        title: newEntry.title,
        color: newEntry.color,
        startDate: moment(newEntry.start).format(),
        endDate: moment(newEntry.end).format(),
        allDay: newEntry.allDay? newEntry.allDay:false,

    });
    return data;

}
export const useCreateEntries = () => {
    return useMutation({
        mutationFn: postEntry,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
    }})
};

//-------------------------------------------------------put-------------------------------------------------

const putEntry = async (newEntry) => {
    //console.log('putEntry: ', newEntry)
    const {data} = await axios.put('http://localhost:8000/calendar/' + newEntry.id, {

        title: newEntry.title,
        color: newEntry.color,
        startDate: moment(newEntry.start).format(),
        endDate: moment(newEntry.end).format(),
        allDay: newEntry.allDay? newEntry.allDay:false,

    });
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
    console.log(id+' deleted')
    const {data} = await axios.delete('http://localhost:8000/calendar/' + id);
    return data;

}
export const useDeleteEntries = () => {

    return useMutation({
        mutationFn: deleteEntry,
        onSuccess: () => {
            queryClient.invalidateQueries(['GET_ENTRIES']);
        }})
};