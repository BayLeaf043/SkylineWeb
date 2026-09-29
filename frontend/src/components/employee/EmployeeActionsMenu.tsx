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

import type { EmployeeResponse  } from "../../types/employee";

interface EmployeeActionsMenuProps {
  anchorEl: HTMLElement | null;
  employee: EmployeeResponse | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (employee: EmployeeResponse) => void;
  onDeactivate: (employee: EmployeeResponse) => void;
  onDelete: (employee: EmployeeResponse) => void;
}

export default function EmployeeActionsMenu({
  anchorEl,
  employee,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: EmployeeActionsMenuProps) {
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
          if (!employee) {
            return;
          }

          onClose();

          if (employee.status) {
            onDeactivate(employee);
          } else {
            onActivate(employee);
          }
        }}
      >
        <ListItemIcon>
          {employee?.status ? (
            <PersonOffOutlinedIcon fontSize="small" />
          ) : (
            <PersonAddAltOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>

        <ListItemText>
          {employee?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!employee) {
            return;
          }

          onClose();
          onDelete(employee);
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