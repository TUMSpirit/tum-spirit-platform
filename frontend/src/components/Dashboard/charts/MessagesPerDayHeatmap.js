import { useMessagesPerDayData } from "../model/useMessagesPerDayData";
import { PlotlyChart } from "./base/PlotlyChart";

export const MessagesPerDayHeatmap = () => {
    const { data: serverData } = useMessagesPerDayData();

    const data = [
        {
            y: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            x: serverData.labels,
            z: serverData.data,
            type: "heatmap",
            showscale: false,
            hoverinfo: "none",
            colorscale: [
                [0, "rgba(59 130 246 0.2)"],
                [1, "rgba(59 130 246 1)"],
            ],
        },
    ];

    const options = {
        margin: { r: 0, t: 0, l: 35 },
        height: 200,

        xaxis: { showgrid: false, zeroline: false, tickangle: 90 },
        yaxis: { showgrid: false, zeroline: false },
    };

    return <PlotlyChart data={data} options={options} displayBar={false} />;
};
