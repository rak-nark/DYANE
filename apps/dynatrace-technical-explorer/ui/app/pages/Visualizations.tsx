import React from "react";

import { QueryRunner } from "../components/QueryRunner";

export const Visualizations = () => {
  return (
    <QueryRunner
      title="Visualizations"
      subtitle="Start with chart-ready DQL and inspect the same records below the visualization."
      initialPresetId="logs-volume"
      chartMode
    />
  );
};
