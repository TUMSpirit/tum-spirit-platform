// src/components/Admin/StatisticsTab.jsx
import React from "react";
import { Row, Col, Card, Typography } from "antd";
import { SentimentChart } from "../Dashboard/charts/SentimentChart";
import { EmotionBarChart } from "../Dashboard/charts/EmotionBarChart";
import { Big5Chart } from "../Dashboard/charts/Big5Chart";

const { Title } = Typography;

export const StatisticsTab = () => {
  // Dummy fetchers for demonstration — replace with real ones
  const dummyFetcher = () => ({
    data: [2.5, 3.0, 4.0, 1.8, 3.5],
    loading: false,
  });

  return (
    <>
      <Title level={4}>Persönlichkeitsübersicht</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Big 5 Traits (Radar)">
            <Big5Chart userFetcher={dummyFetcher} teamFetcher={dummyFetcher} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Emotionen (Balkendiagramm)">
            <EmotionBarChart />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Sentiment-Verlauf">
            <SentimentChart />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default StatisticsTab;
