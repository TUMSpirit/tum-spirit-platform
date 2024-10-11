import { ChartJS } from "./lib/ChartJS.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

export const YLabeledLineChart = ({
    datasets,
    xData,
    yDataLabels,
    yMin,
    yMax,
    yDataOverview
}) => {
    // Convert xData to Date objects, ensure only date portion is kept
    const formattedXData = xData.map((date) => new Date(date.split("T")[0])); // Keep only the date part if the input has time

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
                    unit: "day", // Display only day
                    tooltipFormat: "PPP", // Tooltip as full date (e.g., "October 2, 2024")
                    displayFormats: {
                        day: "MMM dd", // x-axis format (e.g., "Oct 02")
                    },
                },
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                min: yMin,
                max: yMax,
                title: {
                    display: true,
                    text: yDataOverview,
                },
                ticks: {
                    maxTicksLimit: yDataLabels.length,
                    callback: (_, index) => yDataLabels[index],
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || "";
                        return `${label}: ${context.parsed.y}`;
                    },
                },
            },
        },
    };

    const data = {
        labels: formattedXData,
        datasets: datasets.map((dataset) => ({
            fill: false,
            tension: 0.1,
            ...dataset,
        })),
    };

    return <ChartJS type="line" options={options} data={data} />;
};
