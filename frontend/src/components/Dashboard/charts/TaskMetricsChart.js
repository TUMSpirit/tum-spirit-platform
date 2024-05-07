import { DoughnutChart } from "./base/DoughnutChart.js";

export const TaskMetricsChart = ({ data }) => {
    const finalData = {
        labels: ["Done", "ToDo", "Overdue"],
        datasets: [
            {
                label: "You",
                data,
                backgroundColor: [
                    "rgb(34 197 94)",
                    "rgb(59 130 246)",
                    "rgb(239 68 68)",
                ],
                hoverOffset: 8,
            },
        ],
    };

    return <DoughnutChart data={finalData} />;
};
