import { randomHelper, dateHelper } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const dates = Array.from({ length: 50 }, (_, i) => dateHelper(i));

const demoData = dates.map((date) => ({ x: date, y: randomHelper(0.4, 0.56) }));

export const useSubjectivityData = () => {
    const { data } = useDataFetcher({ url: "/api/subjectivity", demoData });
    return {
        yData: data.map((entry) => entry.y),
        xData: data.map((entry) => entry.x),
    };
};
