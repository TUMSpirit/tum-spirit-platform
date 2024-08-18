import { useEffect } from 'react';
import { useSubHeaderContext } from './SubHeaderContext';

export const SubHeader = ({ children }) => {
    const { setSubHeader } = useSubHeaderContext();

    useEffect(() => {
        console.log("Updating subheader:", children);
        setSubHeader(children);
    }, [setSubHeader]);

    return null;
};
