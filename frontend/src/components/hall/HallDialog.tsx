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
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import {
  useEffect,
  useState,
} from "react";

import { hallService } from "../../services/hallService";
import type { Hall } from "../../types/hall";

interface HallDialogProps {
  open: boolean;
  hall: Hall | null;
  onClose: () => void;
  onSaved: (hall: Hall) => void;
}

export default function HallDialog({
  open,
  hall,
  onClose,
  onSaved,
}: HallDialogProps) {
  const isEditing = hall !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [capacity, setCapacity] =
    useState("");

  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (hall) {
      setTitle(hall.title);
      setDescription(
        hall.description ?? ""
      );
      setCapacity(
        String(hall.capacity)
      );
    } else {
      setTitle("");
      setDescription("");
      setCapacity("");
    }

    setError("");
  }, [open, hall]);

  const isFormValid = () => {
    const parsedCapacity =
      Number(capacity);

    return (
      title.trim().length > 0 &&
      capacity.trim().length > 0 &&
      Number.isInteger(parsedCapacity) &&
      parsedCapacity >= 1
    );
  };

  const handleSubmit = async () => {
    const trimmedTitle =
      title.trim();

    if (!trimmedTitle) {
      setError("Вкажіть назву залу");
      return;
    }

    if (!capacity.trim()) {
      setError("Вкажіть місткість залу");
      return;
    }

    const parsedCapacity =
      Number(capacity);

    if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity < 1
    ) {
      setError(
        "Місткість повинна бути цілим числом, більшим за 0"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        title: trimmedTitle,
        description:
          description.trim() || null,
        capacity: parsedCapacity,
      };

      const savedHall = isEditing
        ? await hallService.updateHall(
            hall.hallId,
            data
          )
        : await hallService.createHall(
            data
          );

      onSaved(savedHall);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося зберегти зал"
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
            alignItems: "flex-start",
            justifyContent:
              "space-between",
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
                ? "Редагувати зал"
                : "Додати зал"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {isEditing
                ? "Змініть інформацію про зал."
                : "Заповніть основну інформацію про новий зал."}
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

          <TextField
            label="Назва залу"
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
            slotProps={{
              htmlInput: {
                maxLength: 1000,
              },
            }}
          />

          <TextField
            label="Місткість"
            type="number"
            value={capacity}
            onChange={(event) =>
              setCapacity(
                event.target.value
              )
            }
            required
            disabled={saving}
            helperText="Максимальна кількість людей у залі"
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
            !isFormValid()
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
          ) : isEditing ? (
            "Зберегти зміни"
          ) : (
            "Додати зал"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}