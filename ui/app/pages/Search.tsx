import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import { EmptyState } from "@dynatrace/strato-components/content";

export const Search = () => {
  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>Search</Heading>
      <Paragraph>
        Search across all synchronized documentation and detected changes.
      </Paragraph>
      <EmptyState>
        <EmptyState.Title>Nothing to search</EmptyState.Title>
        <EmptyState.Details>
          Synchronize documentation first to enable search functionality.
        </EmptyState.Details>
      </EmptyState>
    </Flex>
  );
};
