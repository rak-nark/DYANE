import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";

export const Settings = () => {
  return (
    <Flex flexDirection="column" padding={32} gap={32}>
      <Heading level={2}>Settings</Heading>
      <Paragraph>Configure DYANE synchronization and behavior.</Paragraph>
    </Flex>
  );
};
