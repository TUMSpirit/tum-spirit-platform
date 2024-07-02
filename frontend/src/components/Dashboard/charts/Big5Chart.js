import { useRef } from "react";
import { ChartJS } from "./base/lib/ChartJS.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

export const Big5Chart = ({ dataFetcher, label, onHoverIndexChanged }) => {
  const { data } = dataFetcher();

  const labels = [
    "Extraversion",
    "Conscientiousness ",
    "Agreeableness ",
    "Neuroticism ",
    "Openness",
  ];

  const datasets = [
    {
      label: "blub",
      backgroundColor: undefined,
      borderColor: "transparent",
      pointBackgroundColor: "transparent",
      pointBorderColor: undefined,
      pointBorderWidth: 0,
      pointHitRadius: 0,
      data: [3.7, 3.3, 3.6, 3.8, 3.9],
      fill: false,
      datalabels: {
        display: true,
        color: "#00000088",
        font: {
          weight: "bold",
        },
        formatter: function (_, context) {
          return context.chart.data.labels[context.dataIndex];
        },
        rotation: function (context) {
          if (context.dataIndex === 0) return 90;
          if (context.dataIndex === 1) return -17;
          if (context.dataIndex === 2) return 53;
          if (context.dataIndex === 3) return -55;
          else return 15;
        },
        align: "center",
        clamp: true,
        padding: 8,
      },
    },
    {
      label,
      backgroundColor: "#1890ff55",
      borderColor: "#1890ff",
      pointBackgroundColor: undefined,
      pointBorderColor: undefined,
      pointBorderWidth: 0,
      pointHitRadius: 20,
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(179,181,198,1)",
      data: data,
      fill: true,
    },
  ];

  const finalData = { labels, datasets };

  const oldIndex = useRef();

  const options = {
    onHover: (_, b, __) => {
      if (!b || b.length < 1) return;
      const index = b[0].index;
      if (oldIndex.current !== index) {
        oldIndex.current = index;
        if (onHoverIndexChanged) onHoverIndexChanged(index);
      }
    },

    interaction: {
      intersect: false,
      mode: "index",
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
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },

    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        enabled: true,
        filter: function (tooltipItem) {
          return tooltipItem.datasetIndex !== 0;
        },
      },
    },
    aspectRatio: 1,
  };

  return (
    <ChartJS
      type="radar"
      options={options}
      data={finalData}
      plugins={[ChartDataLabels]}
    />
  );
};
