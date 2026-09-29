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
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import { accountService } from "../../services/accountService";

import type {
  AccountResponse,
  AccountType,
  UpdateAccountRequest,
} from "../../types/account";

interface EditAccountDialogProps {
  open: boolean;
  accountId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface FormData {
  title: string;
  type: AccountType;
}

const initialFormData: FormData = {
  title: "",
  type: "CASH",
};

export default function EditAccountDialog({
  open,
  accountId,
  onClose,
  onUpdated,
}: EditAccountDialogProps) {
  const [account, setAccount] =
    useState<AccountResponse | null>(null);

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open || accountId === null) {
      return;
    }

    const loadAccount = async () => {
      try {
        setLoading(true);
        setError("");
        setAccount(null);

        const data =
          await accountService.getById(
            accountId
          );

        setAccount(data);

        setFormData({
          title: data.title,
          type: data.type,
        });
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося завантажити дані рахунку"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [open, accountId]);

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

  const isFormValid = () => {
    return Boolean(
      formData.title.trim() &&
        formData.type
    );
  };

  const handleSubmit = async () => {
    if (
      accountId === null ||
      !account
    ) {
      return;
    }

    if (!isFormValid()) {
      setError(
        "Заповніть усі обов'язкові поля."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: UpdateAccountRequest = {
        title: formData.title.trim(),
        type: formData.type,
      };

      await accountService.updateAccount(
        accountId,
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
      onClose={saving ? undefined : onClose}
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
              Редагувати рахунок
            </Typography>

            {account && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <AccountBalanceWalletOutlinedIcon
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
                  {account.title}
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
              minHeight: 180,
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

            {account && (
              <Box>
                <SectionTitle>
                  Дані рахунку
                </SectionTitle>

                <Stack spacing={2}>
                  <TextField
                    label="Назва рахунку"
                    value={formData.title}
                    onChange={handleChange(
                      "title"
                    )}
                    required
                    fullWidth
                  />

                  <TextField
                    select
                    label="Тип рахунку"
                    value={formData.type}
                    onChange={handleChange(
                      "type"
                    )}
                    required
                    fullWidth
                  >
                    <MenuItem value="CASH">
                      Готівка
                    </MenuItem>

                    <MenuItem value="BANK">
                      Банківський рахунок
                    </MenuItem>
                  </TextField>
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* ACTIONS */}

      {!loading && account && (
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