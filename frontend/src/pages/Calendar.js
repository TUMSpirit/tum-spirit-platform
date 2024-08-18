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
import Calendar_Main from "../components/Calendar/Calendar_Main"

import { PlusOutlined, ExclamationOutlined } from "@ant-design/icons";
import mastercard from "../assets/images/mastercard-logo.png";
import paypal from "../assets/images/paypal-logo-2.png";
import visa from "../assets/images/visa-logo.png";
import { SubHeader } from '../layout/SubHeader';

import React from 'react';
function Calendar() {

  return (
    <>
      <SubHeader></SubHeader>
      <Calendar_Main />
    </>);
}

export default Calendar;