import { randomHelperRound } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

// Demo data for development/testing with random values
const demoData = {
  sentiment: randomHelperRound(0, 1),
  subjectivity: randomHelperRound(0, 1),
  grammar: randomHelperRound(0, 1),
  precision: randomHelperRound(0, 100),
  sentiment_change: randomHelperRound(-10, 10), // Random percentage change
  subjectivity_change: randomHelperRound(-10, 10),
  grammar_change: randomHelperRound(-10, 10),
  precision_change: randomHelperRound(-10, 10),
};

// Custom hook to fetch chat metrics data
export const useChatMetricsData = () => {
  const { loading, data } = useDataFetcher({
    url: "/api/language/get-chat-metadata",
    demoData, // Use demoData if API call fails or demo mode is on
  });

  // If data is still loading, return default values for data and set loading to true
  if (loading) {
    return {
      data: {
        sentiment: 0,
        subjectivity: 0,
        grammar: 0,
        precision: 0,
        sentiment_change: 0,
        subjectivity_change: 0,
        grammar_change: 0,
        precision_change: 0,
      },
      loading: true, // Keep loading as true
    };
  }

  // If data has been fetched, return it along with loading set to false
  return { data, loading: false };
};
