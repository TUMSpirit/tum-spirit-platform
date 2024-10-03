import { useSubjectivityData } from "../model/useSubjectivityData.js";
import { YLabeledLineChart } from "./base/YLabeledLineChart.js";

export const SubjectivityChart = () => {
    const { xData, yData } = useSubjectivityData();

    const params = {
        yMin: 0,
        yMax: 1,
        xData,
        yDataLabels: ["objective", "subjective"],
        datasets: [{ data: yData, label: "You" }],
        yDataOverview: "Subjectivity"
    };

    return <YLabeledLineChart {...params} />;
};
