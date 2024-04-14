import { useEffect, useRef } from "react";
import { MainChart } from "../charts/MainChart.js";
import { DashboardCard } from "./DashboardCard";
import Sticky from "react-stickynode";

export const OverviewChart = () => {
    const ref = useRef();

    const observer = (e) => {
        let rectTop = document.documentElement.scrollTop;

        let height = rectTop + 200;

        if (height < 200) {
            height = 200;
        } else if (height > 700) height = 700;

        ref.current.style.height = height + "px";
    };

    useEffect(() => {
        window.addEventListener("scroll", observer);
        return () => window.removeEventListener("scroll", observer);
    });

    return (
        <Sticky>
            <div style={{ height: "800px" }}>
                <DashboardCard
                    ref={ref}
                    caption="Overview"
                    className="tw-h-40 tw-w-full tw-mt-4 tw-pb-8 tw-fixed"
                >
                    <MainChart />
                </DashboardCard>
            </div>
        </Sticky>
    );
};
