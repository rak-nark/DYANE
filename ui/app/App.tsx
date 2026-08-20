import { PageLayout } from "@dynatrace/strato-components/layouts";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Overview } from "./pages/Overview";
import { Documentation } from "./pages/Documentation";
import { Changes } from "./pages/Changes";
import { Search } from "./pages/Search";
import { Settings } from "./pages/Settings";

export const App = () => {
  return (
    <PageLayout>
      <PageLayout.Header>
        <Header />
      </PageLayout.Header>
      <PageLayout.Content>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/changes" element={<Changes />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </PageLayout.Content>
    </PageLayout>
  );
};
