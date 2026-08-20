import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Surface } from "@dynatrace/strato-components/layouts";
import { Heading, Text, Strong } from "@dynatrace/strato-components/typography";
import { HealthIndicator } from "@dynatrace/strato-components/content";
import { useAppFunction } from "@dynatrace-sdk/react-hooks";

type StatusResponse = {
  status: string;
  timestamp: string;
  environment: string;
  appName: string;
  appVersion: string;
};

export const BackendStatus = () => {
  const { data, error, isLoading } = useAppFunction<StatusResponse>({
    name: "getStatus",
    data: undefined,
  });

  if (isLoading) {
    return (
      <Surface elevation="raised" style={{ padding: 24, width: "100%" }}>
        <Flex flexDirection="column" gap={12}>
          <Heading level={3}>Backend Status</Heading>
          <HealthIndicator status="neutral">
            <HealthIndicator.Label>Checking...</HealthIndicator.Label>
          </HealthIndicator>
        </Flex>
      </Surface>
    );
  }

  if (error || !data) {
    return (
      <Surface elevation="raised" style={{ padding: 24, width: "100%" }}>
        <Flex flexDirection="column" gap={12}>
          <Heading level={3}>Backend Status</Heading>
          <HealthIndicator status="critical">
            <HealthIndicator.Label>Offline</HealthIndicator.Label>
          </HealthIndicator>
          {error && <Text textStyle="small">{error.message}</Text>}
        </Flex>
      </Surface>
    );
  }

  const lastCheck = new Date(data.timestamp).toLocaleTimeString();

  return (
    <Surface elevation="raised" style={{ padding: 24, width: "100%" }}>
      <Flex flexDirection="column" gap={16}>
        <Heading level={3}>Backend Status</Heading>

        <Flex alignItems="center" gap={8}>
          <HealthIndicator status="ideal" visual="icon">
            <HealthIndicator.Label>Online</HealthIndicator.Label>
          </HealthIndicator>
        </Flex>

        <Flex flexDirection="column" gap={8}>
          <Flex justifyContent="space-between">
            <Text textStyle="small">Last check:</Text>
            <Strong>{lastCheck}</Strong>
          </Flex>
          <Flex justifyContent="space-between">
            <Text textStyle="small">Environment:</Text>
            <Strong>{data.environment}</Strong>
          </Flex>
          <Flex justifyContent="space-between">
            <Text textStyle="small">App:</Text>
            <Strong>{data.appName}</Strong>
          </Flex>
          <Flex justifyContent="space-between">
            <Text textStyle="small">Version:</Text>
            <Strong>{data.appVersion}</Strong>
          </Flex>
        </Flex>
      </Flex>
    </Surface>
  );
};
