import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />

      <Box
        sx={{
          ml: {
            xs: 0,
            md: `${SIDEBAR_WIDTH}px`,
          },
          minHeight: "100vh",
        }}
      >
        <Header onMobileMenuOpen={handleMobileMenuOpen} />

        <Box
          component="main"
          sx={{
            width: "100%",
            p: {
              xs: 2,
              sm: 2.5,
              md: 3.5,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}