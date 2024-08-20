import React, {useEffect, useState } from "react";
import { Tabs, ConfigProvider } from "antd";
import { ChatDashboard } from "../ChatDashboard";
import { KanbanDashboard } from "../KanbanDashboard";

import { FilterContext } from "../context/FilterContext";
import { DatePicker } from "antd";
import { TraitDashboard } from "../TraitDashboard";
import { SubHeader } from "../../../layout/SubHeader";
import { useSubHeader } from "../../../layout/SubHeaderContext";
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

  const [currentTab, setCurrentTab] = useState("1");
  const {setSubHeaderComponent} = useSubHeader();

  useEffect(() => {
    setSubHeaderComponent({
      component: (
        <>
                <div className="relative">
            {currentTab !== "1" && (
              <div className="md:absolute justify-center right-0 top-0 pt-2 md:-m-2 flex gap-2 items-baseline">
                <span className="font-bold">Filter:</span>
                <RangePicker
                  onChange={(values) => {
                    setStartDate(values ? values[0] : undefined);
                    setEndDate(values ? values[1] : undefined);
                  }}
                />
              </div>
            )}
            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    horizontalMargin: "-10px 0 0 0",
                    horizontalItemGutter: 12,
                    margin: 0,
                  },
                },
              }}
            >
              <Tabs
                defaultActiveKey="1"
                items={items.map((item) => ({
                  key: item.key,
                  label: item.label,
                }))}
                onChange={setCurrentTab}
              />
            </ConfigProvider>
          </div>
        </>
      )
    });

    return () => setSubHeaderComponent(null); // Clear subheader when unmounting
  }, [items]);
  /*
          <div className="relative">
            {currentTab !== "1" && (
              <div className="md:absolute justify-center right-0 top-0 pt-2 md:-m-2 flex gap-2 items-baseline">
                <span className="font-bold">Filter:</span>
                <RangePicker
                  onChange={(values) => {
                    setStartDate(values ? values[0] : undefined);
                    setEndDate(values ? values[1] : undefined);
                  }}
                />
              </div>
            )}
            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    horizontalMargin: "-10px 0 0 0",
                    horizontalItemGutter: 12,
                    margin: 0,
                  },
                },
              }}
            >
              <Tabs
                defaultActiveKey="1"
                items={items.map((item) => ({
                  key: item.key,
                  label: item.label,
                }))}
                onChange={setCurrentTab}
              />
            </ConfigProvider>
          </div>*/



  return (
    <FilterContext.Provider
      value={{ startDate, endDate, setStartDate, setEndDate }}
    >
      <SubHeader>
        <div className="relative">
          {currentTab !== "1" && (
            <div className="md:absolute justify-center right-0 top-0 pt-2 md:-m-2 flex gap-2 items-baseline">
              <span className="font-bold">Filter:</span>
              <RangePicker
                onChange={(values) => {
                  setStartDate(values ? values[0] : undefined);
                  setEndDate(values ? values[1] : undefined);
                }}
              />
            </div>
          )}
          <ConfigProvider
            theme={{
              components: {
                Tabs: {
                  horizontalMargin: "-10px 0 0 0",
                  horizontalItemGutter: 12,
                  margin: 0,
                },
              },
            }}
          >
            <Tabs
              defaultActiveKey="1"
              items={items.map((item) => ({
                key: item.key,
                label: item.label,
              }))}
              onChange={setCurrentTab}
            />
          </ConfigProvider>
        </div>
      </SubHeader>
      <div id="dashboard-content" className="md:p-6 p-2">
        {items.find((item) => item.key === currentTab).children}
      </div>
    </FilterContext.Provider>
  );
};
export default DashboardTabs;
