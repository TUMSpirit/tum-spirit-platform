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
            <div className="tw-flex tw-items-baseline tw-gap-2">
                <h3 className="tw-font-semibold tw-text-4xl">{value}</h3>
                <small
                    className={twMerge(
                        "tw-text-lg tw-font-semibold",
                        changeCls
                    )}
                >
                    {change}
                </small>
            </div>
        </DashboardCard>
    );
};
