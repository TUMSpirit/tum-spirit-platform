import { useDataFetcher } from "./utils/useDataFetcher";

export const useEmotionsData = () => {
    const { loading, data } = useDataFetcher({
      url: "/api/language/get-emotions", // Adjust the endpoint to match your backend
      demoData:  [0.1,0.5,0.2,0.8,0.4] , // Provide demo data if needed
    });
  
    if (loading) return { data: [] };
    return { data };
  };
  