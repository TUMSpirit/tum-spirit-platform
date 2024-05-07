import { useLanguageAnalysisData } from "../model/useLanguageAnalysisData";
import { PlotlyChart } from "./base/PlotlyChart";

export const LanguageAnalysis3D = () => {
    const { words, dataX, dataY, dataZ } = useLanguageAnalysisData();

    const data = [
        {
            marker: {
                size: 3,
                color: dataX,
                colorscale: [
                    [0, "rgb(0, 255, 0)"],
                    [1, "rgb(255, 0, 0)"],
                ],
            },
            mode: "markers+text",
            x: dataX,
            y: dataY,
            z: dataZ,
            text: words,
            hoverinfo: "text",
            type: "scatter3d",
            showlegend: false,
            showscale: false,
        },
    ];

    const options = {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        height: 240,
        scene: {
            xaxis: {
                showticklabels: false,
                showaxeslabels: false,
            },
            yaxis: { showticklabels: false, showaxeslabels: false },
            zaxis: { showticklabels: false, showaxeslabels: false },
        },
    };

    return <PlotlyChart data={data} options={options} />;
};
