import React, { useEffect, useState } from "react";
import { Tabs, ConfigProvider } from "antd";
import { ChatDashboard } from "../ChatDashboard";
import { KanbanDashboard } from "../KanbanDashboard";
import { TraitDashboard } from "../TraitDashboard";
import { FilterContext } from "../context/FilterContext";
import { DatePicker } from "antd";
import { SubHeader } from "../../../layout/SubHeader";
import { useSubHeader } from "../../../layout/SubHeaderContext";
import { useSocket } from "../../../context/SocketProvider"; // Import your useSocket hook
import ghostError from "../../../assets/images/error_404.png"

const { RangePicker } = DatePicker;

const ghostStyle = {
  opacity: 0.80,
  height:'180px'
};

// Assuming you have a loading image for the ghost
const GhostLoading = () => (
  <div className="flex flex-col justify-center items-center h-full">
  <img
    src={ghostError}
    alt="404 - Nothing here yet!"
    style={ghostStyle}
    className="justify-center mt-28 mb-2"
  />
    <p className="text-l text-gray-400 mb-2">Hold tight, something exciting is on the way..</p>
</div>
);

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
  const { setSubHeaderComponent } = useSubHeader();
  // Get the user setting from useSocket
  const { userSettings } = useSocket(); // Ensure this is correctly defined in your useSocket hook



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
            {userSettings.statistics_active ? (
              <Tabs
                defaultActiveKey="1"
                items={items.map((item) => ({
                  key: item.key,
                  label: item.label,
                }))}
                onChange={setCurrentTab}
              />
            ) : (
              <GhostLoading /> // Show the ghost loading image when user_setting is false
            )}
          </ConfigProvider>
        </div>
      </SubHeader>
      <div id="dashboard-content" className="md:p-6 p-2">
        {userSettings.statistics_active
          ? items.find((item) => item.key === currentTab).children
          : <GhostLoading />} {/* Render the dashboard content or the ghost loading */}
      </div>
    </FilterContext.Provider>
  );
};
export default DashboardTabs;
