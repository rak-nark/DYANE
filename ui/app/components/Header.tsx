import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppHeader } from "@dynatrace/strato-components/layouts";
import { Text } from "@dynatrace/strato-components/typography";

const navItems = [
  { path: "/", label: "Overview" },
  { path: "/documentation", label: "Documentation" },
  { path: "/changes", label: "Changes" },
  { path: "/search", label: "Search" },
  { path: "/settings", label: "Settings" },
];

export const Header = () => {
  const location = useLocation();

  return (
    <AppHeader>
      <AppHeader.Navigation>
        <AppHeader.Logo
          as={Link}
          to="/"
          appName="DYANE"
        />
        <Text
          textStyle="small"
          style={{ opacity: 0.7, alignSelf: "center", marginLeft: -8 }}
        >
          Dynatrace Assistant for Network & Engineering
        </Text>
        {navItems.map((item) => (
          <AppHeader.NavigationItem
            key={item.path}
            as={Link}
            to={item.path}
            isSelected={location.pathname === item.path}
          >
            {item.label}
          </AppHeader.NavigationItem>
        ))}
      </AppHeader.Navigation>
    </AppHeader>
  );
};
