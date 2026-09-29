import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { CertificateResponse } from "../../types/certificate";

interface CertificateActionsMenuProps {
  anchorEl: HTMLElement | null;
  certificate: CertificateResponse | null;
  loading: boolean;

  onClose: () => void;
  onEditValidity: () => void;
  onDelete: (
    certificate: CertificateResponse
  ) => void;
}

export default function CertificateActionsMenu({
  anchorEl,
  certificate,
  loading,
  onClose,
  onEditValidity,
  onDelete,
}: CertificateActionsMenuProps) {
  const canEditValidity =
    certificate?.type !== "USED" &&
    certificate?.type !== "CANCELLED";

  const editDisabled =
    loading ||
    !certificate ||
    !canEditValidity;

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
            minWidth: 220,
            mt: 0.75,
          },
        },
      }}
    >
      {/* EDIT VALIDITY */}

      <Tooltip
        title={
          !canEditValidity && certificate
            ? certificate.type === "USED"
              ? "Використаний сертифікат не можна продовжити"
              : "Скасований сертифікат не можна продовжити"
            : ""
        }
        placement="left"
      >
        <span>
          <MenuItem
            disabled={editDisabled}
            onClick={() => {
              if (!certificate) {
                return;
              }

              onClose();
              onEditValidity();
            }}
          >
            <ListItemIcon>
              <EditCalendarOutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>
              Змінити термін дії
            </ListItemText>
          </MenuItem>
        </span>
      </Tooltip>

      <Divider sx={{ my: 0.5 }} />

      {/* DELETE */}

      <MenuItem
        disabled={loading || !certificate}
        onClick={() => {
          if (!certificate) {
            return;
          }

          onClose();
          onDelete(certificate);
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