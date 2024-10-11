import { useSentimentData } from "../model/useSentimentData.js";
import { YLabeledLineChart } from "./base/YLabeledLineChart.js";

export const SentimentChart = () => {
    const { xData, yData } = useSentimentData();

    const params = {
        yMin: -1,
        yMax: 1,
        xData,
        yDataLabels: ["very negative", "neutral", "very positive"],
        datasets: [{ data: yData, label: "You" }],
        yDataOverview:"Sentiment"
    };

    return <YLabeledLineChart {...params} />;
};
