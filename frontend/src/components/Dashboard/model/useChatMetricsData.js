import { randomHelperRound } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = {
    sentiment: randomHelperRound(0, 1),
    subjectivity: randomHelperRound(0, 1),
    grammar: randomHelperRound(0, 1),
    precision:randomHelperRound(0, 100)
};

export const useChatMetricsData = () => {
  const { loading, data } = useDataFetcher({
    url: "/api/language/get-chat-metadata",
    demoData
  });
  if (loading)
    return {
      data: {
        sentiment: 0,
        subjectivity: 0,
        grammar: 0,
        precision:0
      },
      loading: false
    };
  return { data, loading };
};