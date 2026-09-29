import { useEffect, useState } from "react";

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
  TextField,
  Typography,
} from "@mui/material";

import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import { purchaseService } from "../../services/purchaseService";

import type {
  PurchaseResponse,
  RefundPurchaseRequest,
} from "../../types/purchase";

interface RefundPurchaseDialogProps {
  open: boolean;
  purchase: PurchaseResponse | null;
  onClose: () => void;
  onRefunded: () => void;
}

export default function RefundPurchaseDialog({
  open,
  purchase,
  onClose,
  onRefunded,
}: RefundPurchaseDialogProps) {
  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * RESET
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    setComment("");
    setError("");
  }, [open, purchase]);

  /*
   * REFUND
   */

  const handleConfirm = async () => {
    if (!purchase) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const request: RefundPurchaseRequest = {
        comment:
          comment.trim() || null,
      };

      await purchaseService.refundPurchase(
        purchase.purchaseId,
        request
      );

      onRefunded();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося виконати повернення коштів"
      );
    } finally {
      setLoading(false);
    }
  };

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

              bgcolor:
                "rgba(255,167,38,0.12)",
              color: "#ffb74d",

              flexShrink: 0,
            }}
          >
            <ReplayRoundedIcon />
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
            Повернути кошти?
          </Typography>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "12px !important",
        }}
      >
        <Stack spacing={2}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <DialogContentText
            sx={{
              color: "text.secondary",
              lineHeight: 1.65,
            }}
          >
            Для покупки{" "}
            <Box
              component="span"
              sx={{
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              #{purchase?.purchaseId}
            </Box>{" "}
            клієнта{" "}
            <Box
              component="span"
              sx={{
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              {purchase?.clientFirstName}{" "}
              {purchase?.clientLastName}
            </Box>{" "}
            буде виконано повернення коштів.
          </DialogContentText>

          {/* PURCHASE INFO */}

          {purchase && (
            <Box
              sx={{
                p: 1.5,

                borderRadius: 1,

                bgcolor:
                  "rgba(255,255,255,0.035)",

                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Stack spacing={1}>
                <InfoRow
                  label="Послуга"
                  value={purchase.serviceTitle}
                />

                <InfoRow
                  label="Сума"
                  value={`${formatMoney(
                    purchase.amount
                  )} грн`}
                />
              </Stack>
            </Box>
          )}

          {/* COMMENT */}

          <TextField
            label="Причина повернення"
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value
              )
            }
            multiline
            minRows={3}
            fullWidth
            disabled={loading}
            placeholder="Наприклад: повернення за заявою клієнта"
          />

          {/* WARNING */}

          <Alert severity="warning">
            Після підтвердження покупку буде
            позначено як повернену, а в історії
            фінансових операцій буде відображено
            повернення коштів.
          </Alert>
        </Stack>
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
          disabled={
            loading || !purchase
          }
          onClick={handleConfirm}
          sx={{
            minWidth: 150,
          }}
        >
          {loading ? (
            <CircularProgress
              size={21}
              color="inherit"
            />
          ) : (
            "Повернути кошти"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/*
 * INFO ROW
 */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

/*
 * MONEY
 */

function formatMoney(
  value: number
): string {
  return new Intl.NumberFormat(
    "uk-UA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
}