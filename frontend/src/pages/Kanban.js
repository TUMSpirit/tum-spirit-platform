import React from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Button,
    List,
    Descriptions,
    Avatar,
} from "antd";

import { PlusOutlined, ExclamationOutlined } from "@ant-design/icons";
import mastercard from "../assets/images/mastercard-logo.png";
import paypal from "../assets/images/paypal-logo-2.png";
import visa from "../assets/images/visa-logo.png";
import Home from "../components/Kanban/Home";

function Kanban() {

    const data = [
        {
            title: "March, 01, 2021",
            description: "#MS-415646",
            amount: "$180",
        },
        {
            title: "February, 12, 2021",
            description: "#RV-126749",
            amount: "$250",
        },
        {
            title: "April, 05, 2020",
            description: "#FB-212562",
            amount: "$550",
        },
        {
            title: "June, 25, 2019",
            description: "#QW-103578",
            amount: "$400",
        },
        {
            title: "March, 03, 2019",
            description: "#AR-803481",
            amount: "$700",
        },
    ];

    return (
        <>
            <Home/>
        </>
    );
}

export default Kanban;