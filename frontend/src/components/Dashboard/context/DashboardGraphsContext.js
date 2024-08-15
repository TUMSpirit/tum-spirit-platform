import { createContext } from "react";

export const DashboardGraphsContext = createContext({
    extraGraphs: [],
    setExtraGraphs: () => undefined,
});
