import { useDataFetcher } from "./utils/useDataFetcher";

const demoData = {
    data: [
        [1, 2, 2, 2, 3, 0, 0, 1, 2, 2],
        [0, 2, 2, 2, 3, 0, 0, 6, 7, 2],
        [10, 0, 2, 2, 3, 0, 0, 2, 2, 3],
        [0, 9, 7, 3, 1, 10, 0, 6, 7, 2],
        [1, 2, 2, 2, 3, 0, 0, 2, 2, 3],
        [0, 2, 2, 2, 3, 0, 0, 1, 2, 0],
        [10, 0, 2, 2, 3, 0, 0, 6, 7, 2],
    ],
    labels: Array.from({ length: 10 }, (_, i) => "Week " + (i + 1)),
};

export const useMessagesPerDayData = () => {
    return useDataFetcher({
        url: "/api/languageAnalysis",
        demoData,
        filter: true,
    });
};
