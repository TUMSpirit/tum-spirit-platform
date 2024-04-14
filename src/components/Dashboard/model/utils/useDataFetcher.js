import { useEffect, useState, useMemo } from "react";
import { useFilter } from "../../context/useFilter";

const demoMode = true;

export const useDataFetcher = ({ url, demoData, filter }) => {
    const [data, setData] = useState();

    const { startDate, endDate } = useFilter();

    const options = useMemo(
        () =>
            filter
                ? {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ startDate, endDate }),
                  }
                : { method: "GET" },
        [filter, startDate, endDate]
    );

    useEffect(() => {
        if (demoMode) return;

        //TODO: add error handling!
        fetch(url, options)
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error(error));
    }, [url, options]);

    return { data: demoMode ? demoData : data };
};
