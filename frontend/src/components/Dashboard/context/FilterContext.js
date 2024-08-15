import { createContext } from "react";

export const FilterContext = createContext({
    startDate: null,
    endDate: null,
    setStartDate: () => undefined,
    setEndDate: () => undefined,
});
