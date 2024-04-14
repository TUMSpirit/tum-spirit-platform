import { useEffect, useRef } from "react";

import Plotly from "plotly.js-dist";

export const PlotlyChart = ({ data, options, displayBar }) => {
    const ref = useRef();

    useEffect(() => {
        const el = ref.current;
        Plotly.react(el, data, options, {
            modeBarButtonsToRemove: [
                "toImage",
                "zoom3d",
                "pan3d",
                "orbitRotation",
                "tableRotation",
                "handleDrag3d",
                "resetCameraLastSave3d",
                "hoverClosest3d",
            ],
            displayModeBar:
                typeof displayBar === "undefined" ? true : displayBar,
            displaylogo: false,
            responsive: true,
        });
        return () => Plotly.purge(el);
    });

    return <div ref={ref}></div>;
};
