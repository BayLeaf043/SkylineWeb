import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { accountService } from "../../services/accountService";
import { financialTransactionService } from "../../services/financialTransactionService";

import type { AccountResponse } from "../../types/account";

import type {
  FinancialTransactionResponse,
  ManualFinancialTransactionType,
  UpdateFinancialTransactionRequest,
} from "../../types/financialTransaction";

interface EditTransactionDialogProps {
  open: boolean;
  transactionId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface FormData {
  accountId: string;
  type: ManualFinancialTransactionType;
  amount: string;
  comment: string;
}

const initialFormData: FormData = {
  accountId: "",
  type: "INCOME",
  amount: "",
  comment: "",
};

export default function EditTransactionDialog({
  open,
  transactionId,
  onClose,
  onUpdated,
}: EditTransactionDialogProps) {
  const [transaction, setTransaction] =
    useState<FinancialTransactionResponse | null>(
      null
    );

  const [accounts, setAccounts] = useState<
    AccountResponse[]
  >([]);

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || transactionId === null) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setTransaction(null);
        setAccounts([]);
        setFormData(initialFormData);

        const [transactionData, accountsData] =
          await Promise.all([
            financialTransactionService.getById(
              transactionId
            ),
            accountService.getAll(),
          ]);

        /*
         * На frontend редагування передбачене
         * лише для ручних INCOME / EXPENSE.
         *
         * Остаточний захист цього правила
         * все одно залишається на backend.
         */
        const isManualTransaction =
          (transactionData.type === "INCOME" ||
            transactionData.type === "EXPENSE") &&
          transactionData.purchaseId === null &&
          transactionData.transferId === null;

        if (!isManualTransaction) {
          setError(
            "Цю фінансову операцію не можна редагувати."
          );
          return;
        }

        setTransaction(transactionData);

        /*
         * Показуємо:
         * - усі активні рахунки;
         * - поточний рахунок транзакції,
         *   навіть якщо його вже деактивовано.
         */
        const availableAccounts =
          accountsData.filter(
            (account) =>
              account.status ||
              account.accountId ===
                transactionData.accountId
          );

        setAccounts(availableAccounts);

        setFormData({
          accountId: String(
            transactionData.accountId
          ),
          type:
            transactionData.type as ManualFinancialTransactionType,
          amount: String(
            transactionData.amount
          ),
          comment:
            transactionData.comment ?? "",
        });
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося завантажити фінансову операцію"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, transactionId]);

  const handleChange =
    (field: keyof FormData) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const amount =
    Number(formData.amount);

  const isFormValid = () => {
    return Boolean(
      formData.accountId &&
        formData.amount !== "" &&
        Number.isFinite(amount) &&
        amount > 0
    );
  };

  const handleSubmit = async () => {
    if (
      transactionId === null ||
      !transaction
    ) {
      return;
    }

    if (!isFormValid()) {
      setError(
        "Заповніть усі обов'язкові поля коректно."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: UpdateFinancialTransactionRequest =
        {
          accountId: Number(
            formData.accountId
          ),
          type: formData.type,
          amount,
          comment:
            formData.comment.trim() || null,
        };

      await financialTransactionService.updateTransaction(
        transactionId,
        request
      );

      onUpdated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося зберегти зміни"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={
        saving ? undefined : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      {/* HEADER */}

      <DialogTitle>
        <Stack
          direction="row"
          spacing={{
            xs: 1,
            sm: 2,
          }}
          sx={{
            justifyContent:
              "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: "1.15rem",
                  sm: "1.5rem",
                },
              }}
            >
              Редагувати операцію
            </Typography>

            {transaction && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <EditOutlinedIcon
                  sx={{
                    fontSize: 17,
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {transaction.type ===
                  "INCOME"
                    ? "Надходження"
                    : "Витрата"}
                  {" · "}
                  {transaction.accountTitle}
                </Typography>
              </Stack>
            )}
          </Box>

          <IconButton
            onClick={onClose}
            disabled={saving}
            size="small"
            sx={{
              color: "text.secondary",
              flexShrink: 0,
            }}
            aria-label="Закрити"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "20px !important",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {transaction && (
              <>
                {/* OPERATION */}

                <Box>
                  <SectionTitle>
                    Фінансова операція
                  </SectionTitle>

                  <Stack spacing={2}>
                    <TextField
                      select
                      label="Тип операції"
                      value={formData.type}
                      onChange={handleChange(
                        "type"
                      )}
                      required
                      fullWidth
                    >
                      <MenuItem value="INCOME">
                        Надходження
                      </MenuItem>

                      <MenuItem value="EXPENSE">
                        Витрата
                      </MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Рахунок"
                      value={
                        formData.accountId
                      }
                      onChange={handleChange(
                        "accountId"
                      )}
                      required
                      fullWidth
                    >
                      {accounts.map(
                        (account) => (
                          <MenuItem
                            key={
                              account.accountId
                            }
                            value={String(
                              account.accountId
                            )}
                          >
                            {account.title}

                            {!account.status &&
                              " (неактивний)"}
                          </MenuItem>
                        )
                      )}
                    </TextField>

                    <TextField
                      label="Сума"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange(
                        "amount"
                      )}
                      required
                      fullWidth
                      slotProps={{
                        htmlInput: {
                          min: 0.01,
                          step: 0.01,
                        },
                      }}
                    />
                  </Stack>
                </Box>

                {/* COMMENT */}

                <Box>
                  <SectionTitle>
                    Коментар
                  </SectionTitle>

                  <TextField
                    label="Коментар"
                    value={
                      formData.comment
                    }
                    onChange={handleChange(
                      "comment"
                    )}
                    placeholder="Наприклад: закупівля інвентарю"
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* ACTIONS */}

      {!loading && transaction && (
        <DialogActions>
          <Button
            onClick={onClose}
            disabled={saving}
            color="inherit"
            sx={{
              color: "text.secondary",
            }}
          >
            Скасувати
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              saving || !isFormValid()
            }
            sx={{
              minWidth: 150,
            }}
          >
            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Зберегти зміни"
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Typography
      variant="body2"
      sx={{
        mb: 1.25,
        fontWeight: 700,
        color: "text.secondary",
      }}
    >
      {children}
    </Typography>
  );
}