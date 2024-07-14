import { useEffect } from "react";
import { useSubHeaderContext } from "./SubHeaderContext";

export const SubHeader = ({ children }) => {
    const { updateSubHeader } = useSubHeaderContext();

    useEffect(() => updateSubHeader(children), [children]);

    return null;
};
