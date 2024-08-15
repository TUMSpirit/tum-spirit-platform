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
            changeCls: "text-blue-500",
            helpContent: "Plah Plah Plah",
        },
        {
            caption: "Avg Overdue Time",
            value: data.averages.overdueTime,
            change: "+20%",
            changeCls: "text-red-500",
            helpContent: "Plah Plah Plah",
        },
    ];

    return (
        <div className="layout-content">
            <div className="grid grid-cols-4 gap-4">
                <div className="grid col-span-2 grid-cols-2 gap-2 auto-rows-min">
                    <DashboardCard caption="Task Stats" helpContent="Metrics">
                        <TaskMetricsChart
                            data={[data.done, data.todo, data.overdue]}
                        />
                    </DashboardCard>
                    <div className="grid gap-2 auto-rows-min">
                        {stats2.map((entry, index) => (
                            <StatCard key={index} {...entry} />
                        ))}
                    </div>
                </div>
                <DashboardCard
                    caption={"Task Log"}
                    className="col-span-2"
                    helpContent="task log"
                >
                    <Timeline
                        className="timelinelist mt-4 -mb-10"
                        items={timelineList}
                    />
                </DashboardCard>
            </div>
        </div>
    );
};
