"use client";

import { useEffect, useState } from "react";
import { Container, SimpleGrid, Paper, Title, Text } from "@mantine/core";
import { AreaChart } from "@mantine/charts";

interface ChartDataPoint {
  date: string;
  binancePrice: number;
}

const ArbitrageScanner = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = "ws://localhost:3001";
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (!data.price || typeof data.price !== "number") {
            console.warn("Invalid WebSocket data:", data);
            return;
          }

          console.log(data.price)

          chartData.push({
            binancePrice: data.price,
            date: "dAd",
          });

          console.log("chartData", chartData)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected, attempting to reconnect...");
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  console.log("chartData: ", chartData)

  return (
    <Container fluid>
      <SimpleGrid cols={1} spacing="lg" style={{ minHeight: "500px" }}>
        <Paper shadow="sm" p="md" radius="md" style={{ width: "100%" }}>
          <Title order={2} mb="md">
            Binance Price Chart
          </Title>
          {!isConnected && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              Disconnected from WebSocket. Attempting to reconnect...
            </div>
          )}
         {chartData.map((data) => (
           <Text key={data.date}>{data.binancePrice}</Text>
         ))}
        </Paper>
      </SimpleGrid>
    </Container>
  );
};

export default ArbitrageScanner;
