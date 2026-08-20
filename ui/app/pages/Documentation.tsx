import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading } from "@dynatrace/strato-components/typography";
import { EmptyState } from "@dynatrace/strato-components/content";

export const Documentation = () => {
  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>Documentation</Heading>
      <EmptyState>
        <EmptyState.Title>No documents synchronized</EmptyState.Title>
        <EmptyState.Details>
          Documentation will be available here once synchronized from
          Dynatrace.
        </EmptyState.Details>
      </EmptyState>
    </Flex>
  );
};
