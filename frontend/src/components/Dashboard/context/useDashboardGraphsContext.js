import { DashboardGraphsContext } from "./DashboardGraphsContext";
import { useContext } from "react";

export const useDashboardGraphsContext = () => {
    return useContext(DashboardGraphsContext);
};
