import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import AddHomeWorkOutlinedIcon from "@mui/icons-material/AddHomeWorkOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { Hall } from "../../types/hall";

interface HallActionsMenuProps {
  anchorEl: HTMLElement | null;
  hall: Hall | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (hall: Hall) => void;
  onDeactivate: (hall: Hall) => void;
  onDelete: (hall: Hall) => void;
}

export default function HallActionsMenu({
  anchorEl,
  hall,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: HallActionsMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
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
            minWidth: 210,
            mt: 0.75,
          },
        },
      }}
    >
      {/* EDIT */}

      <MenuItem
        onClick={() => {
          if (!hall) {
            return;
          }

          onClose();
          onEdit();
        }}
      >
        <ListItemIcon>
          <EditOutlinedIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText>
          Редагувати
        </ListItemText>
      </MenuItem>

      {/* ACTIVATE / DEACTIVATE */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!hall) {
            return;
          }

          onClose();

          if (hall.status) {
            onDeactivate(hall);
          } else {
            onActivate(hall);
          }
        }}
      >
        <ListItemIcon>
          {hall?.status ? (
            <MeetingRoomOutlinedIcon fontSize="small" />
          ) : (
            <AddHomeWorkOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>

        <ListItemText>
          {hall?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!hall) {
            return;
          }

          onClose();
          onDelete(hall);
        }}
        sx={{
          color: "error.main",

          "& .MuiListItemIcon-root": {
            color: "error.main",
          },
        }}
      >
        <ListItemIcon>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText>
          Видалити
        </ListItemText>
      </MenuItem>
    </Menu>
  );
}