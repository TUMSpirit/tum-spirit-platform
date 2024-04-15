// import { useState } from "react";
import { Menu, Button } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/Spirit.png";

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  const calendar = [
    <svg
        width="24"
        height="24"
        viewBox="0 0 700 550"
        fill="none"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
      <path d="m132.67 413.37c-6.0547 21.895-28.91 88.461-28.91 88.461-2.2227 6.4961-0.4375 13.688 4.5508 18.395 4.9883 4.707 12.266 6.0742 18.617 3.4805 0 0 66.938-27.332 88.445-35.031 19.023 7.8047 39.832 12.09 61.637 12.09 89.898 0 162.89-72.973 162.89-162.87s-72.992-162.89-162.89-162.89c-89.898 0-162.87 72.992-162.87 162.89 0 27.23 6.6992 52.902 18.531 75.477zm71.66-21.629h96.918c9.6602 0 17.5-7.8398 17.5-17.5 0-9.6602-7.8398-17.5-17.5-17.5h-96.918c-9.6562 0-17.5 7.8398-17.5 17.5 0 9.6602 7.8438 17.5 17.5 17.5zm67.027-251.65c2.0312-0.050782 4.0781-0.085938 6.125-0.085938 109.22 0 197.89 88.672 197.89 197.89 0 4.9336-0.17578 9.8164-0.54297 14.664 3.5508-1.1719 7.0508-2.4688 10.48-3.8828 21.473 7.6797 88.445 35.031 88.445 35.031 6.3555 2.5938 13.633 1.2266 18.637-3.4805 4.9883-4.707 6.7578-11.898 4.5352-18.395 0 0-22.84-66.566-28.91-88.461 11.848-22.574 18.531-48.246 18.531-75.477 0-89.898-72.973-162.89-162.87-162.89-69.547 0-128.98 43.68-152.32 105.09zm-67.027 178.96h145.38c9.6602 0 17.5-7.8398 17.5-17.5 0-9.6602-7.8398-17.5-17.5-17.5h-145.38c-9.6562 0-17.5 7.8398-17.5 17.5 0 9.6602 7.8438 17.5 17.5 17.5z" fill-rule="evenodd"/>
    </svg>,
  ];

  const chat = [
  <svg
      width="24"
      height="24"
      viewBox="0 0 700 550"
      fill="none"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg">
    <path d="m132.67 413.37c-6.0547 21.895-28.91 88.461-28.91 88.461-2.2227 6.4961-0.4375 13.688 4.5508 18.395 4.9883 4.707 12.266 6.0742 18.617 3.4805 0 0 66.938-27.332 88.445-35.031 19.023 7.8047 39.832 12.09 61.637 12.09 89.898 0 162.89-72.973 162.89-162.87s-72.992-162.89-162.89-162.89c-89.898 0-162.87 72.992-162.87 162.89 0 27.23 6.6992 52.902 18.531 75.477zm71.66-21.629h96.918c9.6602 0 17.5-7.8398 17.5-17.5 0-9.6602-7.8398-17.5-17.5-17.5h-96.918c-9.6562 0-17.5 7.8398-17.5 17.5 0 9.6602 7.8438 17.5 17.5 17.5zm67.027-251.65c2.0312-0.050782 4.0781-0.085938 6.125-0.085938 109.22 0 197.89 88.672 197.89 197.89 0 4.9336-0.17578 9.8164-0.54297 14.664 3.5508-1.1719 7.0508-2.4688 10.48-3.8828 21.473 7.6797 88.445 35.031 88.445 35.031 6.3555 2.5938 13.633 1.2266 18.637-3.4805 4.9883-4.707 6.7578-11.898 4.5352-18.395 0 0-22.84-66.566-28.91-88.461 11.848-22.574 18.531-48.246 18.531-75.477 0-89.898-72.973-162.89-162.87-162.89-69.547 0-128.98 43.68-152.32 105.09zm-67.027 178.96h145.38c9.6602 0 17.5-7.8398 17.5-17.5 0-9.6602-7.8398-17.5-17.5-17.5h-145.38c-9.6562 0-17.5 7.8398-17.5 17.5 0 9.6602 7.8438 17.5 17.5 17.5z" fill-rule="evenodd"/>
  </svg>,
     ];

  const documents = [
    <svg
        width="30"
        height="30"
        viewBox="0 0 700 600"
        fill="none"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
      <path d="m192.5 140c0-35.438 28.727-64.168 64.168-64.168h74.004c17.016 0 33.336 6.7617 45.371 18.797l112.66 112.66c12.039 12.035 18.797 28.355 18.797 45.375v167.34c0 35.438-28.727 64.168-64.168 64.168h-186.66c-35.441 0-64.168-28.73-64.168-64.168zm64.168-29.168c-16.109 0-29.168 13.059-29.168 29.168v280c0 16.109 13.059 29.168 29.168 29.168h186.66c16.109 0 29.168-13.059 29.168-29.168v-167.34c0-0.61328-0.019531-1.2227-0.058594-1.832h-75.773c-35.441 0-64.168-28.727-64.168-64.164v-75.777c-0.60547-0.039063-1.2188-0.058594-1.8281-0.058594zm110.83 24.75v51.086c0 16.105 13.059 29.164 29.168 29.164h51.082z"/>
    </svg>,
  ];

  const team = [
  <svg   width="23"
         height="23"
         viewBox="0 0 700 600"
         version="1.1"
         xmlns="http://www.w3.org/2000/svg">
      <path d="m253.11 227.17c0-56.586 43.453-101.55 97.785-101.55 54.73 0 98.336 44.961 98.336 101.55-3.3711 58.613-45.449 101.01-98.336 101.84-54.266 0-97.785-45.672-97.785-101.84zm-128.4 107.62c35.773 0 64.359-29.398 64.359-66.25 0-37.297-28.586-66.828-64.359-66.828-35.773 0-64.359 29.531-64.359 66.828 0.57813 40.598 28.25 63.945 64.359 66.25zm451.84 0c35.773 0 64.359-29.398 64.359-66.25 0-37.297-28.586-66.828-64.359-66.828-35.777 0-64.086 29.531-64.086 66.828 0.53906 37.812 26.555 65.379 64.086 66.25zm-140.85-14.277c-23.082 19.664-52.746 31.535-84.801 31.535-31.984 0-61.203-12.098-84.25-31.824v0.003906c-49.684 24.695-85.629 71.273-85.629 145.52v14.734h340.03v-14.738c0.003907-73.965-35.949-120.65-85.352-145.23zm-238.34 24.012c-3.9141-2.8477-7.8203-5.7578-12.156-8.1016-16.828 13.383-37.84 21.41-60.492 21.41-22.516 0-43.441-7.8828-60.219-21.121-32.172 17.039-54.965 47.383-54.965 96.633v46.867c0.13281 0.09375 0.26562 0.17969 0.39844 0.27344h149.59v-14.738c0-48.898 14.68-89.527 37.844-121.22zm494.37 135.39v-46.574c0-49.438-22.883-80.02-54.969-96.918-16.789 13.266-37.676 21.41-60.215 21.41-22.625 0-43.402-8.0547-60.219-21.41-4.3125 2.3242-8.4961 5.0078-12.43 7.8086 23.285 31.734 37.844 72.543 37.844 121.51v14.738h149.17c0.27344-0.19141 0.54688-0.375 0.82031-0.56641z"/>
  </svg>,
      ];

  const kanban = [
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        key={0}
    >
      <path
          d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
          fill={color}
      ></path>
      <path
          d="M3 10C3 9.44771 3.44772 9 4 9H10C10.5523 9 11 9.44771 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
          fill={color}
      ></path>
      <path
          d="M14 9C13.4477 9 13 9.44771 13 10V16C13 16.5523 13.4477 17 14 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44771 16.5523 9 16 9H14Z"
          fill={color}
      ></path>
    </svg>,
  ];

  const tables = [
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        d="M9 2C8.44772 2 8 2.44772 8 3C8 3.55228 8.44772 4 9 4H11C11.5523 4 12 3.55228 12 3C12 2.44772 11.5523 2 11 2H9Z"
        fill={color}
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5C4 3.89543 4.89543 3 6 3C6 4.65685 7.34315 6 9 6H11C12.6569 6 14 4.65685 14 3C15.1046 3 16 3.89543 16 5V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V5ZM7 9C6.44772 9 6 9.44772 6 10C6 10.5523 6.44772 11 7 11H7.01C7.56228 11 8.01 10.5523 8.01 10C8.01 9.44772 7.56228 9 7.01 9H7ZM10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11H13C13.5523 11 14 10.5523 14 10C14 9.44772 13.5523 9 13 9H10ZM7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H7.01C7.56228 15 8.01 14.5523 8.01 14C8.01 13.4477 7.56228 13 7.01 13H7ZM10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15H13C13.5523 15 14 14.5523 14 14C14 13.4477 13.5523 13 13 13H10Z"
        fill={color}
      ></path>
    </svg>,
  ];

  const billing = [
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      key={0}
    >
      <path
        d="M4 4C2.89543 4 2 4.89543 2 6V7H18V6C18 4.89543 17.1046 4 16 4H4Z"
        fill={color}
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 9H2V14C2 15.1046 2.89543 16 4 16H16C17.1046 16 18 15.1046 18 14V9ZM4 13C4 12.4477 4.44772 12 5 12H6C6.55228 12 7 12.4477 7 13C7 13.5523 6.55228 14 6 14H5C4.44772 14 4 13.5523 4 13ZM9 12C8.44772 12 8 12.4477 8 13C8 13.5523 8.44772 14 9 14H10C10.5523 14 11 13.5523 11 13C11 12.4477 10.5523 12 10 12H9Z"
        fill={color}
      ></path>
    </svg>,
  ];

  const dashboard = [
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        key={0}
    >
      <path
          d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
          fill={color}
      ></path>
      <path
          d="M3 10C3 9.44771 3.44772 9 4 9H10C10.5523 9 11 9.44771 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
          fill={color}
      ></path>
      <path
          d="M14 9C13.4477 9 13 9.44771 13 10V16C13 16.5523 13.4477 17 14 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44771 16.5523 9 16 9H14Z"
          fill={color}
      ></path>
    </svg>,
  ];
  const timeline = [
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        key={0}
    >
      <path
          d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
          fill={color}
      ></path>
      <path
          d="M3 10C3 9.44771 3.44772 9 4 9H10C10.5523 9 11 9.44771 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
          fill={color}
      ></path>
      <path
          d="M14 9C13.4477 9 13 9.44771 13 10V16C13 16.5523 13.4477 17 14 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44771 16.5523 9 16 9H14Z"
          fill={color}
      ></path>
    </svg>,
  ];

  return (
    <>
      <div className="brand">
        <img src={logo} alt="" />
      </div>
      <hr />
      <Menu defaultSelectedKeys={"2"} theme="light" mode="inline">

        <Menu.Item key="1">
          <NavLink to="/calendar">
            <span
                className="icon"
                style={{
                  background: page === "calendar" ? color : "",
                }}
            >
              {chat}
            </span>
            <span className="label">Calendar</span>
          </NavLink>
        </Menu.Item>

        <Menu.Item key="2">
          <NavLink to="/chat">
            <span
                className="icon"
                style={{
                  background: page === "chat" ? color : "",
                }}
            >
              {chat}
            </span>
            <span className="label">Chat</span>
          </NavLink>
        </Menu.Item>

        <Menu.Item key="3">
          <NavLink to="/kanban">
            <span
              className="icon"
              style={{
                background: page === "kanban" ? color : "",
              }}
            >
              {kanban}
            </span>
            <span className="label">Kanban</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="4">
          <NavLink to="/team">
            <span
              className="icon"
              style={{
                background: page === "team" ? color : "",
              }}
            >
              {team}
            </span>
            <span className="label">Team</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="5">
          <NavLink to="/documents">
            <span
              className="icon"
              style={{
                background: page === "documents" ? color : "",
              }}
            >
              {documents}
            </span>
            <span className="label">Documents</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="6">
          <NavLink to="/dashboard">
            <span
                className="icon"
                style={{
                  background: page === "dashboard" ? color : "",
                }}
            >
              {dashboard}
            </span>
            <span className="label">Dashboard</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="7">
          <NavLink to="/timeline">
            <span
                className="icon"
                style={{
                  background: page === "timeline" ? color : "",
                }}
            >
              {dashboard}
            </span>
            <span className="label">Timeline</span>
          </NavLink>
        </Menu.Item>
        <Menu.ItemGroup title="Issues" className="menu-item-header" key="8">
        </Menu.ItemGroup>
      </Menu>
      <div className="aside-footer">
      </div>
    </>
  );
}

export default Sidenav;
/*
  <Menu.Item key="2">
          <NavLink to="/tables">
            <span
              className="icon"
              style={{
                background: page === "tables" ? color : "",
              }}
            >
              {tables}
            </span>
            <span className="label">Tables</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="3">
          <NavLink to="/billing">
            <span
              className="icon"
              style={{
                background: page === "billing" ? color : "",
              }}
            >
              {billing}
            </span>
            <span className="label">Billing</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item clickable="false" className="menu-item-header" key="5">
          Account Pages
        </Menu.Item>
        <Menu.Item key="4">
          <NavLink to="/profile">
            <span
              className="icon"
              style={{
                background: page === "profile" ? color : "",
              }}
            >
              {profile}
            </span>
            <span className="label">Profile</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="8">
          <NavLink to="/sign-up">
            <span className="icon">{signup}</span>
            <span className="label">Sign Up</span>
          </NavLink>
        </Menu.Item>
 */