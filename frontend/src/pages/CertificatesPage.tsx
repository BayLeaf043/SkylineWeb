import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
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

import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import EditCertificateValidityDialog from "../components/certificate/EditCertificateValidityDialog";
import DeleteCertificateDialog from "../components/certificate/DeleteCertificateDialog";
import CertificateActionsMenu from "../components/certificate/CertificateActionsMenu";
import CertificateMobileCard from "../components/certificate/CertificateMobileCard";

import { certificateService } from "../services/certificateService";

import type {
  CertificateResponse,
  CertificateType,
} from "../types/certificate";

type CertificateFilter =
  | "all"
  | CertificateType;

export default function CertificatesPage() {
  const [certificates, setCertificates] =
    useState<CertificateResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [
    selectedType,
    setSelectedType,
  ] =
    useState<CertificateFilter>("all");

  /*
   * ACTION MENU
   */

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [
    selectedCertificate,
    setSelectedCertificate,
  ] =
    useState<CertificateResponse | null>(
      null
    );

  /*
   * EDIT VALIDITY
   */

  const [
    editCertificateId,
    setEditCertificateId,
  ] =
    useState<number | null>(null);

  /*
   * DELETE
   */

  const [
    deleteCertificate,
    setDeleteCertificate,
  ] =
    useState<CertificateResponse | null>(
      null
    );

  /*
   * LOAD
   */

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await certificateService.getAll();

      setCertificates(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити список сертифікатів"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  /*
   * SORTING
   *
   * Backend уже повертає сертифікати
   * від нових до старих.
   *
   * Додатково сортуємо на frontend,
   * щоб порядок залишався стабільним.
   */

  const sortedCertificates =
    useMemo(() => {
      return [...certificates].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    }, [certificates]);

  /*
   * FILTER
   */

  const filteredCertificates =
    useMemo(() => {
      if (selectedType === "all") {
        return sortedCertificates;
      }

      return sortedCertificates.filter(
        (certificate) =>
          certificate.type ===
          selectedType
      );
    }, [
      sortedCertificates,
      selectedType,
    ]);

  /*
   * ACTION MENU
   */

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    certificate: CertificateResponse
  ) => {
    setMenuAnchor(
      event.currentTarget
    );

    setSelectedCertificate(
      certificate
    );
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  /*
   * EDIT
   */

  const handleOpenEdit = () => {
    if (!selectedCertificate) {
      return;
    }

    setEditCertificateId(
      selectedCertificate.certificateId
    );
  };

  const handleUpdated = async () => {
    setEditCertificateId(null);
    setSelectedCertificate(null);

    await loadCertificates();
  };

  /*
   * DELETE
   */

  const handleOpenDelete = (
    certificate: CertificateResponse
  ) => {
    setDeleteCertificate(
      certificate
    );
  };

  const handleConfirmDelete =
    async () => {
      if (!deleteCertificate) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await certificateService
          .deleteCertificate(
            deleteCertificate.certificateId
          );

        setDeleteCertificate(null);
        setSelectedCertificate(null);

        await loadCertificates();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не вдалося видалити сертифікат"
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * CLOSE DELETE
   */

  const handleCloseDelete = () => {
    if (actionLoading) {
      return;
    }

    setDeleteCertificate(null);
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

          justifyContent:
            "space-between",

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
            Сертифікати
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Переглядайте сертифікати
            клієнтів, залишок занять та
            керуйте терміном їх дії.
          </Typography>
        </Box>
      </Stack>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* FILTERS */}

      {!loading &&
        certificates.length > 0 && (
          <Box
            sx={{
              mb: 2,

              display: "flex",
              alignItems: "center",
            }}
          >
            <FormControl
              size="small"
              sx={{
                width: {
                  xs: "100%",
                  sm: 240,
                },
              }}
            >
              <InputLabel>
                Статус сертифіката
              </InputLabel>

              <Select
                value={selectedType}
                label="Статус сертифіката"
                onChange={(event) =>
                  setSelectedType(
                    event.target
                      .value as CertificateFilter
                  )
                }
              >
                <MenuItem value="all">
                  Усі сертифікати
                </MenuItem>

                <MenuItem value="ACTIVE">
                  Активні
                </MenuItem>

                <MenuItem value="USED">
                  Використані
                </MenuItem>

                <MenuItem value="EXPIRED">
                  Прострочені
                </MenuItem>

                <MenuItem value="CANCELLED">
                  Скасовані
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
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
      ) : certificates.length === 0 ? (
        /*
         * NO CERTIFICATES
         */

        <Paper
          sx={{
            py: 8,
            px: 3,

            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <CardMembershipOutlinedIcon
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
            Сертифікатів ще немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Сертифікати з'являться
            автоматично після оформлення
            послуг клієнтам.
          </Typography>
        </Paper>
      ) : filteredCertificates.length ===
        0 ? (
        /*
         * NO RESULTS
         */

        <Paper
          sx={{
            py: 7,
            px: 3,

            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <CardMembershipOutlinedIcon
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
            Сертифікатів з таким статусом
            немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Оберіть інший статус для
            перегляду сертифікатів.
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
                  "minmax(180px, 1.3fr) minmax(180px, 1.3fr) minmax(120px, 0.8fr) minmax(190px, 1.15fr) minmax(130px, 0.85fr) 48px",

                alignItems: "center",

                minHeight: 52,
                px: 2.5,

                borderBottom:
                  "1px solid",
                borderColor:
                  "divider",
              }}
            >
              <TableHeaderText>
                Клієнт
              </TableHeaderText>

              <TableHeaderText>
                Послуга
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

            {filteredCertificates.map(
              (certificate, index) => (
                <Box
                  key={
                    certificate.certificateId
                  }
                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(180px, 1.3fr) minmax(180px, 1.3fr) minmax(120px, 0.8fr) minmax(190px, 1.15fr) minmax(130px, 0.85fr) 48px",

                    alignItems:
                      "center",

                    minHeight: 76,
                    px: 2.5,

                    borderBottom:
                      index !==
                      filteredCertificates.length -
                        1
                        ? "1px solid"
                        : "none",

                    borderColor:
                      "divider",

                    opacity:
                      certificate.status
                        ? 1
                        : 0.65,

                    transition:
                      "background-color 0.15s ease",

                    "&:hover": {
                      bgcolor:
                        "rgba(255,255,255,0.025)",
                    },
                  }}
                >
                  {/* CLIENT */}

                  <Box
                    sx={{
                      minWidth: 0,
                      pr: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,

                        overflow:
                          "hidden",

                        textOverflow:
                          "ellipsis",

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {
                        certificate.clientFirstName
                      }{" "}
                      {
                        certificate.clientLastName
                      }
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.35,
                      }}
                    >
                      Сертифікат #
                      {
                        certificate.certificateId
                      }
                    </Typography>
                  </Box>

                  {/* SERVICE */}

                  <Box
                    sx={{
                      minWidth: 0,
                      pr: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,

                        overflow:
                          "hidden",

                        textOverflow:
                          "ellipsis",

                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {
                        certificate.serviceTitle
                      }
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 0.35,
                      }}
                    >
                      Покупка #
                      {
                        certificate.purchaseId
                      }
                    </Typography>
                  </Box>

                  {/* SESSIONS */}

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {
                        certificate.remainingSessions
                      }{" "}
                      з{" "}
                      {
                        certificate.totalSessions
                      }
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      використано{" "}
                      {
                        certificate.usedSessions
                      }
                    </Typography>
                  </Box>

                  {/* VALIDITY */}

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {formatDate(
                        certificate.validFrom
                      )}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      до{" "}
                      {formatDate(
                        certificate.validTo
                      )}
                    </Typography>
                  </Box>

                  {/* STATUS */}

                  <CertificateStatusChip
                    type={
                      certificate.type
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
                          certificate
                        )
                      }
                      sx={{
                        color:
                          "text.secondary",
                      }}
                      aria-label="Дії з сертифікатом"
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
            {filteredCertificates.map(
              (certificate) => (
                <CertificateMobileCard
                  key={
                    certificate.certificateId
                  }
                  certificate={
                    certificate
                  }
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

      <CertificateActionsMenu
        anchorEl={menuAnchor}
        certificate={
          selectedCertificate
        }
        loading={actionLoading}
        onClose={handleCloseMenu}
        onEditValidity={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* DIALOGS */}

      <EditCertificateValidityDialog
        open={
          editCertificateId !== null
        }
        certificateId={
          editCertificateId
        }
        onClose={() =>
          setEditCertificateId(null)
        }
        onUpdated={handleUpdated}
      />

      <DeleteCertificateDialog
        open={
          deleteCertificate !== null
        }
        certificate={
          deleteCertificate
        }
        loading={actionLoading}
        onClose={
          handleCloseDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />
    </Box>
  );
}

/*
 * TABLE HEADER
 */

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

        textTransform:
          "uppercase",

        letterSpacing:
          "0.05em",
      }}
    >
      {children}
    </Typography>
  );
}

/*
 * CERTIFICATE STATUS
 */

function CertificateStatusChip({
  type,
}: {
  type: CertificateType;
}) {
  const config =
    getCertificateStatus(type);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        justifySelf: "start",

        bgcolor:
          config.bgcolor,

        color: config.color,

        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}

function getCertificateStatus(
  type: CertificateType
) {
  switch (type) {
    case "ACTIVE":
      return {
        label: "Активний",
        color: "#5bd68a",
        bgcolor:
          "rgba(46,204,113,0.12)",
      };

    case "USED":
      return {
        label: "Використаний",
        color: "#64b5f6",
        bgcolor:
          "rgba(47,140,255,0.12)",
      };

    case "EXPIRED":
      return {
        label: "Прострочений",
        color: "#ffb74d",
        bgcolor:
          "rgba(255,167,38,0.12)",
      };

    case "CANCELLED":
      return {
        label: "Скасований",
        color: "text.secondary",
        bgcolor:
          "rgba(255,255,255,0.06)",
      };

    default:
      return {
        label: type,
        color: "text.secondary",
        bgcolor:
          "rgba(255,255,255,0.06)",
      };
  }
}

/*
 * DATE
 */

function formatDate(
  value: string
): string {
  return new Intl.DateTimeFormat(
    "uk-UA",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(`${value}T00:00:00`)
  );
}