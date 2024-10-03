import { randomHelper, randomHelperRound } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

// Demo words for the word cloud (in case of demoMode)
const demoWords = [
  "hello",
  "where",
  "how",
  "thank",
  "you",
  "I",
  "the",
  "of",
  "yes",
  "agree",
  "but",
  "no",
  "if",
  "want",
  "however",
  "need",
  "soon",
  "great",
  "oh",
  "okay",
];

// Demo data for the word cloud visualization
const demoData = demoWords.map((word) => ({
  word,
  usage: randomHelperRound(90, 140),
  sentiment: randomHelper(-0.7, 0.8),
  subjectivity: randomHelper(0.1, 0.7),
}));

// Hook for fetching word cloud data
export const useLanguageAnalysisData = () => {
  const { data, loading, error } = useDataFetcher({
    url: "/api/language/get-word-cloud", // Replace with your API endpoint
    demoData,
  });

  // Handle loading state
  if (loading) {
    return {
      loading: true,
      dataX: [],
      dataY: [],
      dataZ: [],
      words: [],
    };
  }

  // Handle error state
  if (error) {
    console.error("Error loading word cloud data:", error);
    return {
      loading: false,
      dataX: [],
      dataY: [],
      dataZ: [],
      words: [],
    };
  }

  // Transform data for word cloud visualization
  return {
    loading: false,
    dataX: data.map((entry) => entry.sentiment),
    dataY: data.map((entry) => entry.usage),
    dataZ: data.map((entry) => entry.subjectivity),
    words: data.map((entry) => entry.word),
  };
};
