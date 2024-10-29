import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Layout, Drawer, Affix } from "antd";
import Sidenav from "./Sidenav";
import Header from "./Header";
import Footer from "./Footer";
import { SubHeaderContextProvider } from "./SubHeaderContext";
import { useMediaQuery } from "react-responsive";

const { Header: AntHeader, Content, Sider } = Layout;

function Main({ children }) {
    const [visible, setVisible] = useState(false);
    const [placement, setPlacement] = useState("right");
    const [sidenavColor, setSidenavColor] = useState("#1890ff");
    const [sidenavType, setSidenavType] = useState("#fff");
    const [fixed, setFixed] = useState(true);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: 991 }); // Detects mobile screens
    const headerRef = useRef(null);

    const openDrawer = () => setVisible(!visible);
    const handleSidenavType = (type) => setSidenavType(type);
    const handleSidenavColor = (color) => setSidenavColor(color);
    const handleFixedNavbar = (type) => setFixed(type);

    let { pathname } = useLocation();
    pathname = pathname.replace("/", "");

    useEffect(() => {
        if (pathname === "rtl") {
            setPlacement("left");
        } else {
            setPlacement("right");
        }
    }, [pathname]);

    // Update header height dynamically with ResizeObserver
    useEffect(() => {
        if (headerRef.current) {
            const observer = new ResizeObserver(() => {
                setHeaderHeight(headerRef.current.offsetHeight);
            });
            observer.observe(headerRef.current);

            return () => observer.disconnect(); // Clean up observer on unmount
        }
    }, [headerRef]);

    return (
        <Layout
            className={`layout-dashboard ${pathname === "profile" ? "layout-profile" : ""
                } ${pathname === "rtl" ? "layout-dashboard-rtl" : ""}`}
        >
            <Drawer
                title={false}
                placement={placement === "right" ? "left" : "right"}
                closable={false}
                onClose={() => setVisible(false)}
                open={visible}
                key={placement === "right" ? "left" : "right"}
                width={250}
                className={`drawer-sidebar ${pathname === "rtl" ? "drawer-sidebar-rtl" : ""
                    } `}
            >
                <Layout
                    className={`layout-dashboard ${pathname === "rtl" ? "layout-dashboard-rtl" : ""
                        }`}
                >
                    <Sider
                        trigger={null}
                        width={250}
                        theme="light"
                        className={`sider-primary ant-layout-sider-primary ${sidenavType === "#fff" ? "active-route" : ""
                            }`}
                        style={{ background: sidenavType }}
                    >
                        <Sidenav color={sidenavColor} />
                    </Sider>
                </Layout>
            </Drawer>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
                trigger={null}
                width={250}
                theme="light"
                className={`sider-primary ant-layout-sider-primary ${sidenavType === "#fff" ? "active-route" : ""
                    }`}
                style={{ background: sidenavType }}
            >
                <Sidenav color={sidenavColor} />
            </Sider>
            <Layout>
                <SubHeaderContextProvider>
                    <Affix offsetTop={0}>
                        <AntHeader
                            ref={headerRef}
                            className="fixed-header ant-header-fixed"
                            style={{
                                width: isMobile || sidebarCollapsed ? "100%" : `calc(100% - 250px)`,
                                overflowX: "hidden",
                            }}
                        >
                            <Header
                                onPress={openDrawer}
                                name={pathname}
                                subName={pathname}
                                handleSidenavColor={handleSidenavColor}
                                handleSidenavType={handleSidenavType}
                                handleFixedNavbar={handleFixedNavbar}
                            />
                        </AntHeader>
                    </Affix>
                    <Content
                        className="content-ant"
                        style={{ paddingTop: `${headerHeight}px` }}
                    >
                        {children}
                    </Content>
                </SubHeaderContextProvider>
            </Layout>
        </Layout>
    );
}

export default Main;
