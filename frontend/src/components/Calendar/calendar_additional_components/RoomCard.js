import React, { useState } from 'react';
import { List, Badge, Button, Tooltip, Progress, Modal } from 'antd';
import { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';

const RoomListItem = ({ room, onOpenIframe, onRoomSelect, selectedRoom }) => {
    // Determine the room status
    let statusText;
    let badgeStatus;
    let buildingCode = room.gebaeude_code;

    // Modify room code as per your conditions
    let roomCode = room.raum_code;
    if (/^[1-9]/.test(roomCode)) {
        roomCode = '0' + roomCode;
    } else if (/^Z/.test(roomCode)) {
        roomCode = roomCode.replace('Z', 'Z1');
    } else if (/^0./.test(roomCode)) {
        roomCode = roomCode.replace('0.', 'EG.');
    }

    let isSelected= selectedRoom === buildingCode + "." + roomCode; 

    const navUrl = `https://nav.tum.de/room/${room.gebaeude_code}.${roomCode}/`;

    if (room.status === 'frei') {
        statusText = 'Free';
        badgeStatus = 'success';
    } else if (room.status === 'belegt') {
        statusText = `Booked until ${moment(room.belegung_bis).format('DD/MM, HH:mm')}`;
        badgeStatus = 'error';
    } else if (room.status === 'WAAS') {
        statusText = "Crowded";
        badgeStatus = 'warning';
    } else {
        statusText = 'Unknown Status';
        badgeStatus = 'default';
    }

    // Conditional background styling for selected room
    const itemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: isSelected ? '#DCEDFF' : 'white',  // Highlight selected room
        marginBottom: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    };

    return (
        <List.Item
            style={itemStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = isSelected ? '#e6f7ff' : '#f0f2f5';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = isSelected ? '#e6f7ff' : 'white';
            }}
            onClick={() => onRoomSelect(buildingCode + "." + roomCode)}  // Trigger room selection on card click
        >
            <div>
                <h3 style={{ marginBottom: '4px' }}>{room.raum_name}</h3>
                <p style={{ margin: 0 }}>Room ID: {room.raum_nr}</p>
                {/*  <p style={{ margin: 0 }}>Status: {statusText}</p>*/}
                <p style={{ margin: 0 }}>Location: {room.gebaeude_name}, Room {room.raum_nummer}</p>
            </div>
            <div style={{ display: 'flex', justifyContent:'space-betweeen', alignItems: 'center', gap: '12px' }}>
                {/* Calendar button */}
                   {/*<Tooltip title="View Occupancy Calendar">
                    <Button
                        icon={<CalendarOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();  // Prevent triggering room selection
                            onOpenIframe(`https://campus.tum.de/tumonline/wbKalender.wbRessource?pResNr=${room.res_nr}`);
                        }}
                    />
                </Tooltip>*/}

                {/* Location button */}
                <Tooltip title="View Location">
                    <Button
                        icon={<EnvironmentOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();  // Prevent triggering room selection
                            onOpenIframe(navUrl);
                        }}
                    />
                </Tooltip>

                {/* Status Badge */}
                <Badge
                    status={badgeStatus}
                    text={statusText}
                    style={{ fontSize: '16px' }}
                />
            </div>
        </List.Item>
    );
};

const RoomList = ({ rooms, onRoomSelect, selectedRoom, setSelectedRoom }) => {
    const [iframeUrl, setIframeUrl] = useState(null);
    const [isIframeOpen, setIsIframeOpen] = useState(false);
    // Function to open modal with iframe
    const openIframeModal = (url) => {
        setIframeUrl(url);
        setIsIframeOpen(true);
    };

    // Function to close the iframe modal
    const closeIframeModal = () => {
        setIsIframeOpen(false);
        setIframeUrl(null);
    };

    // Function to handle room selection
    const handleRoomSelect = (roomId) => {
        setSelectedRoom(roomId);  // Save selected room ID
        onRoomSelect(roomId);  // Call parent function to pass selected room ID
    };

    // Sort rooms by status (free -> partially occupied -> occupied)
    const sortedRooms = [...rooms].sort((a, b) => {
        if (a.status === 'frei' && b.status !== 'frei') return -1;
        if (a.status !== 'frei' && b.status === 'frei') return 1;
        if (a.status === 'WAAS' && b.status === 'belegt') return -1;
        if (a.status === 'belegt' && b.status === 'WAAS') return 1;
        return 0;
    });

    return (
        <>
            <List
                dataSource={sortedRooms}
                renderItem={room => (
                    <RoomListItem
                        key={room.raum_nr}
                        room={room}
                        onOpenIframe={openIframeModal}
                        onRoomSelect={handleRoomSelect}
                        selectedRoom={selectedRoom}
                    />
                )}
                style={{ marginTop: '16px' }}
            />

            {/* Modal to display the iframe */}
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>External Page</span>
                    </div>
                }
                open={isIframeOpen}
                onCancel={closeIframeModal}
                footer={null}
                width="90%"
                bodyStyle={{ height: '80vh', padding: 0 }}
            >
                {iframeUrl && (
                    <iframe
                        src={iframeUrl}
                        title="Room Info"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                )}
            </Modal>
        </>
    );
};

export default RoomList;
