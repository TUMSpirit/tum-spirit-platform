import { DashboardCard } from "./layout/DashboardCard.js";

import { StatCard } from "./layout/StatCard.js";
import { ChatDisplay } from "./ChatDisplay.js";
import { AddDisplay } from "./AddDisplay.js";
import { getHelpContent } from "./help/helpContent.js";
import { DashboardGraphsContext } from "./context/DashboardGraphsContext.js";
import { useState } from "react";
import { SentimentChart } from "./charts/SentimentChart.js";
import { SubjectivityChart } from "./charts/SubjectivityChart.js";
import { LanguageAnalysis3D } from "./charts/LanguageAnalysis3D.js";
import { useEffect } from "react";
import { MessagesPerDayHeatmap } from "./charts/MessagesPerDayHeatmap.js";

export const ChatDashboard = () => {
  const stats = [
    {
      caption: "Sentiment",
      value: "0.4",
      change: "+3.2%",
      changeCls: "text-green-500",
      helpContent: "Plah Plah Plah",
    },
    {
      caption: "Subjectivity",
      value: "0.6",
      change: "+9%",
      changeCls: "text-red-500",
      helpContent: "Plah Plah Plah",
    },
    {
      caption: "Grammar",
      value: "0.43",
      change: "-20%",
      changeCls: "text-red-500",
      helpContent: "Plah Plah Plah",
    },
    {
      caption: "Precision",
      value: "0.7",
      change: "10%",
      changeCls: "text-blue-500",
      helpContent: "Plah Plah Plah",
    },
  ];

  const [extraGraphs, setExtraGraphs] = useState(() => {
    const saved = localStorage.getItem("extraGraphs");
    const initialValue = JSON.parse(saved);
    return initialValue || [];
  });

  useEffect(() => {
    localStorage.setItem("extraGraphs", JSON.stringify(extraGraphs));
  }, [extraGraphs]);

  const deleteFromExtraGraphs = (key) => {
    console.log("delete", key);
    setExtraGraphs((prev) => prev.filter((v) => v !== key));
  };

  return (
    <DashboardGraphsContext.Provider value={{ extraGraphs, setExtraGraphs }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-min">
          <ChatDisplay className="col-span-2" />
          {stats.map((entry, index) => (
            <StatCard key={index} {...entry} />
          ))}
        </div>
        {extraGraphs.map((key) => {
          if (key === "sentiment")
            return (
              <DashboardCard
                className="h-96 pb-6"
                caption="Sentiment"
                helpContent={getHelpContent(key)}
                key={key}
                deleteButton={() => deleteFromExtraGraphs(key)}
              >
                <SentimentChart />
              </DashboardCard>
            );
          else if (key === "subjectivity")
            return (
              <DashboardCard
                className="h-96 pb-6"
                caption="Subjectivity"
                helpContent={getHelpContent(key)}
                key={key}
                deleteButton={() => deleteFromExtraGraphs(key)}
              >
                <SubjectivityChart />
              </DashboardCard>
            );
          else if (key === "language_3dscatter")
            return (
              <DashboardCard
                className="h-96"
                caption="Language Analysis 3D Scatter"
                helpContent={getHelpContent(key)}
                key={key}
                deleteButton={() => deleteFromExtraGraphs(key)}
              >
                <LanguageAnalysis3D />
              </DashboardCard>
            );
          else if (key === "messages_heatmap")
            return (
              <DashboardCard
                className="h-96"
                caption="Messages per Day Heatmap"
                helpContent={getHelpContent(key)}
                key={key}
                deleteButton={() => deleteFromExtraGraphs(key)}
              >
                <div className="flex h-full w-full items-center *:w-full">
                  <MessagesPerDayHeatmap />
                </div>
              </DashboardCard>
            );
          else return key;
        })}
        <AddDisplay />
      </div>
    </DashboardGraphsContext.Provider>
  );
};
