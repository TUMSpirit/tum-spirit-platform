import { useEffect, useRef } from "react";

import Chart from "chart.js/auto";

export const ChartJS = ({ type, data, options, plugins }) => {
    const canvasRef = useRef();
    const chartRef = useRef();

    useEffect(() => {
        if (canvasRef.current === null) return;

        chartRef.current = new Chart(canvasRef.current, {
            type,
            plugins,
        });

        return () => chartRef.current.destroy();
    }, []);

    useEffect(() => {
        chartRef.current.options = options;
        chartRef.current.update();
    }, [options]);

    useEffect(() => {
        chartRef.current.data = data;
        chartRef.current.update();
    }, [data]);

    return <canvas style={{paddingBottom: '20px'}} ref={canvasRef} />;
};
