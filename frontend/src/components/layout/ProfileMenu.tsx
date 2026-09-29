import {
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import {
  LogoutOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function ProfileMenu({
  anchorEl,
  open,
  onClose,
}: ProfileMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleOpenSettings = () => {
    onClose();
    navigate("/settings");
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            width: 260,
            overflow: "hidden",
          },
        },
      }}
    >
      {/* USER INFO */}

      <Box
        sx={{
          px: 2,
          py: 1.7,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {user?.firstName} {user?.lastName}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            mt: 0.3,
          }}
        >
          {user?.role === "ADMIN"
            ? "Адміністратор"
            : "Тренер"}
        </Typography>
      </Box>

      <Divider />

      <MenuItem onClick={handleOpenSettings}>
        <ListItemIcon>
          <SettingsOutlined fontSize="small" />
        </ListItemIcon>

        Налаштування
      </MenuItem>

      <Divider />

      <MenuItem
      onClick={handleLogout}
      sx={{
        color: "error.main",
        
        "& .MuiListItemIcon-root": {
            color: "error.main",
        },
        
        "&:hover": {
            bgcolor: "rgba(244,67,54,0.08)",
        },
        }}
       >
        <ListItemIcon>
            <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            Вийти
        </MenuItem>
    </Menu>
);
}