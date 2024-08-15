import { DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { twMerge } from "tailwind-merge";
import { Popover } from "antd";
import { forwardRef, useState } from "react";
import { Tabs, ConfigProvider } from "antd";

export const DashboardCard = forwardRef(
    (
        {
            className,
            children,
            caption,
            helpContent,
            tabs,
            deleteButton,
            ...props
        },
        ref
    ) => {
        const [currentTab, setCurrentTab] = useState(
            tabs ? tabs.length - 1 : 0
        );

        const onChange = (key) => {
            setCurrentTab(key);
        };

        return (
            <div
                className={twMerge(
                    className,
                    "rounded-xl bg-white shadow-sm p-4"
                )}
                {...props}
                ref={ref}
            >
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-baseline gap-2 text-md">
                        <h3 className="text-gray-500 font-bold uppercase">
                            {caption}
                        </h3>
                        {helpContent ? (
                            <Popover
                                content={helpContent}
                                title={caption + " Explanation"}
                                trigger="click"
                            >
                                <QuestionCircleOutlined className="text-blue-400 cursor-pointer" />
                            </Popover>
                        ) : (
                            <></>
                        )}
                    </div>
                    {deleteButton && (
                        <button
                            className="h-6 w-6 rounded-full hover:bg-gray-100 flex justify-center items-center"
                            onClick={deleteButton}
                        >
                            <DeleteOutlined className="text-red-400 cursor-pointer" />
                        </button>
                    )}
                    {tabs && (
                        <ConfigProvider
                            theme={{
                                components: {
                                    Tabs: {
                                        horizontalMargin: 0,
                                        horizontalItemPadding: 0,
                                        horizontalItemGutter: 8,
                                        margin: 0,
                                    },
                                },
                            }}
                        >
                            <Tabs
                                defaultActiveKey={tabs ? tabs.length - 1 : 0}
                                items={tabs.map((tab, i) => ({
                                    key: i,
                                    label: tab.label,
                                }))}
                                onChange={onChange}
                            />
                        </ConfigProvider>
                    )}
                </div>
                {tabs && tabs[currentTab].children}
                {children}
            </div>
        );
    }
);
