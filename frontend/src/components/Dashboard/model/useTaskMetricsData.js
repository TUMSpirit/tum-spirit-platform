import { randomHelperRound } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = {
  todo: randomHelperRound(2, 5),
  overdue: randomHelperRound(1, 3),
  done: randomHelperRound(5, 10),
  averages: {
    completeTime: randomHelperRound(5, 10) + " days",
    overdueTime: randomHelperRound(5, 10) + " hours",
  },
};

export const useTaskMetricsData = () => {
  const { loading, data } = useDataFetcher({
    url: "/api/language/get-task-metrics",
    demoData,
  });

  // If loading, return an empty structure with the loading flag set to true
  if (loading) {
    return {
      loading: true,
      data: {
        todo: 0,
        overdue: 0,
        done: 0,
        averages: { completeTime: "Loading...", overdueTime: "Loading..." },
      },
    };
  }

  // If data is available, return it along with the loading flag
  return { loading: false, data };
};
