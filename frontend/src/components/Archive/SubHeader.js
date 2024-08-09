import React from 'react';
import { Button, ConfigProvider, Tabs, Input } from 'antd';

const { Search } = Input;

const SubHeader = ({ currentTab, setCurrentTab, searchTerm, handleSearch, navigateSearchResults }) => {
    const tabsItems = [
        { key: '1', label: 'Group Chat', children: '' },
        { key: '2', label: 'Martin', children: '' },
        { key: '3', label: 'Peter', children: '' },
        { key: '4', label: 'Sophie', children: '' },
    ];

    return (
        <div className="flex flex-col md:flex-row justify-between items-center w-full -mb-2 relative">
            <ConfigProvider
                theme={{
                    token: {
                        lineHeight: 1.3,
                        lineWidth: 10,
                    },
                }}
            >
                <div className="h-14 mt-0 w-full md:w-auto">
                    <Tabs
                        activeKey={currentTab}
                        onChange={(key) => setCurrentTab(key)}
                        items={tabsItems}
                        size="large"
                        tabBarStyle={{
                            marginTop: '4px',
                            borderBottom: 'none',
                        }}
                    />
                </div>
            </ConfigProvider>
            <div className="hidden md:flex flex-grow justify-center -mt-2">
                <div className="h-15 flex items-center gap-5 bg-chat-filter rounded-2xl py-2 px-4">
                    <Button className="bg-white shadow-sm border-gray-300">Kanban Cards</Button>
                    <Button className="bg-white shadow-sm border-gray-300">Polls</Button>
                    <Button className="bg-white shadow-sm border-gray-300">Documents</Button>
                </div>
            </div>
            <div className="hidden md:block -mt-2">
                <Search
                    placeholder="input search text"
                    size="large"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onSearch={handleSearch}
                    onPressEnter={navigateSearchResults}
                    className="max-w-[300px]"
                />
            </div>
            <div className="border-t-2 border-gray-200 absolute bottom-0 w-full"></div>
        </div>
    );
};

export default SubHeader;
