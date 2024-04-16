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
    return useDataFetcher({ url: "/api/taskmetrics", demoData, filter: true });
};
