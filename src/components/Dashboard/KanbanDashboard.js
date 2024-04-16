import { Timeline } from "antd";

import { DashboardCard } from "./layout/DashboardCard";

import { TaskMetricsChart } from "./charts/TaskMetricsChart.js";
import { StatCard } from "./layout/StatCard.js";
import { useTaskMetricsData } from "./model/useTaskMetricsData.js";
import { useTaskLogData } from "./model/useTaskLogData.js";

export const KanbanDashboard = () => {
    const { data } = useTaskMetricsData();
    const timelineList = useTaskLogData();

    const stats2 = [
        {
            caption: "Avg Complete Time",
            value: data.averages.completeTime,
            change: "-9%",
            changeCls: "tw-text-blue-500",
            helpContent: "Plah Plah Plah",
        },
        {
            caption: "Avg Overdue Time",
            value: data.averages.overdueTime,
            change: "+20%",
            changeCls: "tw-text-red-500",
            helpContent: "Plah Plah Plah",
        },
    ];

    return (
        <div className="layout-content">
            <div className="tw-grid tw-grid-cols-4 tw-gap-4">
                <div className="tw-grid tw-col-span-2 tw-grid-cols-2 tw-gap-2 tw-auto-rows-min">
                    <DashboardCard caption="Task Stats" helpContent="Metrics">
                        <TaskMetricsChart
                            data={[data.done, data.todo, data.overdue]}
                        />
                    </DashboardCard>
                    <div className="tw-grid tw-gap-2 tw-auto-rows-min">
                        {stats2.map((entry, index) => (
                            <StatCard key={index} {...entry} />
                        ))}
                    </div>
                </div>
                <DashboardCard
                    caption={"Task Log"}
                    className="tw-col-span-2"
                    helpContent="task log"
                >
                    <Timeline
                        className="timelinelist tw-mt-4 -tw-mb-10"
                        items={timelineList}
                    />
                </DashboardCard>
            </div>
        </div>
    );
};
