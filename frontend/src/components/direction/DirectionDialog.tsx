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

import { directionService } from "../../services/directionService";
import type { Direction } from "../../types/direction";

interface DirectionDialogProps {
  open: boolean;
  direction: Direction | null;
  onClose: () => void;
  onSaved: (direction: Direction) => void;
}

export default function DirectionDialog({
  open,
  direction,
  onClose,
  onSaved,
}: DirectionDialogProps) {
  const isEditing = direction !== null;

  const [title, setTitle] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (direction) {
      setTitle(direction.title);
    } else {
      setTitle("");
    }

    setError("");
  }, [open, direction]);

  const isFormValid = () => {
    return title.trim().length > 0;
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError(
        "Вкажіть назву напрямку"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const savedDirection =
        isEditing
          ? await directionService.updateDirection(
              direction.directionId,
              {
                title: trimmedTitle,
              }
            )
          : await directionService.createDirection(
              {
                title: trimmedTitle,
              }
            );

      onSaved(savedDirection);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося зберегти напрямок"
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
      maxWidth="xs"
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
                ? "Редагувати напрямок"
                : "Додати напрямок"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {isEditing
                ? "Змініть назву напрямку."
                : "Вкажіть назву нового напрямку."}
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
            label="Назва напрямку"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
            autoFocus
            disabled={saving}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !saving &&
                isFormValid()
              ) {
                handleSubmit();
              }
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
            "Додати напрямок"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}