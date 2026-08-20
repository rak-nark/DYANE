import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading } from "@dynatrace/strato-components/typography";
import { EmptyState } from "@dynatrace/strato-components/content";

export const Changes = () => {
  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>Changes</Heading>
      <EmptyState>
        <EmptyState.Title>No changes detected</EmptyState.Title>
        <EmptyState.Details>
          Changes to monitored configurations will appear here.
        </EmptyState.Details>
      </EmptyState>
    </Flex>
  );
};
