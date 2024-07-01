import { randomHelper, dateHelper } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const dates = Array.from({ length: 50 }, (_, i) => dateHelper(i));

const demoData = dates.map((date) => ({
  date,
  sentiment: {
    polarity: randomHelper(-0.3, 0.7),
    subjectivity: randomHelper(0.3, 0.7),
  },
}));

export const useSentimentData = () => {
  const { data } = useDataFetcher({ url: "http://localhost:8000/api/language/get-sentiment", demoData });
  return {
    yData: data.map((entry) => entry.sentiment.polarity),
    xData: data.map((entry) => entry.date),
  };
};