import React, { useState, useEffect } from 'react';
import { Button, ConfigProvider, Tabs, Dropdown, Menu, Avatar } from "antd";
import { EditOutlined, DeleteOutlined, SmileOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import { SubHeader } from "../../layout/SubHeader";
import Search from "antd/es/input/Search";

const AnotherComponent = () => {
    const [currentTab, setCurrentTab] = useState('1');

    const tabsItems = [
        { key: '1', label: 'Tab 1', children: 'Content of Tab 1' },
        { key: '2', label: 'Tab 2', children: 'Content of Tab 2' },
        { key: '3', label: 'Tab 3', children: 'Content of Tab 3' },
    ];

    const handleTabChange = (key) => {
        setCurrentTab(key);
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#00b96b',
                },
            }}
        >
            <div>
                <SubHeader className="sticky top-0 z-10 shadow-md bg-white">
                    <Tabs activeKey={currentTab} onChange={handleTabChange} items={tabsItems} />
                    <Search
                        placeholder="Search something..."
                        enterButton
                        className="ml-auto w-1/3"
                    />
                </SubHeader>
                <div className="p-4">
                    {tabsItems.find(item => item.key === currentTab)?.children}
                </div>
            </div>
        </ConfigProvider>
    );
};

export default AnotherComponent;
