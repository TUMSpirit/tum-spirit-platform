import { randomHelper, dateHelper } from "./utils/demo";
import { useDataFetcher } from "./utils/useDataFetcher";

const dates = Array.from({ length: 50 }, (_, i) => dateHelper(i));

const demoData = dates.map((date) => ({
    x: date,
    y: randomHelper(-0.3, 0.7),
}));

export const useSentimentData = () => {
    const { data } = useDataFetcher({ url: "/api/sentiment", demoData });
    console.log(data);
    return {
        yData: data.map((entry) => entry.y),
        xData: data.map((entry) => entry.x),
    };
};
