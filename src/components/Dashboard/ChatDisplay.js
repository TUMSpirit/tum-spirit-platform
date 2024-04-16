import { Timeline, ConfigProvider } from "antd";
import { DashboardCard } from "./layout/DashboardCard";
import { useChatTimelineData } from "./model/useChatTimelineData";
import { LoadingOutlined } from "@ant-design/icons";
import { useFilter } from "./context/useFilter";

export const ChatDisplay = (props) => {
    const { endDate } = useFilter();

    const chatTimelineData = useChatTimelineData();
    const timelineList =
        typeof endDate === "undefined"
            ? [
                  ...chatTimelineData,
                  {
                      dot: <LoadingOutlined />,
                      children: (
                          <>
                              <b>Recording new data..</b>{" "}
                              <i>Last updated just now.</i>
                          </>
                      ),
                  },
              ]
            : chatTimelineData;

    return (
        <DashboardCard {...props} caption="Chat Data">
            <ConfigProvider
                theme={{
                    components: {
                        Timeline: {
                            itemPaddingBottom: 2,
                        },
                    },
                }}
            >
                <Timeline
                    className="timelinelist tw-mt-4 -tw-mb-8"
                    items={timelineList}
                />
            </ConfigProvider>
        </DashboardCard>
    );
};
