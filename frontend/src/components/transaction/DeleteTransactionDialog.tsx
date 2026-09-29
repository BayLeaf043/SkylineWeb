import {
  Alert,
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

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import type { FinancialTransactionResponse } from "../../types/financialTransaction";

type Props = {
  open: boolean;
  transaction: FinancialTransactionResponse | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteTransactionDialog({
  open,
  transaction,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const transactionType =
    transaction?.type === "INCOME"
      ? "Надходження"
      : "Витрата";

  const formattedAmount =
    transaction?.amount != null
      ? new Intl.NumberFormat("uk-UA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(transaction.amount)
      : "0,00";

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

              bgcolor: "rgba(244,67,54,0.10)",
              color: "error.main",

              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon />
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
            Видалити фінансову операцію?
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
          Фінансову операцію буде видалено із системи.
          Цю дію неможливо скасувати.
        </DialogContentText>

        {transaction && (
          <Box
            sx={{
              mt: 2,
              p: 1.75,

              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,

              bgcolor: "rgba(255,255,255,0.025)",
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Тип
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    textAlign: "right",
                  }}
                >
                  {transactionType}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Рахунок
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    textAlign: "right",
                  }}
                >
                  {transaction.accountTitle}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Сума
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {formattedAmount} ₴
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}

        <Alert
          severity="warning"
          sx={{
            mt: 2,
          }}
        >
          Видаляйте операцію лише якщо її було створено
          помилково. Видалення змінить поточний баланс
          відповідного рахунку.
        </Alert>
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
          color="error"
          disabled={loading || !transaction}
          onClick={onConfirm}
          sx={{
            minWidth: 120,
          }}
        >
          {loading ? (
            <CircularProgress
              size={21}
              color="inherit"
            />
          ) : (
            "Видалити"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}