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
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import EmployeeTypeDialog from "../components/employee/EmployeeTypeDialog";
import CreateEmployeeDialog, {
  type EmployeeType,
} from "../components/employee/CreateEmployeeDialog";
import EditEmployeeDialog from "../components/employee/EditEmployeeDialog";
import DeactivateEmployeeDialog from "../components/employee/DeactivateEmployeeDialog";
import DeleteEmployeeDialog from "../components/employee/DeleteEmployeeDialog";
import EmployeeActionsMenu from "../components/employee/EmployeeActionsMenu";
import EmployeeMobileCard from "../components/employee/EmployeeMobileCard";

import { useAuth } from "../context/AuthContext";
import { employeeService } from "../services/employeeService";

import type {
  EmployeeResponse,
} from "../types/employee";

export default function EmployeesPage() {
  const { user } = useAuth();

  const [employees, setEmployees] =
    useState<EmployeeResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [typeDialogOpen, setTypeDialogOpen] =
    useState(false);

  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);

  const [
    selectedEmployeeType,
    setSelectedEmployeeType,
  ] = useState<EmployeeType | null>(null);

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState<EmployeeResponse | null>(null);

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [
    statusEmployee,
    setStatusEmployee,
  ] = useState<EmployeeResponse | null>(null);

  const [
    deleteEmployee,
    setDeleteEmployee,
  ] = useState<EmployeeResponse | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await employeeService.getAll();

      setEmployees(data);
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося завантажити список працівників"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      return `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
        "uk"
      );
    });
  }, [employees]);

  const getInitials = (
    employee: EmployeeResponse
  ) => {
    const first =
      employee.firstName?.charAt(0) || "";

    const last =
      employee.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  const handleSelectEmployeeType = (
    type: EmployeeType
  ) => {
    setTypeDialogOpen(false);
    setSelectedEmployeeType(type);
    setCreateDialogOpen(true);
  };

  const handleEmployeeCreated = async () => {
    setCreateDialogOpen(false);
    setSelectedEmployeeType(null);

    await loadEmployees();
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    employee: EmployeeResponse
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleActivateEmployee = async (
    employee: EmployeeResponse
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await employeeService.updateStatus(
        employee.userId,
        {
          status: true,
        }
      );

      setSelectedEmployee(null);

      await loadEmployees();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати працівника"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!statusEmployee) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await employeeService.updateStatus(
        statusEmployee.userId,
        {
          status: false,
        }
      );

      setStatusEmployee(null);
      setSelectedEmployee(null);

      await loadEmployees();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося деактивувати працівника"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteEmployee) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await employeeService.deleteEmployee(
        deleteEmployee.userId
      );

      setDeleteEmployee(null);
      setSelectedEmployee(null);

      await loadEmployees();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося видалити працівника"
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
            Працівники
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Керуйте працівниками спортивного
            комплексу та їхніми даними.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() =>
            setTypeDialogOpen(true)
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
          Додати працівника
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
      ) : sortedEmployees.length === 0 ? (
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
            Працівників ще немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Додайте першого працівника
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
                  "minmax(240px, 1.5fr) minmax(150px, 0.8fr) minmax(170px, 0.9fr) minmax(130px, 0.7fr) 48px",

                alignItems: "center",

                minHeight: 52,
                px: 2.5,

                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <TableHeaderText>
                Працівник
              </TableHeaderText>

              <TableHeaderText>
                Роль
              </TableHeaderText>

              <TableHeaderText>
                Телефон
              </TableHeaderText>

              <TableHeaderText>
                Статус
              </TableHeaderText>

              <Box />
            </Box>

            {/* TABLE ROWS */}

            {sortedEmployees.map(
              (employee, index) => (
                <Box
                  key={employee.userId}
                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(240px, 1.5fr) minmax(150px, 0.8fr) minmax(170px, 0.9fr) minmax(130px, 0.7fr) 48px",

                    alignItems: "center",

                    minHeight: 76,
                    px: 2.5,

                    borderBottom:
                      index !==
                      sortedEmployees.length - 1
                        ? "1px solid"
                        : "none",

                    borderColor: "divider",

                    opacity: employee.status
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
                  {/* EMPLOYEE */}

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
                          employee.role === "ADMIN"
                            ? "rgba(47,140,255,0.16)"
                            : "rgba(255,255,255,0.08)",

                        color:
                          employee.role === "ADMIN"
                            ? "primary.main"
                            : "text.primary",

                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {getInitials(employee)}
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
                        {employee.firstName}{" "}
                        {employee.lastName}
                      </Typography>

                      {employee.role ===
                        "TRAINER" &&
                        employee.specialization && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.25,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              employee.specialization
                            }
                          </Typography>
                        )}
                    </Box>
                  </Stack>

                  {/* ROLE */}

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    {employee.role ===
                    "ADMIN" ? (
                      <AdminPanelSettingsOutlinedIcon
                        sx={{
                          fontSize: 19,
                          color:
                            "primary.main",
                        }}
                      />
                    ) : (
                      <FitnessCenterOutlinedIcon
                        sx={{
                          fontSize: 19,
                          color:
                            "text.secondary",
                        }}
                      />
                    )}

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {employee.role ===
                      "ADMIN"
                        ? "Адміністратор"
                        : "Тренер"}
                    </Typography>
                  </Stack>

                  {/* PHONE */}

                  <Typography
                    variant="body2"
                    color={
                      employee.phone
                        ? "text.primary"
                        : "text.secondary"
                    }
                  >
                    {employee.phone || "—"}
                  </Typography>

                  {/* STATUS */}

                  <EmployeeStatusChip
                    active={employee.status}
                  />

                  {/* ACTIONS */}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {!(
                      user?.userId != null &&
                      String(employee.userId) ===
                        String(user.userId)
                    ) && (
                      <IconButton
                        size="small"
                        onClick={(event) =>
                          handleOpenMenu(
                            event,
                            employee
                          )
                        }
                        sx={{
                          color:
                            "text.secondary",
                        }}
                        aria-label="Дії з працівником"
                      >
                        <MoreVertRoundedIcon />
                      </IconButton>
                    )}
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
            {sortedEmployees.map(
              (employee) => (
                <EmployeeMobileCard
                  key={employee.userId}
                  employee={employee}
                  currentUserId={user?.userId}
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

      <EmployeeActionsMenu
        anchorEl={menuAnchor}
        employee={selectedEmployee}
        loading={actionLoading}
        onClose={handleCloseMenu}
        onEdit={() =>
          setEditDialogOpen(true)
        }
        onActivate={
          handleActivateEmployee
        }
        onDeactivate={(employee) =>
          setStatusEmployee(employee)
        }
        onDelete={(employee) =>
          setDeleteEmployee(employee)
        }
      />

      {/* DIALOGS */}

      <DeactivateEmployeeDialog
        open={statusEmployee !== null}
        employee={statusEmployee}
        loading={actionLoading}
        onClose={() =>
          setStatusEmployee(null)
        }
        onConfirm={
          handleConfirmDeactivate
        }
      />

      <DeleteEmployeeDialog
        open={deleteEmployee !== null}
        employee={deleteEmployee}
        loading={actionLoading}
        onClose={() =>
          setDeleteEmployee(null)
        }
        onConfirm={handleConfirmDelete}
      />

      <EmployeeTypeDialog
        open={typeDialogOpen}
        onClose={() =>
          setTypeDialogOpen(false)
        }
        onSelectAdmin={() =>
          handleSelectEmployeeType(
            "ADMIN"
          )
        }
        onSelectTrainer={() =>
          handleSelectEmployeeType(
            "TRAINER"
          )
        }
      />

      <CreateEmployeeDialog
        open={createDialogOpen}
        type={selectedEmployeeType}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedEmployeeType(null);
        }}
        onBack={() => {
          setCreateDialogOpen(false);
          setSelectedEmployeeType(null);
          setTypeDialogOpen(true);
        }}
        onCreated={
          handleEmployeeCreated
        }
      />

      <EditEmployeeDialog
        open={editDialogOpen}
        userId={
          selectedEmployee?.userId ??
          null
        }
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onUpdated={async () => {
          setEditDialogOpen(false);
          setSelectedEmployee(null);

          await loadEmployees();
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

function EmployeeStatusChip({
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