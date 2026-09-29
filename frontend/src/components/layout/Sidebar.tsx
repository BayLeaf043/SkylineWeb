import {
  Box,
  Divider,
  Drawer,
  Typography,
} from "@mui/material";

import {
  CategoryOutlined,
  AccountBalanceWalletOutlined,
  DashboardOutlined,
  GroupsOutlined,
  MeetingRoomOutlined,
  MiscellaneousServicesOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";

import { alpha } from "@mui/material/styles";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const SIDEBAR_WIDTH = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const menuItems = [
  {
    title: "Головна",
    path: "/home",
    icon: <DashboardOutlined />,
  },
  {
    title: "Працівники",
    path: "/employees",
    icon: <PeopleAltOutlined />,
  },
  {
    title: "Клієнти",
    path: "/clients",
    icon: <GroupsOutlined />,
  },
  {
    title: "Зали",
    path: "/halls",
    icon: <MeetingRoomOutlined />,
  },
  {
    title: "Категорії",
    path: "/categories",
    icon: <CategoryOutlined />,
  },
  {
    title: "Послуги",
    path: "/services",
    icon: <MiscellaneousServicesOutlined />,
  },
  {
    title: "Сертифікати",
    path: "/certificates",
    icon: <AccountBalanceWalletOutlined />,
  },
  {
    title: "Продажі",
    path: "/purchases",
    icon: <AccountBalanceWalletOutlined />,
  },
  {
    title: "Фінанси",
    path: "/finances",
    icon: <AccountBalanceWalletOutlined />,
  },
];

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user } = useAuth();

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.sidebar",
      }}
    >
      {/* LOGO */}

      <Box
        sx={{
          height: 72,
          display: "flex",
          alignItems: "center",
          px: 2.5,
          flexShrink: 0,
        }}
      >
        <Box
        sx={(theme) => ({
            width: 38,
            height: 38,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            fontSize: 20,
            fontWeight: 800,
            mr: 1.5,
        })}
        >
                S
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            Skyline
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 11,
              mt: 0.3,
            }}
          >
            Sport Complex
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* NAVIGATION */}

      <Box
        component="nav"
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 2,

          "&::-webkit-scrollbar": {
            width: 5,
          },

          "&::-webkit-scrollbar-thumb": {
            bgcolor: "action.selected",
            borderRadius: 10,
          },
        }}
      >
        {menuItems.map((item) => (
          <Box
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onMobileClose}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,

              px: 1.5,
              py: 1.25,
              mb: 0.6,

              borderRadius: 1,

              color: "text.secondary",
              textDecoration: "none",

              transition: "background-color 0.2s, color 0.2s",

              "& svg": {
                fontSize: 21,
              },

              "&:hover": {
                bgcolor: "action.hover",
                color: "text.primary",
              },

              "&.active": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                color: "primary.main",
              },
            }}
          >
            {item.icon}

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item.title}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* CLUB */}

      <Box
        sx={{
          p: 2,
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          Спортивний комплекс
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            mt: 0.5,
          }}
        >
          {user?.clubName}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* MOBILE */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* DESKTOP */}

      <Drawer
        variant="permanent"
        open
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width: SIDEBAR_WIDTH,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}