'use client'

import { useEffect, useState } from "react";
import { Card, Text, Grid, Group, ThemeIcon } from "@mantine/core";
import { SingularWebsocket } from "@/util/singularWS";

interface MarketData {
    binancePrice: number;
    serumPrice: number;
    priceDifference: number;
    percentDifference: string;
    timestamp: string;
}

export const ArbitrageScanner = () => {
    const [marketData, setMarketData] = useState<MarketData[] | null>(null);

    useEffect(() => {
        const wsManager = SingularWebsocket.getInstance();

        const updateData = (data: MarketData[]) => {
            setMarketData(data);
        };

        wsManager.registerCallback("difference.all", updateData);

        wsManager.sendMessage({
            method: "SUBSCRIBE",
            params: ["difference.all"],
        });

        return () => {
            wsManager.deregisterCallback("difference", updateData);
            wsManager.sendMessage({
                method: "UNSUBSCRIBE",
                params: ["difference.all"],
            });
        };
    }, []);

    if (!marketData) {
        return <Text>Loading market data...</Text>;
    }

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group >
                <Text size="lg" fw={700}>
                    Market: USDC / USDT
                </Text>
                <Text size="sm" color="dimmed">
                    {new Date(marketData.timestamp).toLocaleTimeString()}
                </Text>
            </Group>
            <Grid mt="md">
                <Grid.Col span={6}>
                    <Text size="sm" color="dimmed">
                        Binance Price
                    </Text>
                    <Text size="xl" fw={700}>
                        ${marketData.binancePrice.toFixed(4)}
                    </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text size="sm" color="dimmed">
                        Serum Price
                    </Text>
                    <Text size="xl" fw={700}>
                        ${marketData.serumPrice.toFixed(4)}
                    </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text size="sm" color="dimmed">
                        Price Difference
                    </Text>
                    <Group>
                        <ThemeIcon
                            color={marketData.priceDifference >= 0 ? "green" : "red"}
                            radius="xl"
                            size="lg"
                        >
                           
                        </ThemeIcon>
                        <Text size="xl" fw={700} color={marketData.priceDifference >= 0 ? "green" : "red"}>
                            ${marketData.priceDifference.toFixed(4)}
                        </Text>
                    </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Text size="sm" color="dimmed">
                        % Difference
                    </Text>
                    <Text size="xl" fw={700} color={parseFloat(marketData.percentDifference) >= 0 ? "green" : "red"}>
                        {marketData.percentDifference}%
                    </Text>
                </Grid.Col>
            </Grid>
        </Card>
    );
};
