import React, { useState, useEffect } from "react";
import { Row, Col, Dropdown, Button, Avatar, Space, Badge } from "antd";
import { SolutionOutlined, MenuUnfoldOutlined, SettingOutlined, LogoutOutlined, ScheduleOutlined } from "@ant-design/icons";
import { useSignOut } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TutorialPopup from '../components/TutorialPopup/TutorialPopup';
import { useAuthHeader } from "react-auth-kit";
import { useSocket } from "../context/SocketProvider";
import { useUnreadMessage } from "../context/UnreadMessageContext";
import { useSubHeader } from "./SubHeaderContext";
import PushNotificationModal from "../components/PushNotification/PushNotificationModal";
import ImprintModal from "../components/Imprint/ImprintModal";
import ErrorModal from "../components/ErrorModal/ErrorModal";
import OnlineUsersDropdown from "./OnlineUsersDropdown";
import curriedAdjustHue from "polished/lib/color/adjustHue";

function Header({
  placement,
  name,
  subName,
  onPress,
  handleSidenavColor,
  handleSidenavType,
  handleFixedNavbar,
}) {

  const authHeader = useAuthHeader();
  const { getUnreadMessages, incrementNotifications, markAsRead, setLastVisited, unreadMessages } = useUnreadMessage();
  const { socket, onlineStatus, currentUser } = useSocket();
  const [sidenavType, setSidenavType] = useState("transparent");
  const [visible, setVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [imprintVisible, setImprintVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [coins, setCoins] = useState(0);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState();
  const [teamMembers, setTeamMembers] = useState([]);
  const logout = useSignOut();
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { subHeaderComponent } = useSubHeader();


  useEffect(() => window.scrollTo(0, 0));

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/me',
          {
            headers: {
              "Authorization": authHeader()
            }
          });
        setMe(response.data);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get("/api/get-team-members", {
          headers: {
            Authorization: authHeader(),
          },
        });
        setTeamMembers(response.data);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      }
    };
    fetchTeamMembers();
    fetchCurrentUser();
  }, []);

  const showDrawer = () => setVisible(true);
  const hideDrawer = () => setVisible(false);

  // const { subHeader } = useSubHeaderContext();

  const handleLogout = () => {
    // Aufruf der logout-Funktion, um den Benutzer abzumelden
    //updateLastLoggedIn();
    socket.disconnect();
    logout();
    navigate("/login");
    // Optional: Hier könntest du zur Startseite oder einer anderen Seite weiterleiten
  };

  const showTutorials = () => {
    setIsModalVisible(true);
  };

  const showImprint = () => {
    setImprintVisible(true);
  };

  const showSettings = () => {
    setModalIsOpen(true);
  };

  const handleOpenChange = (nextOpen, info) => {
    if (info.source === 'trigger' || nextOpen) {
      setOpen(nextOpen);
    }
  };

  const handleMenuClick = (e) => {
    if (e.key !== '0') {
      setOpen(false);
    }
  };

  const items = [
    {
      label: <div className='pt-2 pb-2 pr-2'><Space>
        <Avatar style={{ backgroundColor: me ? me.avatar_color : "grey" }}>
          {me ? me.username[0] : ""}
        </Avatar>{me ? me.username : ""}</Space></div>,
      key: '0'
    },
    {
      type: 'divider',
    },
    {
      label: <div>Settings</div>,
      icon: <SettingOutlined />,
      onClick: showSettings,
      key: '1',
    },
    {
      label: <div>Impressum</div>,
      icon: <SolutionOutlined />,
      onClick: showImprint,
      key: '2',
    },
    {
      label: 'Tutorials',
      icon: <ScheduleOutlined />,
      onClick: showTutorials,
      key: '3',
    },
    {
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      key: '4',
    },
  ];

  /*SHOPP AND COINS
     <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            style={{ marginRight: "10px" }}
          />
          <Badge count={coins} showZero overflowCount={999} style={{ backgroundColor: '#52c41a', marginRight: "20px" }}>
            <TrophyTwoTone twoToneColor="#fadb14" style={{ fontSize: '32px', marginRight: "20px" }} />
          </Badge>*/
  return (
    <>
      <div className="flex items-end justify-end">
        <div className="mr-auto header-control">
          <Button
            icon={<MenuUnfoldOutlined />}
            className="sidebar-toggler"
            onClick={() => {
              onPress();
            }}
          />
        </div>

        {me && (
          <OnlineUsersDropdown
            onlineStatus={onlineStatus}
            users={teamMembers}
            currentUser={currentUser} // Pass the users list here
          />
        )}
        
        {me && (

          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick,
            }}
            trigger={['click']}
            onOpenChange={handleOpenChange}
            open={open}
          >
            <Badge
              dot={onlineStatus[me.username] === "online"}
              offset={[-5, 28]}
              style={{ backgroundColor: onlineStatus[me.username] === "online" ? "#53C41B" : "grey", height: '10px', width: '10px' }}
            >
              <Avatar
                className="cursor-pointer"
                style={{ backgroundColor: me.avatar_color }}
              >{me.username[0]}</Avatar>
            </Badge>
          </Dropdown>
        )}
      </div>
      <Row style={{ paddingBottom: "16px" }} gutter={[24, 0]}>
        <Col span={24}>
          <div className="ant-page-header-heading">
            <span
              className="ant-page-header-heading-title"
              style={{ textTransform: "capitalize" }}
            >
              {subName.replace("/", "")}
            </span>
          </div>
        </Col>
      </Row>
      {subHeaderComponent && (
        <div className="header-subheader">
          {subHeaderComponent.component}
        </div>
      )}
      <PushNotificationModal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen}></PushNotificationModal>
      <ImprintModal isVisible={imprintVisible} setIsVisible={setImprintVisible}></ImprintModal>
      <TutorialPopup open={popupVisible} setVisible={setPopupVisible} coins={coins} setCoins={coins}></TutorialPopup>
      <ErrorModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}></ErrorModal>
    </>
  );
}

export default Header;


/*       
{me && (
  <Dropdown
    menu={{ items: menuItems }}
    trigger={["click"]}
    open={open}
  >
    <div>
      <Badge
        dot={onlineStatus[me.username] === "online"}
        offset={[-25, 30]}
        style={{ backgroundColor: onlineStatus[me.username] === "online" ? "#53C41B" : "grey", height: '8px', width: '8px' }}
      >
        <Avatar
          className="cursor-pointer"
          style={{ backgroundColor: me.avatar_color }}
        >
          {me.username[0]}
        </Avatar>
      </Badge>
    </div>
  </Dropdown>
)}*/