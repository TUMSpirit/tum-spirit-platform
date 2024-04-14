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
                    "tw-rounded-xl tw-bg-white tw-shadow-sm tw-p-4"
                )}
                {...props}
                ref={ref}
            >
                <div className="tw-flex tw-items-center tw-gap-2 tw-justify-between">
                    <div className="tw-flex tw-items-baseline tw-gap-2 tw-text-md">
                        <h3 className="tw-text-gray-500 tw-font-bold tw-uppercase">
                            {caption}
                        </h3>
                        {helpContent ? (
                            <Popover
                                content={helpContent}
                                title={caption + " Explanation"}
                                trigger="click"
                            >
                                <QuestionCircleOutlined className="tw-text-blue-400 tw-cursor-pointer" />
                            </Popover>
                        ) : (
                            <></>
                        )}
                    </div>
                    {deleteButton && (
                        <button
                            className="tw-h-6 tw-w-6 tw-rounded-full hover:tw-bg-gray-100 tw-flex tw-justify-center tw-items-center"
                            onClick={deleteButton}
                        >
                            <DeleteOutlined className="tw-text-red-400 tw-cursor-pointer" />
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
