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
import { SubHeader } from '../layout/SubHeader';
import { PlusOutlined, ExclamationOutlined } from "@ant-design/icons";
import TimelineComponent from '../components/TimelineComponent/TimelineComponent';

const dates = [
    new Date('2021-01-01'),
    new Date('2021-02-01'),
    new Date('2021-03-01'),
    // ... other dates
];

const events = [
    'Event 1',
    'Event 2',
    'Event 3',
    // ... other events
];

function Home() {

    return (
        <>
            <SubHeader></SubHeader>
            <TimelineComponent dates={dates} events={events} />
        </>
    );
}

export default Home;