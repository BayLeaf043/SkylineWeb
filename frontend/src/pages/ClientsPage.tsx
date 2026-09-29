import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Avatar,
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
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import CreateClientDialog from "../components/client/CreateClientDialog";
import EditClientDialog from "../components/client/EditClientDialog";
import DeactivateClientDialog from "../components/client/DeactivateClientDialog";
import DeleteClientDialog from "../components/client/DeleteClientDialog";
import ClientActionsMenu from "../components/client/ClientActionsMenu";
import ClientMobileCard from "../components/client/ClientMobileCard";

import { clientService } from "../services/clientService";

import type {
  ClientResponse,
} from "../types/client";

export default function ClientsPage() {
  const [clients, setClients] =
    useState<ClientResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [
    selectedClient,
    setSelectedClient,
  ] = useState<ClientResponse | null>(null);

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [
    statusClient,
    setStatusClient,
  ] = useState<ClientResponse | null>(null);

  const [
    deleteClient,
    setDeleteClient,
  ] = useState<ClientResponse | null>(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await clientService.getAll();

      setClients(data);
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося завантажити список клієнтів"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
        "uk"
      );
    });
  }, [clients]);

  const getInitials = (
    client: ClientResponse
  ) => {
    const first =
      client.firstName?.charAt(0) || "";

    const last =
      client.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  const formatLastVisit = (
    value: string | null
  ) => {
    if (!value) {
      return "Ще не відвідував";
    }

    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  };

  const handleClientCreated = async () => {
    setCreateDialogOpen(false);

    await loadClients();
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    client: ClientResponse
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedClient(client);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleActivateClient = async (
    client: ClientResponse
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await clientService.updateClientStatus(
        client.clientId,
        {
          status: true,
        }
      );

      setSelectedClient(null);

      await loadClients();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати клієнта"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!statusClient) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await clientService.updateClientStatus(
        statusClient.clientId,
        {
          status: false,
        }
      );

      setStatusClient(null);
      setSelectedClient(null);

      await loadClients();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося деактивувати клієнта"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteClient) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await clientService.deleteClient(
        deleteClient.clientId
      );

      setDeleteClient(null);
      setSelectedClient(null);

      await loadClients();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося видалити клієнта"
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
            Клієнти
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Керуйте клієнтами спортивного
            комплексу та їхніми даними.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() =>
            setCreateDialogOpen(true)
          }
          sx={{
            px: 2.5,
            flexShrink: 0,

            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          Додати клієнта
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
      ) : sortedClients.length === 0 ? (
        <Paper
          sx={{
            py: 8,
            px: 3,
            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Клієнтів ще немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Додайте першого клієнта
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
                  "minmax(220px, 1.4fr) minmax(160px, 0.9fr) minmax(120px, 0.65fr) minmax(170px, 0.9fr) minmax(120px, 0.7fr) 48px",

                alignItems: "center",

                minHeight: 52,
                px: 2.5,

                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <TableHeaderText>
                Клієнт
              </TableHeaderText>

              <TableHeaderText>
                Телефон
              </TableHeaderText>

              <TableHeaderText>
                Відвідування
              </TableHeaderText>

              <TableHeaderText>
                Останнє відвідування
              </TableHeaderText>

              <TableHeaderText>
                Статус
              </TableHeaderText>

              <Box />
            </Box>

            {/* TABLE ROWS */}

            {sortedClients.map(
              (client, index) => (
                <Box
                  key={client.clientId}
                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(220px, 1.4fr) minmax(160px, 0.9fr) minmax(120px, 0.65fr) minmax(170px, 0.9fr) minmax(120px, 0.7fr) 48px",

                    alignItems: "center",

                    minHeight: 76,
                    px: 2.5,

                    borderBottom:
                      index !==
                      sortedClients.length - 1
                        ? "1px solid"
                        : "none",

                    borderColor: "divider",

                    opacity: client.status
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
                  {/* CLIENT */}

                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      minWidth: 0,
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,

                        bgcolor:
                          "rgba(47,140,255,0.16)",

                        color:
                          "primary.main",

                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {getInitials(client)}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {client.firstName}{" "}
                        {client.lastName}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* PHONE */}

                  <Typography
                    variant="body2"
                    color={
                      client.phone
                        ? "text.primary"
                        : "text.secondary"
                    }
                  >
                    {client.phone || "—"}
                  </Typography>

                  {/* VISITS */}

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {client.countOfVisits}
                  </Typography>

                  {/* LAST VISIT */}

                  <Typography
                    variant="body2"
                    color={
                      client.lastVisit
                        ? "text.primary"
                        : "text.secondary"
                    }
                  >
                    {formatLastVisit(
                      client.lastVisit
                    )}
                  </Typography>

                  {/* STATUS */}

                  <ClientStatusChip
                    active={client.status}
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
                          client
                        )
                      }
                      sx={{
                        color:
                          "text.secondary",
                      }}
                      aria-label="Дії з клієнтом"
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
            {sortedClients.map(
              (client) => (
                <ClientMobileCard
                  key={client.clientId}
                  client={client}
                  onOpenMenu={
                    handleOpenMenu
                  }
                />
              )
            )}
          </Stack>
        </>
      )}

      {/* ACTION MENU */}

      <ClientActionsMenu
        anchorEl={menuAnchor}
        client={selectedClient}
        loading={actionLoading}
        onClose={handleCloseMenu}
        onEdit={() =>
          setEditDialogOpen(true)
        }
        onActivate={
          handleActivateClient
        }
        onDeactivate={(client) =>
          setStatusClient(client)
        }
        onDelete={(client) =>
          setDeleteClient(client)
        }
      />

      {/* DIALOGS */}

      <DeactivateClientDialog
        open={statusClient !== null}
        client={statusClient}
        loading={actionLoading}
        onClose={() =>
          setStatusClient(null)
        }
        onConfirm={
          handleConfirmDeactivate
        }
      />

      <DeleteClientDialog
        open={deleteClient !== null}
        client={deleteClient}
        loading={actionLoading}
        onClose={() =>
          setDeleteClient(null)
        }
        onConfirm={handleConfirmDelete}
      />

      <CreateClientDialog
        open={createDialogOpen}
        onClose={() =>
          setCreateDialogOpen(false)
        }
        onCreated={
          handleClientCreated
        }
      />

      <EditClientDialog
        open={editDialogOpen}
        clientId={
          selectedClient?.clientId ??
          null
        }
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedClient(null);
        }}
        onUpdated={async () => {
          setEditDialogOpen(false);
          setSelectedClient(null);

          await loadClients();
        }}
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

function ClientStatusChip({
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