import { useEffect, useState } from "react";
import { useAuthHeader } from "react-auth-kit";
import axios from "axios";

const demoMode = false;

export const useDataFetcher = ({ url, demoData }) => {
  const [data, setData] = useState(demoMode ? demoData : undefined); // Initialize with demoData if in demo mode
  const [loading, setLoading] = useState(!demoMode); // Initialize loading based on `demoMode`
  const [error, setError] = useState(null); // Track errors

  const authHeader = useAuthHeader();

  useEffect(() => {
    // AbortController to cancel request if the component unmounts
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching
      setError(null); // Reset error state
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: authHeader(), // Call `authHeader()` once
          },
          signal: controller.signal, // Attach abort signal to cancel request if needed
        });

        setData(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error fetching data:", error);
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup effect to cancel the request if component unmounts
    return () => {
      controller.abort();
    };
  }, []); // Include `url` and `authHeader` in dependencies

  return {
    data,
    loading,
    error, // Expose error for further use in your components if needed
  };
};
