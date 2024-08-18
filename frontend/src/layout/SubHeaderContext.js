import React, { createContext, useContext, useState } from 'react';

// Create the SubHeader context
const SubHeaderContext = createContext();

// Custom hook to use the SubHeader context
export const useSubHeaderContext = () => useContext(SubHeaderContext);

// Provider component for the SubHeader context
export const SubHeaderContextProvider = ({ children }) => {
    const [subHeader, setSubHeader] = useState('');

    return (
        <SubHeaderContext.Provider value={{ subHeader, setSubHeader }}>
            {children}
        </SubHeaderContext.Provider>
    );
};
