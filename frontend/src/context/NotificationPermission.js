// src/components/NotificationPermission.js

import { useEffect } from 'react';

const useNotificationPermission = () => {
    useEffect(() => {
        if ('Notification' in window && navigator.serviceWorker) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                } else {
                    console.log('Notification permission denied.');
                }
            });
        }
    }, []);
};

export default useNotificationPermission;
