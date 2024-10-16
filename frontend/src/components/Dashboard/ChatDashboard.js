import { DashboardCard } from "./layout/DashboardCard";
import { StatCard } from "./layout/StatCard.js";
import { ChatDisplay } from "./ChatDisplay.js";
import { AddDisplay } from "./AddDisplay.js";
import { getHelpContent } from "./help/helpContent.js";
import { DashboardGraphsContext } from "./context/DashboardGraphsContext.js";
import { useState } from "react";
import { SentimentChart } from "./charts/SentimentChart.js";
import { SubjectivityChart } from "./charts/SubjectivityChart.js";
import { LanguageAnalysis3D } from "./charts/LanguageAnalysis3D.js";
import { EmotionBarChart } from "./charts/EmotionBarChart.js";
import { useEffect } from "react";
import { MessagesPerDayHeatmap } from "./charts/MessagesPerDayHeatmap.js";
import { useChatMetricsData } from "./model/useChatMetricsData.js";
import { Spin } from "antd";

export const ChatDashboard = () => {
    const { data, loading } = useChatMetricsData(); // Use the custom hook

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spin size="large" tip="Loading dashboard..." />
            </div>
        );
    }

    // Helper function to apply color depending on positive or negative change
    const getChangeClass = (change) => {
        if (change > 0) return "text-green-500";
        if (change < 0) return "text-red-500";
        return "";
    };

    const stats = [
        {
            caption: "Sentiment",
            value: data?.sentiment?.value != null ? data.sentiment.value.toFixed(2) : "N/A",
            change: data?.sentiment?.change != null ? `${data.sentiment.change.toFixed(2)}%` : "N/A",
            changeCls: getChangeClass(data?.sentiment?.change),
            helpContent: "Sentiment is a measure of the positivity in messages. Ranges from -1 to 1, where -1 indicates very negative sentiment, 0 is neutral, and 1 is very positive.",
        },
        {
            caption: "Subjectivity",
            value: data?.subjectivity?.value != null ? data.subjectivity.value.toFixed(2) : "N/A",
            change: data?.subjectivity?.change != null ? `${data.subjectivity.change.toFixed(2)}%` : "N/A",
            changeCls: getChangeClass(data?.subjectivity?.change),
            helpContent: "Subjectivity indicates how personal or opinionated messages are. Ranges from 0 to 1, where 0 is very objective (factual) and 1 is highly subjective (personal or opinion-based).",
        },
        {
            caption: "Grammar",
            value: data?.grammar?.value != null ? data.grammar.value.toFixed(2) : "N/A",
            change: data?.grammar?.change != null ? `${data.grammar.change.toFixed(2)}%` : "N/A",
            changeCls: getChangeClass(data?.grammar?.change),
            helpContent: "Grammar measures the percentage of grammatical mistakes in a sentence. A lower value means better grammar, while a higher value suggests more errors; A value of 25% would indicate an error in every 4th word.",
        },
        {
            caption: "Precision",
            value: data?.precision?.value != null ? data.precision.value.toFixed(2) : "N/A",
            change: data?.precision?.change != null ? `${data.precision.change.toFixed(2)}%` : "N/A",
            changeCls: getChangeClass(data?.precision?.change),
            helpContent: "Precision measures the readability of messages based on the Flesch Reading Ease scale. Ranges from 0 to 100, where higher values (60-100) indicate easier readability, and lower values (0-30) suggest more complex or difficult-to-read text.",
        },
    ];

    return (
        <DashboardGraphsContext.Provider value={{ extraGraphs, setExtraGraphs }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-min">
                    <ChatDisplay className="col-span-2" />
                    {stats.map((entry, index) => (
                        <StatCard
                            key={index}
                            caption={entry.caption}
                            value={entry.value}
                            change={entry.change}
                            changeCls={entry.changeCls}
                            helpContent={entry.helpContent}
                        />
                    ))}
                </div>
                <DashboardCard
                    className="h-96"
                    caption="Emotions Bar Chart"
                    helpContent="Distribution of emotions based on messages."
                >
                    <EmotionBarChart />
                </DashboardCard>
                {extraGraphs.map((key) => {
                    if (key === "sentiment")
                        return (
                            <DashboardCard
                                className="h-96"
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
                                className="h-96"
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
