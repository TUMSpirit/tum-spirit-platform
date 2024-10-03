import { useRef } from "react";
import { ChartJS } from "./base/lib/ChartJS.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Spin, Empty } from "antd"; // Ant Design components for loading spinner and empty state

export const Big5Chart = ({ userFetcher, teamFetcher, onHoverIndexChanged }) => {
  const { data: userData, loading: loadingUser } = userFetcher();
  const { data: teamData, loading: loadingTeam } = teamFetcher();

  // Labels for the radar chart
  const labels = [
    "EXT",
    "CON",
    "AGR",
    "NEU",
    "OPE",
  ];
  
  const labelsTooltip = [
    "Extraversion",
    "Conscientiousness",
    "Agreeableness",
    "Neuroticism",
    "Openness",
  ];

  // Datasets for user and team
  const datasets = [
    {
      label: "You",
      backgroundColor: "#1890ff55",
      borderColor: "#1890ff",
      pointBackgroundColor: "#1890ff",
      data: userData,
      fill: true,
    },
    {
      label: "Team",
      backgroundColor: "#f5a62355",
      borderColor: "#f5a623",
      pointBackgroundColor: "#f5a623",
      data: teamData,
      fill: true,
    },
  ];

  const finalData = { labels, datasets };

  const oldIndex = useRef();

  const options = {
    onHover: (_, elements) => {
      if (!elements || elements.length < 1) return;
      const index = elements[0].index;
      if (oldIndex.current !== index) {
        oldIndex.current = index;
        if (onHoverIndexChanged) onHoverIndexChanged(index);
      }
    },

    interaction: {
      intersect: true,
      mode: "nearest",
    },

    animation: { duration: 500 },

    responsive: true,
    maintainAspectRatio: true,
    scale: {
      min: 0,
      max: 5,
    },
    scales: {
      r: {
        pointLabels: {
          font: {
            size: 12, // Adjust the size for less clutter
          },
        },
        ticks: {
          display: false, // Hide the scale ticks
        },
      },
    },

    plugins: {
      legend: {
        display: true, // Show legend for toggling datasets
        position: "top",
      },
      
      datalabels: {
        display: false, // Disable data labels on dots to reduce clutter
      },
      tooltip: {
        enabled: true, // Enable tooltips
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset.label;
            const value = tooltipItem.raw;
            const label = labelsTooltip[tooltipItem.dataIndex];
            return `${dataset} - ${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
    aspectRatio: 1,
  };

  // Display loading spinner if data is being fetched
  if (loadingUser || loadingTeam) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  // Display empty state if no data is available or all data values are zero
  const hasData =
    (userData && userData.length > 0 && userData.some((value) => value !== 0)) ||
    (teamData && teamData.length > 0 && teamData.some((value) => value !== 0));

  if (!hasData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Empty description="Not enough data - feel free to chat more." />
      </div>
    );
  }

  return <ChartJS type="radar" options={options} data={finalData} plugins={[ChartDataLabels]} />;
};
