import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { Service } from "../../types/service";

interface ServiceActionsMenuProps {
  anchorEl: HTMLElement | null;
  service: Service | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (service: Service) => void;
  onDeactivate: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export default function ServiceActionsMenu({
  anchorEl,
  service,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: ServiceActionsMenuProps) {
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
          if (!service) {
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
          if (!service) {
            return;
          }

          onClose();

          if (service.status) {
            onDeactivate(service);
          } else {
            onActivate(service);
          }
        }}
      >
        <ListItemIcon>
          {service?.status ? (
            <FitnessCenterOutlinedIcon fontSize="small" />
          ) : (
            <AddCircleOutlineRoundedIcon fontSize="small" />
          )}
        </ListItemIcon>

        <ListItemText>
          {service?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!service) {
            return;
          }

          onClose();
          onDelete(service);
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