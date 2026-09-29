import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import HallDialog from "../components/hall/HallDialog";
import DeactivateHallDialog from "../components/hall/DeactivateHallDialog";
import DeleteHallDialog from "../components/hall/DeleteHallDialog";
import HallActionsMenu from "../components/hall/HallActionsMenu";
import HallMobileCard from "../components/hall/HallMobileCard";

import { hallService } from "../services/hallService";
import type { Hall } from "../types/hall";

export default function HallsPage() {
  const [halls, setHalls] =
    useState<Hall[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [hallDialogOpen, setHallDialogOpen] =
    useState(false);

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [selectedHall, setSelectedHall] =
    useState<Hall | null>(null);

  const [statusHall, setStatusHall] =
    useState<Hall | null>(null);

  const [deleteHall, setDeleteHall] =
    useState<Hall | null>(null);

  const loadHalls = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await hallService.getAll();

      setHalls(data);
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося завантажити список залів"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHalls();
  }, []);

  const sortedHalls = useMemo(() => {
    return [...halls].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      return a.title.localeCompare(
        b.title,
        "uk"
      );
    });
  }, [halls]);

  const handleAddHall = () => {
    setSelectedHall(null);
    setHallDialogOpen(true);
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    hall: Hall
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedHall(hall);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleEditHall = () => {
    if (!selectedHall) {
      return;
    }

    setHallDialogOpen(true);
  };

  const handleHallSaved = (
    savedHall: Hall
  ) => {
    setHalls((currentHalls) => {
      const exists = currentHalls.some(
        (hall) =>
          hall.hallId === savedHall.hallId
      );

      if (exists) {
        return currentHalls.map((hall) =>
          hall.hallId === savedHall.hallId
            ? savedHall
            : hall
        );
      }

      return [
        ...currentHalls,
        savedHall,
      ];
    });

    setHallDialogOpen(false);
    setSelectedHall(null);
  };

  const handleCloseHallDialog = () => {
    setHallDialogOpen(false);
    setSelectedHall(null);
  };

  const handleActivateHall = async (
    hall: Hall
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await hallService.updateHallStatus(
        hall.hallId,
        {
          status: true,
        }
      );

      setSelectedHall(null);

      await loadHalls();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати зал"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeactivate =
    async () => {
      if (!statusHall) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await hallService.updateHallStatus(
          statusHall.hallId,
          {
            status: false,
          }
        );

        setStatusHall(null);
        setSelectedHall(null);

        await loadHalls();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося деактивувати зал"
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleConfirmDelete =
    async () => {
      if (!deleteHall) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await hallService.deleteHall(
          deleteHall.hallId
        );

        setDeleteHall(null);
        setSelectedHall(null);

        await loadHalls();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося видалити зал"
        );
      } finally {
        setActionLoading(false);
      }
    };

  return (
    <Box sx={{ width: "100%" }}>
      {/* PAGE HEADER */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",

          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,

              fontSize: {
                xs: "1.75rem",
                sm: "2.125rem",
              },
            }}
          >
            Зали
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Керуйте залами вашого
            спортивного комплексу.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddHall}
          sx={{
            px: 2.5,
            flexShrink: 0,

            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          Додати зал
        </Button>
      </Stack>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* CONTENT */}

      {loading ? (
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
      ) : sortedHalls.length === 0 ? (
        <Paper
          sx={{
            py: 8,
            px: 3,
            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <MeetingRoomOutlinedIcon
            sx={{
              fontSize: 42,
              color: "text.secondary",
              mb: 1.5,
            }}
          />

          <Typography
            sx={{
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Залів ще немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Додайте перший зал вашого
            спортивного комплексу.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* DESKTOP TABLE */}

          <Paper
            sx={{
              display: {
                xs: "none",
                md: "block",
              },

              overflow: "hidden",
              borderRadius: 1.5,
            }}
          >
            {/* TABLE HEADER */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns:
                  "minmax(180px, 1.1fr) minmax(260px, 2fr) minmax(120px, 0.7fr) minmax(130px, 0.7fr) 48px",

                alignItems: "center",

                minHeight: 52,
                px: 2.5,

                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <TableHeaderText>
                Назва
              </TableHeaderText>

              <TableHeaderText>
                Опис
              </TableHeaderText>

              <TableHeaderText>
                Місткість
              </TableHeaderText>

              <TableHeaderText>
                Статус
              </TableHeaderText>

              <Box />
            </Box>

            {/* TABLE ROWS */}

            {sortedHalls.map(
              (hall, index) => (
                <Box
                  key={hall.hallId}
                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(180px, 1.1fr) minmax(260px, 2fr) minmax(120px, 0.7fr) minmax(130px, 0.7fr) 48px",

                    alignItems: "center",

                    minHeight: 76,
                    px: 2.5,

                    borderBottom:
                      index !==
                      sortedHalls.length - 1
                        ? "1px solid"
                        : "none",

                    borderColor: "divider",

                    opacity: hall.status
                      ? 1
                      : 0.6,

                    transition:
                      "background-color 0.15s ease",

                    "&:hover": {
                      bgcolor:
                        "rgba(255,255,255,0.025)",
                    },
                  }}
                >
                  {/* TITLE */}

                  <Typography
                    sx={{
                      fontWeight: 600,
                      pr: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hall.title}
                  </Typography>

                  {/* DESCRIPTION */}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      pr: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hall.description || "—"}
                  </Typography>

                  {/* CAPACITY */}

                  <Typography variant="body2">
                    {hall.capacity}
                  </Typography>

                  {/* STATUS */}

                  <HallStatusChip
                    active={hall.status}
                  />

                  {/* ACTIONS */}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(event) =>
                        handleOpenMenu(
                          event,
                          hall
                        )
                      }
                      sx={{
                        color: "text.secondary",
                      }}
                      aria-label="Дії із залом"
                    >
                      <MoreVertRoundedIcon />
                    </IconButton>
                  </Box>
                </Box>
              )
            )}
          </Paper>

          {/* MOBILE / TABLET */}

          <Stack
            spacing={1.5}
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
            }}
          >
            {sortedHalls.map((hall) => (
              <HallMobileCard
                key={hall.hallId}
                hall={hall}
                onOpenMenu={handleOpenMenu}
              />
            ))}
          </Stack>
        </>
      )}

      {/* ACTION MENU */}

      <HallActionsMenu
        anchorEl={menuAnchor}
        hall={selectedHall}
        loading={actionLoading}
        onClose={handleCloseMenu}
        onEdit={handleEditHall}
        onActivate={handleActivateHall}
        onDeactivate={(hall) =>
          setStatusHall(hall)
        }
        onDelete={(hall) =>
          setDeleteHall(hall)
        }
      />

      {/* DIALOGS */}

      <DeactivateHallDialog
        open={statusHall !== null}
        hall={statusHall}
        loading={actionLoading}
        onClose={() =>
          setStatusHall(null)
        }
        onConfirm={
          handleConfirmDeactivate
        }
      />

      <DeleteHallDialog
        open={deleteHall !== null}
        hall={deleteHall}
        loading={actionLoading}
        onClose={() =>
          setDeleteHall(null)
        }
        onConfirm={handleConfirmDelete}
      />

      <HallDialog
        open={hallDialogOpen}
        hall={selectedHall}
        onClose={handleCloseHallDialog}
        onSaved={handleHallSaved}
      />
    </Box>
  );
}

function TableHeaderText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </Typography>
  );
}

function HallStatusChip({
  active,
}: {
  active: boolean;
}) {
  return (
    <Chip
      label={
        active
          ? "Активний"
          : "Неактивний"
      }
      size="small"
      sx={{
        justifySelf: "start",

        bgcolor: active
          ? "rgba(46,204,113,0.12)"
          : "rgba(255,255,255,0.06)",

        color: active
          ? "#5bd68a"
          : "text.secondary",

        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}