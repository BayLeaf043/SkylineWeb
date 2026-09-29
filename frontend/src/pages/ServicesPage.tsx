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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import ServiceDialog from "../components/service/ServiceDialog";
import DeactivateServiceDialog from "../components/service/DeactivateServiceDialog";
import DeleteServiceDialog from "../components/service/DeleteServiceDialog";
import ServiceActionsMenu from "../components/service/ServiceActionsMenu";
import ServiceMobileCard from "../components/service/ServiceMobileCard";

import { serviceService } from "../services/serviceService";
import type { Service } from "../types/service";

export default function ServicesPage() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [
    selectedDirectionId,
    setSelectedDirectionId,
  ] = useState<number | "all">("all");

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<number | "all">("all");

  const [
    serviceDialogOpen,
    setServiceDialogOpen,
  ] = useState(false);

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [
    selectedService,
    setSelectedService,
  ] = useState<Service | null>(null);

  const [
    statusService,
    setStatusService,
  ] = useState<Service | null>(null);

  const [
    deleteService,
    setDeleteService,
  ] = useState<Service | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await serviceService.getAll();

      setServices(data);
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося завантажити список послуг"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  /* SORTING */

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      const directionCompare =
        a.directionTitle.localeCompare(
          b.directionTitle,
          "uk"
        );

      if (directionCompare !== 0) {
        return directionCompare;
      }

      const categoryCompare =
        a.categoryTitle.localeCompare(
          b.categoryTitle,
          "uk"
        );

      if (categoryCompare !== 0) {
        return categoryCompare;
      }

      return a.title.localeCompare(
        b.title,
        "uk"
      );
    });
  }, [services]);

  /* FILTER DIRECTIONS */

  const serviceDirections = useMemo(() => {
    return Array.from(
      new Map(
        services.map((service) => [
          service.directionId,
          {
            directionId:
              service.directionId,
            title:
              service.directionTitle,
          },
        ])
      ).values()
    ).sort((a, b) =>
      a.title.localeCompare(
        b.title,
        "uk"
      )
    );
  }, [services]);

  /* FILTER CATEGORIES */

  const serviceCategories = useMemo(() => {
    return Array.from(
      new Map(
        services.map((service) => [
          service.categoryId,
          {
            categoryId:
              service.categoryId,
            title:
              service.categoryTitle,
          },
        ])
      ).values()
    ).sort((a, b) =>
      a.title.localeCompare(
        b.title,
        "uk"
      )
    );
  }, [services]);

  /* FILTERED SERVICES */

  const filteredServices = useMemo(() => {
    return sortedServices.filter(
      (service) => {
        const matchesDirection =
          selectedDirectionId === "all" ||
          service.directionId ===
            selectedDirectionId;

        const matchesCategory =
          selectedCategoryId === "all" ||
          service.categoryId ===
            selectedCategoryId;

        return (
          matchesDirection &&
          matchesCategory
        );
      }
    );
  }, [
    sortedServices,
    selectedDirectionId,
    selectedCategoryId,
  ]);

  /* ADD */

  const handleAddService = () => {
    setSelectedService(null);
    setServiceDialogOpen(true);
  };

  /* ACTION MENU */

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    service: Service
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedService(service);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  /* EDIT */

  const handleEditService = () => {
    if (!selectedService) {
      return;
    }

    setServiceDialogOpen(true);
  };

  /* SAVE */

  const handleServiceSaved = (
    savedService: Service
  ) => {
    setServices((currentServices) => {
      const exists =
        currentServices.some(
          (service) =>
            service.serviceId ===
            savedService.serviceId
        );

      if (exists) {
        return currentServices.map(
          (service) =>
            service.serviceId ===
            savedService.serviceId
              ? savedService
              : service
        );
      }

      return [
        ...currentServices,
        savedService,
      ];
    });

    setServiceDialogOpen(false);
    setSelectedService(null);
  };

  const handleCloseServiceDialog =
    () => {
      setServiceDialogOpen(false);
      setSelectedService(null);
    };

  /* ACTIVATE */

  const handleActivateService = async (
    service: Service
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await serviceService.updateServiceStatus(
        service.serviceId,
        {
          status: true,
        }
      );

      setSelectedService(null);

      await loadServices();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати послугу"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* DEACTIVATE */

  const handleConfirmDeactivate =
    async () => {
      if (!statusService) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await serviceService.updateServiceStatus(
          statusService.serviceId,
          {
            status: false,
          }
        );

        setStatusService(null);
        setSelectedService(null);

        await loadServices();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося деактивувати послугу"
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* DELETE */

  const handleConfirmDelete =
    async () => {
      if (!deleteService) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await serviceService.deleteService(
          deleteService.serviceId
        );

        setDeleteService(null);
        setSelectedService(null);

        await loadServices();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося видалити послугу"
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
            Послуги
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Керуйте послугами та
            абонементами вашого спортивного
            комплексу.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddService}
          sx={{
            px: 2.5,
            flexShrink: 0,

            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          Додати послугу
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

      {/* FILTERS */}

      {!loading &&
        services.length > 0 && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              mb: 2,
            }}
          >
            {/* DIRECTION */}

            <FormControl
              size="small"
              sx={{
                width: {
                  xs: "100%",
                  sm: 260,
                },
              }}
            >
              <InputLabel>
                Напрямок
              </InputLabel>

              <Select
                value={selectedDirectionId}
                label="Напрямок"
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setSelectedDirectionId(
                    value === "all"
                      ? "all"
                      : Number(value)
                  );
                }}
              >
                <MenuItem value="all">
                  Усі напрямки
                </MenuItem>

                {serviceDirections.map(
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
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            {/* CATEGORY */}

            <FormControl
              size="small"
              sx={{
                width: {
                  xs: "100%",
                  sm: 260,
                },
              }}
            >
              <InputLabel>
                Категорія
              </InputLabel>

              <Select
                value={selectedCategoryId}
                label="Категорія"
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setSelectedCategoryId(
                    value === "all"
                      ? "all"
                      : Number(value)
                  );
                }}
              >
                <MenuItem value="all">
                  Усі категорії
                </MenuItem>

                {serviceCategories.map(
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
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Stack>
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
      ) : services.length === 0 ? (
        /* NO SERVICES */

        <Paper
          sx={{
            py: 8,
            px: 3,
            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <FitnessCenterOutlinedIcon
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
            Послуг ще немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Додайте першу послугу вашого
            спортивного комплексу.
          </Typography>
        </Paper>
      ) : filteredServices.length ===
        0 ? (
        /* NO FILTERED SERVICES */

        <Paper
          sx={{
            py: 7,
            px: 3,
            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <FitnessCenterOutlinedIcon
            sx={{
              fontSize: 40,
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
            Послуг не знайдено
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Змініть параметри фільтрації або
            додайте нову послугу.
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
                  "minmax(210px, 1.6fr) minmax(120px, 0.85fr) minmax(120px, 0.85fr) minmax(100px, 0.7fr) minmax(75px, 0.5fr) minmax(95px, 0.65fr) minmax(105px, 0.7fr) 48px",

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
                Напрямок
              </TableHeaderText>

              <TableHeaderText>
                Категорія
              </TableHeaderText>

              <TableHeaderText>
                Вартість
              </TableHeaderText>

              <TableHeaderText>
                Заняття
              </TableHeaderText>

              <TableHeaderText>
                Термін дії
              </TableHeaderText>

              <TableHeaderText>
                Статус
              </TableHeaderText>

              <Box />
            </Box>

            {/* TABLE ROWS */}

            {filteredServices.map(
              (service, index) => (
                <Box
                  key={service.serviceId}
                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(210px, 1.6fr) minmax(120px, 0.85fr) minmax(120px, 0.85fr) minmax(100px, 0.7fr) minmax(75px, 0.5fr) minmax(95px, 0.65fr) minmax(105px, 0.7fr) 48px",

                    alignItems: "center",

                    minHeight: 76,
                    px: 2.5,

                    borderBottom:
                      index !==
                      filteredServices.length -
                        1
                        ? "1px solid"
                        : "none",

                    borderColor: "divider",

                    opacity:
                      service.status
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

                  <Box
                    sx={{
                      minWidth: 0,
                      pr: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {service.title}
                    </Typography>

                    {service.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.35,
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          service.description
                        }
                      </Typography>
                    )}
                  </Box>

                  {/* DIRECTION */}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      pr: 2,
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {
                      service.directionTitle
                    }
                  </Typography>

                  {/* CATEGORY */}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      pr: 2,
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {
                      service.categoryTitle
                    }
                  </Typography>

                  {/* PRICE */}

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Number(
                      service.price
                    ).toLocaleString(
                      "uk-UA"
                    )}{" "}
                    грн
                  </Typography>

                  {/* SESSIONS */}

                  <Typography variant="body2">
                    {
                      service.sessionsCount
                    }
                  </Typography>

                  {/* VALIDITY */}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {
                      service.validityDays
                    }{" "}
                    дн.
                  </Typography>

                  {/* STATUS */}

                  <ServiceStatusChip
                    active={
                      service.status
                    }
                  />

                  {/* ACTIONS */}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(event) =>
                        handleOpenMenu(
                          event,
                          service
                        )
                      }
                      sx={{
                        color:
                          "text.secondary",
                      }}
                      aria-label="Дії з послугою"
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
            {filteredServices.map(
              (service) => (
                <ServiceMobileCard
                  key={
                    service.serviceId
                  }
                  service={service}
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

      <ServiceActionsMenu
        anchorEl={menuAnchor}
        service={selectedService}
        loading={actionLoading}
        onClose={handleCloseMenu}
        onEdit={handleEditService}
        onActivate={
          handleActivateService
        }
        onDeactivate={(service) =>
          setStatusService(service)
        }
        onDelete={(service) =>
          setDeleteService(service)
        }
      />

      {/* DIALOGS */}

      <DeactivateServiceDialog
        open={statusService !== null}
        service={statusService}
        loading={actionLoading}
        onClose={() =>
          setStatusService(null)
        }
        onConfirm={
          handleConfirmDeactivate
        }
      />

      <DeleteServiceDialog
        open={deleteService !== null}
        service={deleteService}
        loading={actionLoading}
        onClose={() =>
          setDeleteService(null)
        }
        onConfirm={handleConfirmDelete}
      />

      <ServiceDialog
        open={serviceDialogOpen}
        service={selectedService}
        onClose={
          handleCloseServiceDialog
        }
        onSaved={handleServiceSaved}
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

function ServiceStatusChip({
  active,
}: {
  active: boolean;
}) {
  return (
    <Chip
      label={
        active
          ? "Активна"
          : "Неактивна"
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