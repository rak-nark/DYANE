import React from "react";

import { QueryRunner } from "../components/QueryRunner";

export const Home = () => {
  return (
    <QueryRunner
      title="DQL Explorer"
      subtitle="Run controlled read-only DQL presets, adjust the query, and inspect the returned records."
      initialPresetId="logs-recent"
    />
  );
};
