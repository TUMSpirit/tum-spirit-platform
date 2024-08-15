import { randomHelper, randomHelperRound } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

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

const demoData = demoWords.map((word) => ({
  word,
  usage: randomHelperRound(90, 140),
  sentiment: randomHelper(-0.7, 0.8),
  subjecitvity: randomHelper(0.1, 0.7),
}));

export const useLanguageAnalysisData = () => {
  const { loading, data } = useDataFetcher({
    url: "/api/languageAnalysis",
    demoData,
    filter: true,
  });
  if (loading)
    return {
      dataX: [],
      dataY: [],
      dataZ: [],
      words: [],
    };
  return {
    dataX: data.map((entry) => entry.sentiment),
    dataY: data.map((entry) => entry.usage),
    dataZ: data.map((entry) => entry.subjecitvity),
    words: data.map((entry) => entry.word),
  };
};
