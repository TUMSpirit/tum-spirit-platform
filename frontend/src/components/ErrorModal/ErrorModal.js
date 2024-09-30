import React, { useState } from "react";
import { Modal } from "antd";
import ghostError from "../../assets/images/error_smooth.png"

//{isModalVisible, setIsModalVisible}
const ErrorModal = ({isModalVisible, setIsModalVisible}) => {

    // Function to handle modal close
    const handleClose = () => setIsModalVisible(false);

    return (
        <Modal
            open={isModalVisible}
            onCancel={handleClose}
            footer={null}
            closeIcon={<span style={{ fontSize: "1.5em", cursor: "pointer" }}>✕</span>}
            centered
            bodyStyle={{ textAlign: 'center', padding: '2em' }}
        >
            <div className="flex flex-col justify-center items-center h-full">
                <img
                    src={ghostError}
                    alt="404 - Nothing here yet!"
                    style={{margin: "auto", width:"360px"}}
                    className="justify-center mt-28 mb-2"
                />
                <p className="text-l text-gray-400 mb-2">Hang in there - we are currently working on it!</p>
            </div>
        </Modal>
    );
};

export default ErrorModal;
