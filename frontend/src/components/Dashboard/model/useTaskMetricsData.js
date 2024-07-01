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
    url: "/api/taskmetrics",
    demoData,
    filter: true,
  });
  if (loading)
    return {
      data: {
        todo: 0,
        overdue: 0,
        done: 0,
        averages: { completeTime: 0, overdueTime: 0 },
      },
    };
  return { data };
};
