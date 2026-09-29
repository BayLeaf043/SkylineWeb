import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  KeyboardArrowDown,
  MenuOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { theme } from "../../theme/theme";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileMenu from "./ProfileMenu";

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export default function Header({
  onMobileMenuOpen,
}: HeaderProps) {
  const { user } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const profileMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const initials =
    `${user?.firstName?.[0] ?? ""}${
      user?.lastName?.[0] ?? ""
    }`.toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.header",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(16px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: {
            xs: "16px !important",
            sm: "20px !important",
            md: "28px !important",
          },
        }}
      >
        {/* MOBILE MENU */}

        <IconButton
          onClick={onMobileMenuOpen}
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },
            mr: 1,
          }}
          aria-label="Відкрити меню"
        >
          <MenuOutlined />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        {/* PROFILE */}

        <Tooltip title="Профіль та налаштування">
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.4,

              py: 0.7,
              pl: 0.8,
              pr: 1,

              borderRadius: 1,
              cursor: "pointer",

              transition: "background-color 0.2s",

              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,

                bgcolor: alpha(theme.palette.primary.main, 0.16),
                color: "primary.main",

                fontSize: 14,
                fontWeight: 700,

                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.25),
              }}
            >
              {initials || "U"}
            </Avatar>

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                textAlign: "left",
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.3,

                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11.5,
                  color: "text.secondary",
                  mt: 0.15,
                }}
              >
                {user?.role === "ADMIN"
                  ? "Адміністратор"
                  : "Тренер"}
              </Typography>
            </Box>

            <KeyboardArrowDown
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },

                fontSize: 19,
                color: "text.secondary",

                transform: profileMenuOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",

                transition: "transform 0.2s",
              }}
            />
          </Box>
        </Tooltip>

        <ProfileMenu
          anchorEl={anchorEl}
          open={profileMenuOpen}
          onClose={handleProfileMenuClose}
        />
      </Toolbar>
    </AppBar>
  );
}