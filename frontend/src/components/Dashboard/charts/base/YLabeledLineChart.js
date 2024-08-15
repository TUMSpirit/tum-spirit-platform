import { ChartJS } from "./lib/ChartJS.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

export const YLabeledLineChart = ({
    datasets,
    xData,
    yDataLabels,
    yMin,
    yMax,
}) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time",
                adapters: {
                    date: {
                        locale: enUS,
                    },
                },
                time: {
                    tooltipFormat: "dd T",
                },
            },
            y: {
                min: yMin,
                max: yMax,
                ticks: {
                    maxTicksLimit: yDataLabels.length,
                    callback: (_, index) => yDataLabels[index],
                },
            },
        },
    };

    const data = {
        labels: xData,
        datasets: datasets.map((dataset) => ({
            fill: false,
            tension: 0.1,
            ...dataset,
        })),
    };
    return <ChartJS type="line" options={options} data={data} />;
};
