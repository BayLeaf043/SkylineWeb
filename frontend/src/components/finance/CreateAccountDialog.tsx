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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import IconButton from "@mui/material/IconButton";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import { accountService } from "../../services/accountService";

import type {
  AccountType,
  CreateAccountRequest,
} from "../../types/account";

interface CreateAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  title: string;
  type: AccountType;
  openingBalance: string;
}

const initialFormData: FormData = {
  title: "",
  type: "CASH",
  openingBalance: "0",
};

export default function CreateAccountDialog({
  open,
  onClose,
  onCreated,
}: CreateAccountDialogProps) {
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setError("");
    }
  }, [open]);

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

  const openingBalance =
    Number(formData.openingBalance);

  const isFormValid = () => {
    return Boolean(
      formData.title.trim() &&
        formData.type &&
        formData.openingBalance !== "" &&
        Number.isFinite(openingBalance) &&
        openingBalance >= 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError(
        "Перевірте правильність заповнення полів."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: CreateAccountRequest = {
        title: formData.title.trim(),
        type: formData.type,
        openingBalance,
      };

      await accountService.createAccount(
        request
      );

      onCreated();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося створити рахунок"
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
              Додати рахунок
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: "flex-start",
                mt: 0.5,
              }}
            >
              <AccountBalanceWalletOutlinedIcon
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
                Новий фінансовий рахунок спортивного комплексу
              </Typography>
            </Stack>
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
        <Stack spacing={3}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Box>
            <SectionTitle>
              Дані рахунку
            </SectionTitle>

            <Stack spacing={2}>
              <TextField
                label="Назва рахунку"
                value={formData.title}
                onChange={handleChange("title")}
                placeholder="Наприклад: Готівка"
                required
                fullWidth
              />

              <TextField
                select
                label="Тип рахунку"
                value={formData.type}
                onChange={handleChange("type")}
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

          <Box>
            <SectionTitle>
              Початковий баланс
            </SectionTitle>

            <TextField
              label="Початковий баланс"
              type="number"
              value={formData.openingBalance}
              onChange={handleChange(
                "openingBalance"
              )}
              required
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              helperText="Початковий баланс задається лише під час створення рахунку."
            />
          </Box>
        </Stack>
      </DialogContent>

      {/* ACTIONS */}

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
            minWidth: 130,
          }}
        >
          {saving ? (
            <CircularProgress
              size={22}
              color="inherit"
            />
          ) : (
            "Додати"
          )}
        </Button>
      </DialogActions>
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