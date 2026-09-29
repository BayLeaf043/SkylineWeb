import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { FinancialTransactionResponse } from "../../types/financialTransaction";

interface TransactionActionsMenuProps {
  anchorEl: HTMLElement | null;
  transaction: FinancialTransactionResponse | null;
  loading: boolean;

  onClose: () => void;
  onEdit: () => void;
  onDelete: (
    transaction: FinancialTransactionResponse
  ) => void;
}

export default function TransactionActionsMenu({
  anchorEl,
  transaction,
  loading,
  onClose,
  onEdit,
  onDelete,
}: TransactionActionsMenuProps) {
  /*
   * Редагувати та видаляти можна
   * тільки ручні INCOME / EXPENSE,
   * які не пов'язані з покупкою
   * або переказом.
   */
  const canManage =
    transaction !== null &&
    (transaction.type === "INCOME" ||
      transaction.type === "EXPENSE") &&
    transaction.purchaseId === null &&
    transaction.transferId === null;

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
        disabled={loading || !canManage}
        onClick={() => {
          if (!transaction || !canManage) {
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

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading || !canManage}
        onClick={() => {
          if (!transaction || !canManage) {
            return;
          }

          onClose();
          onDelete(transaction);
        }}
        sx={{
          color: canManage
            ? "error.main"
            : "text.disabled",

          "& .MuiListItemIcon-root": {
            color: canManage
              ? "error.main"
              : "text.disabled",
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