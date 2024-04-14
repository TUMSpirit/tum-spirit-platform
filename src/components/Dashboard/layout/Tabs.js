import React, { useState } from "react";
import { Tabs } from "antd";
import { ChatDashboard } from "../ChatDashboard";
import { KanbanDashboard } from "../KanbanDashboard";

import { FilterContext } from "../context/FilterContext";
import { DatePicker } from "antd";
import { TraitDashboard } from "../TraitDashboard";
const { RangePicker } = DatePicker;

const items = [
    {
        key: "1",
        label: "Personality",
        children: <TraitDashboard />,
    },
    {
        key: "2",
        label: "Chat",
        children: <ChatDashboard />,
    },
    {
        key: "3",
        label: "Kanban",
        children: <KanbanDashboard />,
    },
];

const DashboardTabs = () => {
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const [showFilter, setShowFilter] = useState(false);

    return (
        <FilterContext.Provider
            value={{ startDate, endDate, setStartDate, setEndDate }}
        >
            {showFilter && (
                <div className="md:tw-absolute tw-justify-center tw-right-6 tw-top-0 tw-pt-2 tw-flex tw-gap-2 tw-items-baseline">
                    <span className="tw-font-bold">Filter:</span>
                    <RangePicker
                        onChange={(values) => {
                            setStartDate(values ? values[0] : undefined);
                            setEndDate(values ? values[1] : undefined);
                        }}
                    />
                </div>
            )}
            <Tabs
                className="tw-px-6"
                defaultActiveKey="1"
                items={items}
                onChange={(key) => setShowFilter(key !== "1")}
            />
        </FilterContext.Provider>
    );
};
export default DashboardTabs;
