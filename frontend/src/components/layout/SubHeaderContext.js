import { createContext, useContext, useState } from "react";

export const SubHeaderContext = createContext({
    subHeader: null,
    updateSubHeader: () => undefined,
});

export const useSubHeaderContext = () => useContext(SubHeaderContext);

export const SubHeaderContextProvider = ({ children }) => {
    const [subHeader, setSubHeader] = useState(null);

    const updateSubHeader = (el) => {
        console.log("SubHeader in");
        const oldSubHeader = null;
        setSubHeader(el);
        return () => {
            console.log("SubHeader out");
            setSubHeader(oldSubHeader);
        };
    };

    return (
        
        <SubHeaderContext.Provider value={{ subHeader, updateSubHeader }}>
            {children}
        </SubHeaderContext.Provider>
    );
};
