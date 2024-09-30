import React from 'react';
import { useState, useEffect } from "react";

import {
  Row,
  Col,
  Dropdown,
  Button,
  Avatar,
  Space
} from "antd";

import {
  SolutionOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  LogoutOutlined,
  ScheduleOutlined
} from "@ant-design/icons";
//import { useSubHeaderContext } from "./SubHeaderContext";
import { useSignOut } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import TutorialPopup from '../components/TutorialPopup/TutorialPopup';
import ImprintModal from '../components/Imprint/ImprintModal';
import ErrorModal from '../components/ErrorModal/ErrorModal';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { useSocket } from '../context/SocketProvider';
import { useUnreadMessage } from '../context/UnreadMessageContext';
import { useSubHeader } from "./SubHeaderContext";
import PushNotificationModal from '../components/PushNotification/PushNotificationModal';


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
  const { socket } = useSocket();
  const [sidenavType, setSidenavType] = useState("transparent");
  const [visible, setVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [imprintVisible, setImprintVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [coins, setCoins] = useState(0);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState();
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
          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick,
            }}
            trigger={['click']}
            onOpenChange={handleOpenChange}
            open={open}
          >
            <Avatar
              className="cursor-pointer"
              style={{ backgroundColor: me.avatar_color }}
            >{me.username[0]}</Avatar>
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


        <Row >
        <Col span={8} md={8} className="header-control">

<Button
                icon={<MenuUnfoldOutlined />}
                className="sidebar-toggler"
                onClick={() => {
                    onPress();
                }}
            />
            </Col>
        <Col span={8} md={8} className="header-control flex-end">
        <Row justify="end">
                <Popover placement="bottomRight" title={text} content={content} trigger="click">
                <Button type="primary" shape="circle" size="large" icon="download">
                </Button>
      </Popover>
      </Row>

    const [visible, setVisible] = useState(false);
    const [visibleDropdown, setVisibleDropdown] = useState(false);
    const [sidenavType, setSidenavType] = useState("transparent");
    
      const handleMenuClick = (e) => {
        if (e.key === 'logout') {
          // Hier könntest du die Abmelde-Logik einfügen
          console.log('Benutzer abgemeldet');
        } else if (e.key === 'settings') {
          // Hier könntest du zur Einstellungsseite navigieren
          console.log('Zu den Einstellungen navigiert');
        }
        setVisible(false);
      };

    useEffect(() => window.scrollTo(0, 0));

    const showDrawer = () => setVisible(true);
    const hideDrawer = () => setVisible(false);

    const { subHeader } = useSubHeaderContext();
  

    return (
        <>
        <div className="flex items-center justify-end">
      <div className="mr-auto">
        <Button type="primary">Links</Button>
      </div>
      <Dropdown
        menu={menu}
        trigger={['click']}
        open={visible}
        onOpenChange={(flag) => setVisible(flag)}
      >
        <Avatar
          className="cursor-pointer"
          style={{ backgroundColor: '#87d068' }}
          size="large"
          icon={<UserOutlined />}
        />
      </Dropdown>
    </div>



        <Badge size="small" count={4}>
            <Dropdown overlay={menu} trigger={["click"]}>
              <a
                href="#pablo"
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {bell}
              </a>
            </Dropdown>
          </Badge>

Button für Settings
    <Button type="link" onClick={showDrawer}>
            {logsetting}
          </Button>
          <Button
            type="link"
            className="sidebar-toggler"
            onClick={() => onPress()}
          >
            {toggler}
          </Button>
Sign in und Search
  <Link to="/sign-in" className="btn-sign-in">
            {profile}
            <span>Sign in</span>
          </Link>
          <Input
            className="header-search"
            placeholder="Type here..."
            prefix={<SearchOutlined />}
          />

Button für Floating action
   <div className="setting-drwer" onClick={showDrawer}>
        {setting}
      </div>



          <Drawer
            className="settings-drawer"
            mask={true}
            width={360}
            onClose={hideDrawer}
            placement={placement}
            visible={visible}
          >
            <div layout="vertical">
              <div className="header-top">
                <Title level={4}>
                  Configurator
                  <Text className="subtitle">See our dashboard options.</Text>
                </Title>
              </div>

              <div className="sidebar-color">
                <Title level={5}>Sidebar Color</Title>
                <div className="theme-color mb-2">
                  <ButtonContainer>
                    <Button
                      type="primary"
                      onClick={() => handleSidenavColor("#1890ff")}
                    >
                      1
                    </Button>
                    <Button
                      type="success"
                      onClick={() => handleSidenavColor("#52c41a")}
                    >
                      1
                    </Button>
                    <Button
                      type="danger"
                      onClick={() => handleSidenavColor("#d9363e")}
                    >
                      1
                    </Button>
                    <Button
                      type="yellow"
                      onClick={() => handleSidenavColor("#fadb14")}
                    >
                      1
                    </Button>

                    <Button
                      type="black"
                      onClick={() => handleSidenavColor("#111")}
                    >
                      1
                    </Button>
                  </ButtonContainer>
                </div>

                <div className="sidebarnav-color mb-2">
                  <Title level={5}>Sidenav Type</Title>
                  <Text>Choose between 2 different sidenav types.</Text>
                  <ButtonContainer className="trans">
                    <Button
                      type={sidenavType === "transparent" ? "primary" : "white"}
                      onClick={() => {
                        handleSidenavType("transparent");
                        setSidenavType("transparent");
                      }}
                    >
                      TRANSPARENT
                    </Button>
                    <Button
                      type={sidenavType === "white" ? "primary" : "white"}
                      onClick={() => {
                        handleSidenavType("#fff");
                        setSidenavType("white");
                      }}
                    >
                      WHITE
                    </Button>
                  </ButtonContainer>
                </div>
                <div className="fixed-nav mb-2">
                  <Title level={5}>Navbar Fixed </Title>
                  <Switch onChange={(e) => handleFixedNavbar(e)} />
                </div>
                <div className="ant-docment">
                  <ButtonContainer>
                    <Button type="black" size="large">
                      FREE DOWNLOAD
                    </Button>
                    <Button size="large">VIEW DOCUMENTATION</Button>
                  </ButtonContainer>
                </div>
                <div className="viewstar">
                  <a href="#pablo">{<StarOutlined />} Star</a>
                  <a href="#pablo"> 190</a>
                </div>

                <div className="ant-thank">
                  <Title level={5} className="mb-2">
                    Thank you for sharing!
                  </Title>
                  <ButtonContainer className="social">
                    <Button type="black">{<TwitterOutlined />}TWEET</Button>
                    <Button type="black">{<FacebookFilled />}SHARE</Button>
                  </ButtonContainer>
                </div>
              </div>
            </div>
          </Drawer>
 */
