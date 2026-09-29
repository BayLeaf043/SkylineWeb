import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddCardOutlinedIcon from "@mui/icons-material/AddCardOutlined";

import { accountService } from "../../services/accountService";
import { financialTransactionService } from "../../services/financialTransactionService";

import type { AccountResponse } from "../../types/account";
import type {
  CreateFinancialTransactionRequest,
  ManualFinancialTransactionType,
} from "../../types/financialTransaction";

interface CreateTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
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

export default function CreateTransactionDialog({
  open,
  onClose,
  onCreated,
}: CreateTransactionDialogProps) {
  const [accounts, setAccounts] = useState<
    AccountResponse[]
  >([]);

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [loadingAccounts, setLoadingAccounts] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(initialFormData);
    setError("");

    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);

        const data =
          await accountService.getAll();

        setAccounts(data);
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося завантажити рахунки"
        );
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [open]);

  /*
   * Для проведення нової фінансової операції
   * використовуємо тільки активні рахунки.
   */
  const activeAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => account.status
      ),
    [accounts]
  );

  const handleTextChange =
    (
      field:
        | "amount"
        | "comment"
    ) =>
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

  const amount = Number(formData.amount);

  const isFormValid = () => {
  return Boolean(
    formData.accountId &&
      formData.amount !== "" &&
      Number.isFinite(amount) &&
      amount > 0
  );
};

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError(
        "Оберіть рахунок, тип операції та вкажіть коректну суму."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: CreateFinancialTransactionRequest = {
        accountId: Number(formData.accountId),
        type: formData.type,
        amount,
        comment:
          formData.comment.trim() || null,
      };

      await financialTransactionService.createTransaction(
        request
      );

      onCreated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося створити фінансову операцію"
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
            justifyContent: "space-between",
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
              Додати операцію
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: "flex-start",
                mt: 0.5,
              }}
            >
              <AddCardOutlinedIcon
                sx={{
                  mt: 0.15,
                  fontSize: 17,
                  color: "primary.main",
                  flexShrink: 0,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Ручне надходження або списання коштів
              </Typography>
            </Stack>
          </Box>

          <Button
            onClick={onClose}
            disabled={saving}
            color="inherit"
            sx={{
              minWidth: 0,
              p: 0.75,
              color: "text.secondary",
            }}
            aria-label="Закрити"
          >
            <CloseRoundedIcon />
          </Button>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          pt: "20px !important",
        }}
      >
        <Stack spacing={3}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {loadingAccounts ? (
            <Box
              sx={{
                minHeight: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* OPERATION */}

              <Box>
                <SectionTitle>
                  Фінансова операція
                </SectionTitle>

                <Stack spacing={2}>
                  <FormControl fullWidth required>
                    <InputLabel>
                      Тип операції
                    </InputLabel>

                    <Select
  value={formData.type}
  label="Тип операції"
  onChange={(event) =>
    setFormData((prev) => ({
      ...prev,
      type: event.target
        .value as ManualFinancialTransactionType,
    }))
  }
>
  <MenuItem value="INCOME">
    Надходження
  </MenuItem>

  <MenuItem value="EXPENSE">
    Витрата
  </MenuItem>
</Select>
                  </FormControl>

                  <FormControl fullWidth required>
                    <InputLabel>
                      Рахунок
                    </InputLabel>

                    <Select
                      value={formData.accountId}
                      label="Рахунок"
                      onChange={(event) =>
                        setFormData(
                          (prev) => ({
                            ...prev,
                            accountId:
                              event.target.value,
                          })
                        )
                      }
                    >
                      {activeAccounts.map(
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
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>

                  {activeAccounts.length === 0 && (
                    <Alert severity="warning">
                      Немає активних рахунків.
                      Спочатку створіть або активуйте
                      рахунок.
                    </Alert>
                  )}
                </Stack>
              </Box>

              {/* DETAILS */}

              <Box>
                <SectionTitle>
                  Деталі операції
                </SectionTitle>

                <Stack spacing={2}>
                  <TextField
                    label="Сума"
                    type="number"
                    value={formData.amount}
                    onChange={handleTextChange(
                      "amount"
                    )}
                    required
                    slotProps={{
                      htmlInput: {
                        min: 0.01,
                        step: 0.01,
                      },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            грн
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    label="Коментар"
                    value={formData.comment}
                    onChange={handleTextChange(
                      "comment"
                    )}
                    placeholder="Наприклад: закупівля інвентарю"
                    multiline
                    minRows={3}
                    slotProps={{
                      htmlInput: {
                        maxLength: 500,
                      },
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: "-8px !important",
                    }}
                  >
                    Коментар необов'язковий
                  </Typography>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      {/* ACTIONS */}

      {!loadingAccounts && (
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
              saving ||
              !isFormValid() ||
              activeAccounts.length === 0
            }
            sx={{
              minWidth: 145,
            }}
          >
            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Додати операцію"
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