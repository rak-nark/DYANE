import React from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@dynatrace/strato-components/layouts";

export const Header = () => {
  return (
    <AppHeader>
      <AppHeader.Navigation>
        <AppHeader.Logo as={Link} to="/" />
        <AppHeader.NavigationItem as={Link} to="/">
          DQL Explorer
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/operations">
          Operations
        </AppHeader.NavigationItem>
        <AppHeader.NavigationItem as={Link} to="/visualizations">
          Visualizations
        </AppHeader.NavigationItem>
      </AppHeader.Navigation>
    </AppHeader>
  );
};
