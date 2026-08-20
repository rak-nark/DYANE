import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading } from "@dynatrace/strato-components/typography";
import { BackendStatus } from "../components/BackendStatus";
import { KnowledgeStatus } from "../components/KnowledgeStatus";

export const Overview = () => {
  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>DYANE Knowledge Status</Heading>

      <KnowledgeStatus />

      <Heading level={3}>System</Heading>

      <BackendStatus />
    </Flex>
  );
};
