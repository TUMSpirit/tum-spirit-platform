import { DashboardCard } from "./DashboardCard";
import { twMerge } from "tailwind-merge";

export const StatCard = ({
    caption,
    value,
    change,
    changeCls,
    helpContent,
}) => {
    return (
        <DashboardCard caption={caption} helpContent={helpContent}>
            <div className="flex items-baseline gap-2">
                <h3 className="font-semibold text-4xl">{value}</h3>
                <small className={twMerge("text-lg font-semibold", changeCls)}>
                    {change}
                </small>
            </div>
        </DashboardCard>
    );
};
