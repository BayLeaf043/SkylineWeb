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
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";

import { accountService } from "../../services/accountService";
import { accountTransferService } from "../../services/accountTransferService";

import type { AccountResponse } from "../../types/account";
import type { CreateAccountTransferRequest } from "../../types/accountTransfer";

interface CreateTransferDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  comment: string;
}

const initialFormData: FormData = {
  fromAccountId: "",
  toAccountId: "",
  amount: "",
  comment: "",
};

export default function CreateTransferDialog({
  open,
  onClose,
  onCreated,
}: CreateTransferDialogProps) {
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
   * Для переказу використовуємо
   * тільки активні рахунки.
   */
  const activeAccounts = useMemo(
    () =>
      accounts.filter(
        (account) => account.status
      ),
    [accounts]
  );

  /*
   * Обраний рахунок списання.
   * Потрібен для відображення
   * поточного балансу.
   */
  const fromAccount = useMemo(
    () =>
      activeAccounts.find(
        (account) =>
          account.accountId ===
          Number(formData.fromAccountId)
      ) ?? null,
    [
      activeAccounts,
      formData.fromAccountId,
    ]
  );

  const amount =
    Number(formData.amount);

  const insufficientFunds =
    fromAccount !== null &&
    formData.amount !== "" &&
    Number.isFinite(amount) &&
    amount > fromAccount.balance;

  const isFormValid = () => {
    return Boolean(
      formData.fromAccountId &&
        formData.toAccountId &&
        formData.fromAccountId !==
          formData.toAccountId &&
        formData.amount !== "" &&
        Number.isFinite(amount) &&
        amount > 0 &&
        !insufficientFunds
    );
  };

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

  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (
        formData.fromAccountId ===
        formData.toAccountId
      ) {
        setError(
          "Рахунок списання та рахунок зарахування повинні бути різними."
        );
        return;
      }

      if (insufficientFunds) {
        setError(
          "Недостатньо коштів на рахунку для виконання переказу."
        );
        return;
      }

      setError(
        "Оберіть рахунки та вкажіть коректну суму переказу."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: CreateAccountTransferRequest = {
        fromAccountId: Number(
          formData.fromAccountId
        ),

        toAccountId: Number(
          formData.toAccountId
        ),

        amount,

        comment:
          formData.comment.trim() || null,
      };

      await accountTransferService.createTransfer(
        request
      );

      onCreated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося виконати переказ"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "uk-UA",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
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
              Переказ між рахунками
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: "flex-start",
                mt: 0.5,
              }}
            >
              <SwapHorizRoundedIcon
                sx={{
                  mt: 0.15,
                  fontSize: 18,
                  color: "primary.main",
                  flexShrink: 0,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Переміщення коштів між рахунками
                спортивного комплексу
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
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* ACCOUNTS */}

              <Box>
                <SectionTitle>
                  Рахунки
                </SectionTitle>

                <Stack spacing={2}>
                  {/* FROM */}

                  <FormControl
                    fullWidth
                    required
                  >
                    <InputLabel>
                      З рахунку
                    </InputLabel>

                    <Select
                      value={
                        formData.fromAccountId
                      }
                      label="З рахунку"
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setFormData(
                          (prev) => ({
                            ...prev,
                            fromAccountId:
                              value,

                            /*
                             * Якщо рахунок уже був
                             * обраний як рахунок
                             * зарахування — очищаємо його.
                             */
                            toAccountId:
                              prev.toAccountId ===
                              value
                                ? ""
                                : prev.toAccountId,
                          })
                        );

                        setError("");
                      }}
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
                            {" — "}
                            {formatMoney(
                              account.balance
                            )}{" "}
                            грн
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>

                  {/* CURRENT BALANCE */}

                  {fromAccount && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1.25,

                        borderRadius: 1,
                        bgcolor:
                          "rgba(255,255,255,0.035)",

                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Доступно на рахунку
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {formatMoney(
                          fromAccount.balance
                        )}{" "}
                        грн
                      </Typography>
                    </Box>
                  )}

                  {/* TO */}

                  <FormControl
                    fullWidth
                    required
                  >
                    <InputLabel>
                      На рахунок
                    </InputLabel>

                    <Select
                      value={
                        formData.toAccountId
                      }
                      label="На рахунок"
                      onChange={(event) => {
                        setFormData(
                          (prev) => ({
                            ...prev,
                            toAccountId:
                              event.target.value,
                          })
                        );

                        setError("");
                      }}
                    >
                      {activeAccounts
                        .filter(
                          (account) =>
                            String(
                              account.accountId
                            ) !==
                            formData.fromAccountId
                        )
                        .map((account) => (
                          <MenuItem
                            key={
                              account.accountId
                            }
                            value={String(
                              account.accountId
                            )}
                          >
                            {account.title}
                            {" — "}
                            {formatMoney(
                              account.balance
                            )}{" "}
                            грн
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {activeAccounts.length < 2 && (
                    <Alert severity="warning">
                      Для переказу необхідно мати
                      щонайменше два активні рахунки.
                    </Alert>
                  )}
                </Stack>
              </Box>

              {/* DETAILS */}

              <Box>
                <SectionTitle>
                  Деталі переказу
                </SectionTitle>

                <Stack spacing={2}>
                  <TextField
                    label="Сума"
                    type="number"
                    value={formData.amount}
                    onChange={(event) => {
                      handleTextChange(
                        "amount"
                      )(event);

                      setError("");
                    }}
                    required
                    error={insufficientFunds}
                    helperText={
                      insufficientFunds
                        ? "Сума переказу перевищує доступний баланс рахунку."
                        : undefined
                    }
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
                    placeholder="Наприклад: внесення готівки на банківський рахунок"
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
              activeAccounts.length < 2
            }
            sx={{
              minWidth: 155,
            }}
          >
            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Виконати переказ"
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