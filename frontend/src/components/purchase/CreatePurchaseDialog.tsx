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
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import { purchaseService } from "../../services/purchaseService";
import { clientService } from "../../services/clientService";
import { serviceService } from "../../services/serviceService";
import { accountService } from "../../services/accountService";

import type { ClientResponse } from "../../types/client";
import type { Service } from "../../types/service";
import type { AccountResponse } from "../../types/account";
import type { CreatePurchaseRequest } from "../../types/purchase";

interface CreatePurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  clientId: number | "";
  serviceId: number | "";
  accountId: number | "";
  amount: string;
  validFrom: string;
  comment: string;
}

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getInitialFormData = (): FormData => ({
  clientId: "",
  serviceId: "",
  accountId: "",
  amount: "",
  validFrom: getToday(),
  comment: "",
});

export default function CreatePurchaseDialog({
  open,
  onClose,
  onCreated,
}: CreatePurchaseDialogProps) {
  const [formData, setFormData] =
    useState<FormData>(getInitialFormData());

  const [clients, setClients] =
    useState<ClientResponse[]>([]);

  const [services, setServices] =
    useState<Service[]>([]);

  const [accounts, setAccounts] =
    useState<AccountResponse[]>([]);

  const [loadingData, setLoadingData] =
    useState(false);

  const [saving, setSaving] =
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

    setFormData(getInitialFormData());
    setError("");
  }, [open]);

  /*
   * LOAD DATA
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          clientsData,
          servicesData,
          accountsData,
        ] = await Promise.all([
          clientService.getAll(),
          serviceService.getAll(),
          accountService.getAll(),
        ]);

        setClients(
          clientsData.filter(
            (client) => client.status
          )
        );

        setServices(
          servicesData.filter(
            (service) => service.status
          )
        );

        setAccounts(
          accountsData.filter(
            (account) => account.status
          )
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити дані для оформлення покупки"
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [open]);

  /*
   * CHANGE
   */

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

  /*
   * SERVICE CHANGE
   *
   * Після вибору послуги автоматично
   * підставляємо її стандартну вартість.
   */

  const handleServiceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const serviceId =
      Number(event.target.value);

    const selectedService =
      services.find(
        (service) =>
          service.serviceId === serviceId
      );

    setFormData((prev) => ({
      ...prev,
      serviceId,
      amount: selectedService
        ? String(selectedService.price)
        : "",
    }));
  };

  /*
   * VALIDATION
   */

  const isFormValid = () => {
    const parsedAmount =
      Number(formData.amount);

    return (
      formData.clientId !== "" &&
      formData.serviceId !== "" &&
      formData.accountId !== "" &&
      formData.amount.trim().length > 0 &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      formData.validFrom !== ""
    );
  };

  /*
   * SUBMIT
   */

  const handleSubmit = async () => {
    if (formData.clientId === "") {
      setError("Оберіть клієнта.");
      return;
    }

    if (formData.serviceId === "") {
      setError("Оберіть послугу.");
      return;
    }

    if (formData.accountId === "") {
      setError(
        "Оберіть рахунок для зарахування коштів."
      );
      return;
    }

    const parsedAmount =
      Number(formData.amount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError(
        "Сума покупки повинна бути більшою за 0."
      );
      return;
    }

    if (!formData.validFrom) {
      setError(
        "Вкажіть дату початку дії сертифіката."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: CreatePurchaseRequest = {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        accountId: formData.accountId,
        amount: parsedAmount,
        validFrom: formData.validFrom,
        comment:
          formData.comment.trim() || null,
      };

      await purchaseService.createPurchase(
        request
      );

      onCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося оформити покупку"
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
              Оформити покупку
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: "flex-start",
                mt: 0.5,
              }}
            >
              <ShoppingCartOutlinedIcon
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
                Продаж послуги клієнту та
                створення сертифіката
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
        {loadingData ? (
          <Box
            sx={{
              minHeight: 300,
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

            {/* PURCHASE */}

            <Box>
              <SectionTitle>
                Дані покупки
              </SectionTitle>

              <Stack spacing={2}>
                <TextField
                  select
                  label="Клієнт"
                  value={formData.clientId}
                  onChange={handleChange(
                    "clientId"
                  )}
                  required
                  fullWidth
                  disabled={saving}
                >
                  {clients.map((client) => (
                    <MenuItem
                      key={client.clientId}
                      value={client.clientId}
                    >
                      {client.firstName}{" "}
                      {client.lastName}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Послуга"
                  value={formData.serviceId}
                  onChange={
                    handleServiceChange
                  }
                  required
                  fullWidth
                  disabled={saving}
                >
                  {services.map((service) => (
                    <MenuItem
                      key={service.serviceId}
                      value={service.serviceId}
                    >
                      {service.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Box>

            {/* PAYMENT */}

            <Box>
              <SectionTitle>
                Оплата
              </SectionTitle>

              <Stack spacing={2}>
                <TextField
                  select
                  label="Рахунок"
                  value={formData.accountId}
                  onChange={handleChange(
                    "accountId"
                  )}
                  required
                  fullWidth
                  disabled={saving}
                  helperText="Рахунок, на який буде зараховано оплату"
                >
                  {accounts.map((account) => (
                    <MenuItem
                      key={account.accountId}
                      value={account.accountId}
                    >
                      {account.title}
                    </MenuItem>
                  ))}
                </TextField>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <TextField
                    label="Сума, грн"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange(
                      "amount"
                    )}
                    required
                    fullWidth
                    disabled={saving}
                    slotProps={{
                      htmlInput: {
                        min: 0.01,
                        step: 0.01,
                      },
                    }}
                  />

                  <TextField
                    label="Початок дії"
                    type="date"
                    value={
                      formData.validFrom
                    }
                    onChange={handleChange(
                      "validFrom"
                    )}
                    required
                    fullWidth
                    disabled={saving}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* COMMENT */}

            <Box>
              <SectionTitle>
                Додаткова інформація
              </SectionTitle>

              <TextField
                label="Коментар"
                value={formData.comment}
                onChange={handleChange(
                  "comment"
                )}
                multiline
                minRows={3}
                fullWidth
                disabled={saving}
                placeholder="Наприклад: знижка, особливі умови продажу..."
              />
            </Box>
          </Stack>
        )}
      </DialogContent>

      {/* ACTIONS */}

      {!loadingData && (
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
              minWidth: 160,
            }}
          >
            {saving ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              "Оформити покупку"
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