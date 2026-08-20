import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Surface } from "@dynatrace/strato-components/layouts";
import { Text, Strong } from "@dynatrace/strato-components/typography";
import { HealthIndicator } from "@dynatrace/strato-components/content";
import { SingleValue } from "@dynatrace/strato-components/charts";

export const KnowledgeStatus = () => {
  return (
    <Flex gap={24} flexFlow="wrap">
      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Documentation</Text>
          <HealthIndicator status="warning">
            <HealthIndicator.Label>
              Not synchronized
            </HealthIndicator.Label>
          </HealthIndicator>
        </Flex>
      </Surface>

      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Last synchronization</Text>
          <Strong>Never</Strong>
        </Flex>
      </Surface>

      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Documents</Text>
          <SingleValue data={0} alignment="start" />
        </Flex>
      </Surface>

      <Surface elevation="raised" style={{ padding: 24, minWidth: 220 }}>
        <Flex flexDirection="column" gap={12}>
          <Text textStyle="small">Changes detected</Text>
          <SingleValue data={0} alignment="start" />
        </Flex>
      </Surface>
    </Flex>
  );
};
