import React from 'react';
import {
    Row,
    Col,
    Card,
    Radio,
    Table,
    Upload,
    message,
    Progress,
    Button,
    Avatar,
    Typography,
} from "antd";
import TeamMembers from '../components/Team/TeamMembers';
import { SubHeader } from '../layout/SubHeader';
function Team() {

    return (
        <>
            <SubHeader></SubHeader>
            <TeamMembers></TeamMembers>
        </>
    );
}

export default Team;
