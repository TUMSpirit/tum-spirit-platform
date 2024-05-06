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

export const useSubjectivityData = () => {
  const { data } = useDataFetcher({ url: "/language/sentiment", demoData });
  return {
    yData: data.map((entry) => entry.sentiment.subjectivity),
    xData: data.map((entry) => entry.date),
  };
};
