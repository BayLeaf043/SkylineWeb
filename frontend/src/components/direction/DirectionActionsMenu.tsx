import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

import type { Direction } from "../../types/direction";

interface DirectionActionsMenuProps {
  anchorEl: HTMLElement | null;
  direction: Direction | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (direction: Direction) => void;
  onDeactivate: (direction: Direction) => void;
  onDelete: (direction: Direction) => void;
}

export default function DirectionActionsMenu({
  anchorEl,
  direction,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: DirectionActionsMenuProps) {
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
          if (!direction) {
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
          if (!direction) {
            return;
          }

          onClose();

          if (direction.status) {
            onDeactivate(direction);
          } else {
            onActivate(direction);
          }
        }}
      >
        <ListItemIcon>
  {direction?.status ? (
    <BlockOutlinedIcon fontSize="small" />
  ) : (
    <CheckCircleOutlineRoundedIcon fontSize="small" />
  )}
</ListItemIcon>

        <ListItemText>
          {direction?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!direction) {
            return;
          }

          onClose();
          onDelete(direction);
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