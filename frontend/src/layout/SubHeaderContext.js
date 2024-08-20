// SubHeaderContext.js
import React, { createContext, useState, useContext } from "react";

const SubHeaderContext = createContext();

export const useSubHeader = () => useContext(SubHeaderContext);

export const SubHeaderContextProvider = ({ children }) => {
    const [subHeaderComponent, setSubHeaderComponent] = useState(null);

    return (
        <SubHeaderContext.Provider value={{ subHeaderComponent, setSubHeaderComponent }}>
            {children}
        </SubHeaderContext.Provider>
    );
};
