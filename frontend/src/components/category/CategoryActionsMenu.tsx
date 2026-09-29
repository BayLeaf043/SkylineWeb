import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { Category } from "../../types/category";

interface CategoryActionsMenuProps {
  anchorEl: HTMLElement | null;
  category: Category | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onActivate: (category: Category) => void;
  onDeactivate: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryActionsMenu({
  anchorEl,
  category,
  loading,
  onClose,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: CategoryActionsMenuProps) {
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
          if (!category) {
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
          if (!category) {
            return;
          }

          onClose();

          if (category.status) {
            onDeactivate(category);
          } else {
            onActivate(category);
          }
        }}
      >
        <ListItemIcon>
          {category?.status ? (
            <CategoryOutlinedIcon fontSize="small" />
          ) : (
            <AddBoxOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>

        <ListItemText>
          {category?.status
            ? "Деактивувати"
            : "Активувати"}
        </ListItemText>
      </MenuItem>

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading}
        onClick={() => {
          if (!category) {
            return;
          }

          onClose();
          onDelete(category);
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