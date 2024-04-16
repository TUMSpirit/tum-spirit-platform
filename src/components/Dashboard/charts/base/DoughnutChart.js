import { ChartJS } from "./lib/ChartJS.js";

export const DoughnutChart = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
    };

    return <ChartJS type="doughnut" options={options} data={data} />;
};
