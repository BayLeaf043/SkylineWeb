import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { AccountResponse } from "../../types/account";

interface AccountActionsMenuProps {
  anchorEl: HTMLElement | null;
  account: AccountResponse | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (account: AccountResponse) => void;
  onDeactivate: (account: AccountResponse) => void;
  onDelete: (account: AccountResponse) => void;
}

export default function AccountActionsMenu({
  anchorEl,
  account,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: AccountActionsMenuProps) {
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
        disabled={loading}
        onClick={() => {
          if (!account) {
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

      {/* STATUS */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!account) {
            return;
          }

          onClose();

          if (account.status) {
            onDeactivate(account);
          } else {
            onActivate(account);
          }
        }}
      >
        <ListItemIcon>
          {account?.status ? (
            <BlockOutlinedIcon fontSize="small" />
          ) : (
            <CheckCircleOutlineRoundedIcon fontSize="small" />
          )}
        </ListItemIcon>

        <ListItemText>
          {account?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!account) {
            return;
          }

          onClose();
          onDelete(account);
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