import React, { useState, useEffect } from "react";
import { Dropdown, Button, Avatar, Typography, Badge } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

const OnlineUsersDropdown = ({ onlineStatus, users, currentUser }) => {
  const [items, setItems] = useState([]); // State to hold dropdown items

  useEffect(() => {
    // Dynamically create dropdown items based on all users, excluding the current user
    const dropdownItems = users
      .filter(user => user.username !== currentUser.username) // Exclude current user
      .map((user, index) => {
        const isOnline = onlineStatus[user.username] === "online";
        return {
          key: `${index + 1}`,
          label: (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Avatar and user details with Badge for the dot */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Badge
                  dot
                  offset={[-12, 28]} // Adjust the offset to position the dot over the avatar
                  style={{ backgroundColor: isOnline ? "#53C41B" : "grey", height: '8px', width: '8px'}} // Green for online, grey for offline
                >
                  <Avatar
                    style={{ backgroundColor: user.avatar_color, marginRight: "8px" }}
                    src={user.avatar_url || null}
                  >
                    {!user.avatar_url && user.username[0]} {/* Show first letter if no URL */}
                  </Avatar>
                </Badge>
                <div style={{marginLeft:'5px'}}>
                  <Text>{user.username}</Text>
                  <Text
                    type={isOnline ? "success" : "secondary"}
                    style={{ display: "block", fontSize: "12px" }}
                  >
                    {isOnline ? "User online" : "User offline"}
                  </Text>
                </div>
              </div>
            </div>
          ),
        };
      });

    setItems(dropdownItems); // Set the items state
  }, [onlineStatus, users, currentUser]);

  const onlineCount = users.filter(user => onlineStatus[user.username] === "online" && user.username !== currentUser).length;

  return (
    <Dropdown
      menu={{
        items, // Use the state variable `items`
      }}
      placement="bottomRight"
    >
      <Button style={{ marginRight: "15px", padding: "0 8px" }} size="small">
        Online ({onlineCount})
      </Button>
    </Dropdown>
  );
};

export default OnlineUsersDropdown;
