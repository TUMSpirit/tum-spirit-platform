import { ChartJS } from "./lib/ChartJS.js";

export const DoughnutChart = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 0.7
    };

    return <ChartJS type="doughnut" options={options} data={data}/>;
};
