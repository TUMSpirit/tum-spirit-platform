import { Timeline } from "antd";
import { DashboardCard } from "./layout/DashboardCard";
import { TaskMetricsChart } from "./charts/TaskMetricsChart";
import { StatCard } from "./layout/StatCard";
import { useTaskMetricsData } from "./model/useTaskMetricsData";
import { useTaskLogData } from "./model/useTaskLogData";

export const KanbanDashboard = () => {
    const { loading, data } = useTaskMetricsData();
    const timelineList = useTaskLogData();

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a spinner or loading animation
    }
    // Task stats with new metrics
    const stats = [
        { caption: "Backlog", value: data.task_counts.backlog },
        { caption: "Doing", value: data.task_counts.doing },
        { caption: "Testing", value: data.task_counts.testing },
        { caption: "Done", value: data.task_counts.done },
    ];

    const additionalStats = [
        {
            caption: "Avg Description Words",
            value: data.avg_description_word_count,
            helpContent: "Average word count of task descriptions.",
        },
        {
            caption: "Tasks Created Last Week",
            value: data.tasks_created_last_week,
            helpContent: "Number of tasks created in the last week.",
        },
        {
            caption: "Tasks Created Last Month",
            value: data.tasks_created_last_month,
            helpContent: "Number of tasks created in the last month.",
        },
        {
            caption: "Avg Task Age",
            value: data.avg_task_age,
            helpContent: "Average age of tasks.",
        },
    ];

    const priorityStats = [
        {
            caption: "Low Priority",
            value: data.priority_counts.low,
        },
        {
            caption: "Medium Priority",
            value: data.priority_counts.medium,
        },
        {
            caption: "High Priority",
            value: data.priority_counts.high,
        },
    ];

    return (
        <div className="layout-content">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Task Counts */}
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} className="col-span-1" />
                ))}

                {/* Additional Task Stats */}
                {additionalStats.map((entry, index) => (
                    <StatCard key={index} {...entry} className="col-span-1" />
                ))}

                {/* Task Metrics Chart */}
                <DashboardCard
                    caption="Task Metrics"
                    helpContent="Task metrics over time."
                    className="col-span-1 lg:col-span-2"
                >
                    <TaskMetricsChart data={data.task_counts} />
                </DashboardCard>

                {/* Priority Breakdown */}
                <DashboardCard
                    caption="Priority Breakdown"
                    helpContent="Tasks grouped by priority."
                    className="col-span-1 lg:col-span-2"
                >
                    <TaskMetricsChart data={priorityStats} isPriority={true} />
                </DashboardCard>
                {/* Task Log */}
                <DashboardCard
                    caption="Task Log"
                    helpContent="Task log details"
                    className="col-span-1 lg:col-span-4"
                >
                    <div
                        className="overflow-y-auto"
                        style={{
                            maxHeight: "320px", // Adjust the height as needed
                            paddingRight: "12px", // To avoid content hiding behind scrollbar
                        }}
                    >
                        <Timeline className="timelinelist mt-4 -mb-10" items={timelineList} />
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};
