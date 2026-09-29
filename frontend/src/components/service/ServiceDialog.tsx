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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import {
  useEffect,
  useState,
} from "react";

import { serviceService } from "../../services/serviceService";
import { categoryService } from "../../services/categoryService";
import { directionService } from "../../services/directionService";

import type { Service } from "../../types/service";
import type { Category } from "../../types/category";
import type { Direction } from "../../types/direction";

interface ServiceDialogProps {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onSaved: (service: Service) => void;
}

export default function ServiceDialog({
  open,
  service,
  onClose,
  onSaved,
}: ServiceDialogProps) {
  const isEditing = service !== null;

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [directions, setDirections] =
    useState<Direction[]>([]);

  const [categoryId, setCategoryId] =
    useState<number | "">("");

  const [directionId, setDirectionId] =
    useState<number | "">("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [sessionsCount, setSessionsCount] =
    useState("");

  const [validityDays, setValidityDays] =
    useState("");

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(false);

  const [
    loadingDirections,
    setLoadingDirections,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * FORM DATA
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (service) {
      setCategoryId(service.categoryId);
      setDirectionId(service.directionId);

      setTitle(service.title);

      setDescription(
        service.description ?? ""
      );

      setPrice(
        String(service.price)
      );

      setSessionsCount(
        String(service.sessionsCount)
      );

      setValidityDays(
        String(service.validityDays)
      );
    } else {
      setCategoryId("");
      setDirectionId("");

      setTitle("");
      setDescription("");
      setPrice("");
      setSessionsCount("");
      setValidityDays("");
    }

    setError("");
  }, [open, service]);

  /*
   * LOAD CATEGORIES
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const data =
          await categoryService.getAll();

        setCategories(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити категорії"
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [open]);

  /*
   * LOAD DIRECTIONS
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadDirections = async () => {
      try {
        setLoadingDirections(true);

        const data =
          await directionService.getAll();

        setDirections(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити напрямки"
        );
      } finally {
        setLoadingDirections(false);
      }
    };

    loadDirections();
  }, [open]);

  /*
   * AVAILABLE CATEGORIES
   *
   * Активні категорії доступні завжди.
   * Неактивна залишається доступною лише
   * для послуги, яка вже до неї належить.
   */

  const availableCategories =
    categories.filter((category) => {
      if (category.status) {
        return true;
      }

      return (
        service !== null &&
        category.categoryId ===
          service.categoryId
      );
    });

  /*
   * AVAILABLE DIRECTIONS
   *
   * Та сама логіка для напрямків.
   */

  const availableDirections =
    directions.filter((direction) => {
      if (direction.status) {
        return true;
      }

      return (
        service !== null &&
        direction.directionId ===
          service.directionId
      );
    });

  /*
   * VALIDATION
   */

  const isFormValid = () => {
    const parsedPrice =
      Number(price);

    const parsedSessionsCount =
      Number(sessionsCount);

    const parsedValidityDays =
      Number(validityDays);

    return (
      directionId !== "" &&
      categoryId !== "" &&

      title.trim().length > 0 &&

      price.trim().length > 0 &&
      Number.isInteger(parsedPrice) &&
      parsedPrice >= 1 &&

      sessionsCount.trim().length > 0 &&
      Number.isInteger(
        parsedSessionsCount
      ) &&
      parsedSessionsCount >= 1 &&
      parsedSessionsCount <= 12 &&

      validityDays.trim().length > 0 &&
      Number.isInteger(
        parsedValidityDays
      ) &&
      parsedValidityDays >= 1
    );
  };

  /*
   * SUBMIT
   */

  const handleSubmit = async () => {
    const trimmedTitle =
      title.trim();

    if (directionId === "") {
      setError("Оберіть напрямок");
      return;
    }

    if (categoryId === "") {
      setError("Оберіть категорію");
      return;
    }

    if (!trimmedTitle) {
      setError(
        "Вкажіть назву послуги"
      );
      return;
    }

    if (!price.trim()) {
      setError(
        "Вкажіть вартість послуги"
      );
      return;
    }

    const parsedPrice =
      Number(price);

    if (
      !Number.isInteger(parsedPrice) ||
      parsedPrice < 1
    ) {
      setError(
        "Вартість повинна бути цілим числом, більшим за 0"
      );
      return;
    }

    if (!sessionsCount.trim()) {
      setError(
        "Вкажіть кількість занять"
      );
      return;
    }

    const parsedSessionsCount =
      Number(sessionsCount);

    if (
      !Number.isInteger(
        parsedSessionsCount
      ) ||
      parsedSessionsCount < 1 ||
      parsedSessionsCount > 12
    ) {
      setError(
        "Кількість занять повинна бути від 1 до 12"
      );
      return;
    }

    if (!validityDays.trim()) {
      setError(
        "Вкажіть термін дії"
      );
      return;
    }

    const parsedValidityDays =
      Number(validityDays);

    if (
      !Number.isInteger(
        parsedValidityDays
      ) ||
      parsedValidityDays < 1
    ) {
      setError(
        "Термін дії повинен бути цілим числом, більшим за 0"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        directionId,
        categoryId,

        title: trimmedTitle,

        description:
          description.trim() || null,

        price: parsedPrice,

        sessionsCount:
          parsedSessionsCount,

        validityDays:
          parsedValidityDays,
      };

      const savedService =
        isEditing
          ? await serviceService.updateService(
              service.serviceId,
              data
            )
          : await serviceService.createService(
              data
            );

      onSaved(savedService);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося зберегти послугу"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={
        saving
          ? undefined
          : onClose
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
            alignItems: "flex-start",
            justifyContent: "space-between",
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
              {isEditing
                ? "Редагувати послугу"
                : "Додати послугу"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {isEditing
                ? "Змініть інформацію про послугу."
                : "Заповніть основну інформацію про нову послугу."}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={onClose}
            disabled={saving}
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
        <Stack spacing={2}>
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* DIRECTION + CATEGORY */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },

              gap: 2,
            }}
          >
            {/* DIRECTION */}

            <FormControl
              fullWidth
              required
              disabled={
                loadingDirections ||
                saving
              }
            >
              <InputLabel>
                Напрямок
              </InputLabel>

              <Select
                value={directionId}
                label="Напрямок"
                onChange={(event) => {
                  const rawValue =
                    event.target.value as
                      | string
                      | number;

                  setDirectionId(
                    rawValue === ""
                      ? ""
                      : Number(rawValue)
                  );
                }}
              >
                {availableDirections.map(
                  (direction) => (
                    <MenuItem
                      key={
                        direction.directionId
                      }
                      value={
                        direction.directionId
                      }
                    >
                      {direction.title}

                      {!direction.status &&
                        " (неактивний)"}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {/* CATEGORY */}

            <FormControl
              fullWidth
              required
              disabled={
                loadingCategories ||
                saving
              }
            >
              <InputLabel>
                Категорія
              </InputLabel>

              <Select
                value={categoryId}
                label="Категорія"
                onChange={(event) => {
                  const rawValue =
                    event.target.value as
                      | string
                      | number;

                  setCategoryId(
                    rawValue === ""
                      ? ""
                      : Number(rawValue)
                  );
                }}
              >
                {availableCategories.map(
                  (category) => (
                    <MenuItem
                      key={
                        category.categoryId
                      }
                      value={
                        category.categoryId
                      }
                    >
                      {category.title}

                      {!category.status &&
                        " (неактивна)"}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          {/* TITLE */}

          <TextField
            label="Назва послуги"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            required
            disabled={saving}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />

          {/* DESCRIPTION */}

          <TextField
            label="Опис"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            multiline
            minRows={3}
            disabled={saving}
            placeholder="Короткий опис послуги"
            slotProps={{
              htmlInput: {
                maxLength: 1000,
              },
            }}
          />

          {/* PRICE + SESSIONS */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },

              gap: 2,
            }}
          >
            <TextField
              label="Вартість, грн"
              type="number"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              required
              disabled={saving}
              slotProps={{
                htmlInput: {
                  min: 1,
                  step: 1,
                },
              }}
            />

            <TextField
              label="Кількість занять"
              type="number"
              value={sessionsCount}
              onChange={(event) =>
                setSessionsCount(
                  event.target.value
                )
              }
              required
              disabled={saving}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 12,
                  step: 1,
                },
              }}
            />
          </Box>

          {/* VALIDITY */}

          <TextField
            label="Термін дії, днів"
            type="number"
            value={validityDays}
            onChange={(event) =>
              setValidityDays(
                event.target.value
              )
            }
            required
            disabled={saving}
            helperText="Кількість днів, протягом яких діє послуга"
            slotProps={{
              htmlInput: {
                min: 1,
                step: 1,
              },
            }}
          />
        </Stack>
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={saving}
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
            loadingCategories ||
            loadingDirections ||
            !isFormValid()
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
          ) : isEditing ? (
            "Зберегти зміни"
          ) : (
            "Додати послугу"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}