import { DoughnutChart } from "./base/DoughnutChart.js";
import { Empty, Spin } from "antd";

export const TaskMetricsChart = ({ data, isPriority = false, loading = false }) => {
    // Extract data for both task counts and priority counts
    const values = isPriority
        ? [data[0].value, data[1].value, data[2].value] // Priority values
        : [data.backlog, data.doing, data.testing, data.done]; // Task status values

    // Check if all values are 0
    const allZero = values.every((value) => value === 0);

    // Chart options for responsiveness
    const options = {
        responsive: true,
        maintainAspectRatio: true,
    };

    const chartData = isPriority
        ? {
            labels: ["Low Priority", "Medium Priority", "High Priority"],
            datasets: [
                {
                    label: "Tasks by Priority",
                    data: values,
                    backgroundColor: [
                        "rgb(147 197 253)", // Light blue for "Low Priority"
                        "rgb(96 165 250)", // Blue for "Medium Priority"
                        "rgb(37 99 235)", // Dark blue for "High Priority"
                    ],
                    hoverOffset: 8,
                },
            ],
        }
        : {
            labels: ["Backlog", "Doing", "Testing", "Done"],
            datasets: [
                {
                    label: "Tasks by Status",
                    data: values,
                    backgroundColor: [
                        "rgb(255 193 7)", // Yellow for "Backlog"
                        "rgb(59 130 246)", // Blue for "Doing"
                        "rgb(251 146 60)", // Orange for "Testing"
                        "rgb(34 197 94)", // Green for "Done"
                    ],
                    hoverOffset: 8,
                },
            ],
        };

    // Display loading spinner if loading
    if (loading) {
        return (
            <div className="flex justify-center items-center py-4">
                <Spin size="large" />
            </div>
        );
    }

    // Render the Ant Design Empty component if all values are zero
    if (allZero) {
        return (
            <div className="flex justify-center items-center py-4">
                <Empty description="No Data Available" />
            </div>
        );
    }

    // Render the DoughnutChart with a fixed smaller size
    return (
        <div className="flex justify-center items-center">
            <DoughnutChart data={chartData} options={options} />
        </div>
    );
};
