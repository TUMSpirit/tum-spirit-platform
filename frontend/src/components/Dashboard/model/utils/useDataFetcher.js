import { useEffect, useState, useMemo } from "react";
import { useFilter } from "../../context/useFilter";
import { useAuthHeader } from "react-auth-kit";
import axios from "axios";

const demoMode = true;

export const useDataFetcher = ({ url, demoData, filter }) => {
  const [data, setData] = useState();
  const authHeader = useAuthHeader();

  const { startDate, endDate } = useFilter();

  const options = useMemo(
    () =>
      filter
        ? {
            method: "POST",
            headers: {
              Authorization: authHeader(),
            },
            body: JSON.stringify({ startDate, endDate }),
          }
        : {
            method: "GET",
            headers: {
              Authorization: authHeader(),
            },
          },
    [filter, startDate, endDate]
  );

  useEffect(() => {
    /* try {
            const response = await axios.get(url, options);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [url, options]);*/
    //TODO: add error handling!
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error(error));
  }, [url, options]);

  return {
    data: demoMode ? demoData : data,
    loading: demoMode ? false : typeof data === "undefined",
  };
};
