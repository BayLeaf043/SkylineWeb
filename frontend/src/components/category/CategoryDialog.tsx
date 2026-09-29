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

import { categoryService } from "../../services/categoryService";
import type { Category } from "../../types/category";

interface CategoryDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: (category: Category) => void;
}

export default function CategoryDialog({
  open,
  category,
  onClose,
  onSaved,
}: CategoryDialogProps) {
  const isEditing = category !== null;

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

    if (category) {
      setTitle(category.title);
    } else {
      setTitle("");
    }

    setError("");
  }, [open, category]);

  const isFormValid = () => {
    return title.trim().length > 0;
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError(
        "Вкажіть назву категорії"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const savedCategory =
        isEditing
          ? await categoryService.updateCategory(
              category.categoryId,
              {
                title: trimmedTitle,
              }
            )
          : await categoryService.createCategory(
              {
                title: trimmedTitle,
              }
            );

      onSaved(savedCategory);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося зберегти категорію"
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
                ? "Редагувати категорію"
                : "Додати категорію"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {isEditing
                ? "Змініть назву категорії послуг."
                : "Вкажіть назву нової категорії послуг."}
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
            label="Назва категорії"
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
            "Додати категорію"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}