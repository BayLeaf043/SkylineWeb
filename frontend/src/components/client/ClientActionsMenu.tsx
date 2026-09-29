import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { ClientResponse } from "../../types/client";

interface ClientActionsMenuProps {
  anchorEl: HTMLElement | null;
  client: ClientResponse | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (client: ClientResponse) => void;
  onDeactivate: (client: ClientResponse) => void;
  onDelete: (client: ClientResponse) => void;
}

export default function ClientActionsMenu({
  anchorEl,
  client,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: ClientActionsMenuProps) {
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
      <MenuItem
        onClick={() => {
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

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!client) {
            return;
          }

          onClose();

          if (client.status) {
            onDeactivate(client);
          } else {
            onActivate(client);
          }
        }}
      >
        <ListItemIcon>
          {client?.status ? (
            <PersonOffOutlinedIcon fontSize="small" />
          ) : (
            <PersonAddAltOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>

        <ListItemText>
          {client?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!client) {
            return;
          }

          onClose();
          onDelete(client);
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