import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import type { AccountResponse } from "../../types/account";

type Props = {
  open: boolean;
  account: AccountResponse | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeactivateAccountDialog({
  open,
  account,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      fullWidth
      maxWidth="xs"
    >
      {/* HEADER */}

      <DialogTitle>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              borderRadius: 1,

              bgcolor: "rgba(255,255,255,0.06)",
              color: "text.secondary",

              flexShrink: 0,
            }}
          >
            <AccountBalanceWalletOutlinedIcon />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.05rem",
                sm: "1.25rem",
              },
            }}
          >
            Деактивувати рахунок?
          </Typography>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "12px !important",
        }}
      >
        <DialogContentText
          sx={{
            color: "text.secondary",
            lineHeight: 1.65,
          }}
        >
          Рахунок{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {account?.title}
          </Box>{" "}
          буде деактивовано. Фінансова історія та поточний
          баланс рахунку залишаться збереженими.
        </DialogContentText>

        <DialogContentText
          sx={{
            mt: 1.5,
            color: "text.secondary",
            lineHeight: 1.65,
          }}
        >
          Неактивний рахунок не можна буде використовувати
          для проведення нових фінансових операцій. Його
          можна активувати повторно в будь-який момент.
        </DialogContentText>
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions>
        <Button
          color="inherit"
          disabled={loading}
          onClick={onClose}
          sx={{
            color: "text.secondary",
          }}
        >
          Скасувати
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={onConfirm}
          sx={{
            minWidth: 140,
          }}
        >
          {loading ? (
            <CircularProgress
              size={21}
              color="inherit"
            />
          ) : (
            "Деактивувати"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}