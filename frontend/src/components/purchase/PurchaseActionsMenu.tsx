import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import type { PurchaseResponse } from "../../types/purchase";

interface PurchaseActionsMenuProps {
  anchorEl: HTMLElement | null;
  purchase: PurchaseResponse | null;
  loading: boolean;

  onClose: () => void;
  onRefund: (
    purchase: PurchaseResponse
  ) => void;
}

export default function PurchaseActionsMenu({
  anchorEl,
  purchase,
  loading,
  onClose,
  onRefund,
}: PurchaseActionsMenuProps) {
  const canRefund =
    purchase?.type === "COMPLETED" &&
    purchase.status;

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
      {/* REFUND */}

      <MenuItem
        disabled={
          loading ||
          !purchase ||
          !canRefund
        }
        onClick={() => {
          if (
            !purchase ||
            !canRefund
          ) {
            return;
          }

          onClose();
          onRefund(purchase);
        }}
        sx={{
          color: "#ffb74d",

          "& .MuiListItemIcon-root": {
            color: "#ffb74d",
          },

          "&.Mui-disabled": {
            color: "text.disabled",

            "& .MuiListItemIcon-root": {
              color: "text.disabled",
            },
          },
        }}
      >
        <ListItemIcon>
          <ReplayRoundedIcon fontSize="small" />
        </ListItemIcon>

        <ListItemText>
          Повернути кошти
        </ListItemText>
      </MenuItem>
    </Menu>
  );
}