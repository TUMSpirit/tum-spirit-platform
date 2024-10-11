import { Modal, Menu, Button } from "antd";
import { useState } from "react";
import { getHelpContent } from "./help/helpContent";
import { useDashboardGraphsContext } from "./context/useDashboardGraphsContext";

const stateGraphOptions = [
    { label: "Subjectivity Line Chart", key: "subjectivity" },
    { label: "Sentiment Line Chart", key: "sentiment" },
    { label: "Language Analysis 3D Scatter", key: "language_3dscatter" },
    { label: "Chat Messages per Day Heatmap", key: "messages_heatmap" },
];

export const AddDisplay = () => {
    const { extraGraphs, setExtraGraphs } = useDashboardGraphsContext();

    const [open, setOpen] = useState(false);

    const [currentSelection, setCurrentSelection] = useState();

    const onSelect = ({ key }) => {
        setCurrentSelection(key);
    };

    const onOk = () => {
        setExtraGraphs((prev) => [...prev, currentSelection]);
        setCurrentSelection(undefined);
        setOpen(false);
    };

    const onCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-lg p-10 border-2 border-dashed border-gray-300 text-gray-500"
            >
                Add Graph
            </button>
            <Modal
                title="Select Graph to add to Dashboard"
                centered
                open={open}
                onOk={onOk}
                onCancel={onCancel}
                // Make width responsive
                width="90%"
                style={{ maxWidth: 600 }}
                footer={[
                    <Button onClick={onCancel}>Cancel</Button>,
                    <Button
                        onClick={onOk}
                        type="primary"
                        className="bg-blue-500"
                        disabled={typeof currentSelection === "undefined"}
                    >
                        Add
                    </Button>,
                ]}
                bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }}
            >
                <div className="flex flex-col md:flex-row">
                    <Menu
                        onSelect={onSelect}
                        style={{
                            width: "100%",
                            maxWidth: 260,
                        }}
                        mode="inline"
                        items={[
                            {
                                type: "group",
                                label: "State",
                                key: "state",
                                children: stateGraphOptions.map((option) =>
                                    extraGraphs.includes(option.key)
                                        ? { ...option, disabled: true }
                                        : option
                                ),
                            },
                        ]}
                    />
                    <div className="mt-4 md:mt-0 md:ml-6 px-4 md:px-6">
                        <h1 className="text-lg md:text-xl font-bold mb-2">
                            {
                                stateGraphOptions.find(
                                    (el) => el.key === currentSelection
                                )?.label
                            }
                        </h1>
                        <p className="text-sm md:text-base">
                            {getHelpContent(currentSelection)}
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
};
