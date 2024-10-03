import { ChartJS } from "./base/lib/ChartJS.js";
import { Spin, Empty } from "antd"; // Ant Design components for loading spinner and empty state
import { useEmotionsData } from "../model/useEmotionsData.js";


export const EmotionBarChart = () => {
  const { data, loading } = useEmotionsData();

  const labels = ["Happy", "Angry", "Surprise", "Sad", "Fear"];

  const datasets = [
    {
      label: "Emotions",
      backgroundColor: [
        "rgba(75,192,192,0.6)",
        "rgba(255,99,132,0.6)",
        "rgba(255,206,86,0.6)",
        "rgba(153,102,255,0.6)",
        "rgba(54,162,235,0.6)",
      ],
      borderColor: [
        "rgba(75,192,192,1)",
        "rgba(255,99,132,1)",
        "rgba(255,206,86,1)",
        "rgba(153,102,255,1)",
        "rgba(54,162,235,1)",
      ],
      borderWidth: 1,
      data: data ? data : [0, 0, 0, 0, 0],
    },
  ];

  const finalData = { labels, datasets };

  const options = {
    indexAxis: "y", // Horizontal bar chart
    scales: {
      x: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Display loading spinner if data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="Loading emotions..." />
      </div>
    );
  }

  // Display empty state if no data is available or all values are zero
  if (!data) {
    return (
      <div className="flex justify-center items-center h-full">
        <Empty description="Not enough data for emotions." />
      </div>
    );
  }

  return <ChartJS type="bar" options={options} data={finalData} />;
};
