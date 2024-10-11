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

    /*if (error) {
        return <div className="text-red-500">Failed to load data.</div>;
    }*/

    const stats = [
        {
            caption: "Sentiment",
            value: data.sentiment != null ? data.sentiment.toFixed(2) : "N/A",
            change: "+3.2%",
            changeCls: "text-green-500",
            helpContent: "Sentiment is a measure of the positivity in messages. Ranges from -1 to 1, where -1 indicates very negative sentiment, 0 is neutral, and 1 is very positive.",
        },
        {
            caption: "Subjectivity",
            value: data.subjectivity != null ? data.subjectivity.toFixed(2) : "N/A",
            change: "+9%",
            changeCls: "text-red-500",
            helpContent: "Subjectivity indicates how personal or opinionated messages are. Ranges from 0 to 1, where 0 is very objective (factual) and 1 is highly subjective (personal or opinion-based).",
        },
        {
            caption: "Grammar",
            value: data.grammar ? data.grammar.toFixed(2) : "N/A",
            change: "-20%",
            changeCls: "text-red-500",
            helpContent: "Grammar measures the percentage of grammatical mistakes in a sentence. A lower value means better grammar, while a higher value suggests more errors; A value of 25% would indicate an Error in every 4th word.",
        },
        {
            caption: "Precision",
            value: data.precision ? data.precision.toFixed(2) : "N/A",
            change: "+10%",
            changeCls: "text-green-500",
            helpContent: "Precision measures the readability of messages based on the Flesch Reading Ease scale. Ranges from 0 to 100, where higher values (60-100) indicate easier readability, and lower values (0-30) suggest more complex or difficult-to-read text.",
        },
    ];
    
    /*
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
    */

    return (
        <DashboardGraphsContext.Provider
            value={{ extraGraphs, setExtraGraphs }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-2 auto-rows-min">
                    <ChatDisplay className="col-span-2" />
                    {stats.map((entry, index) => (
                        <StatCard key={index} {...entry} />
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
