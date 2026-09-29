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
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import CreatePurchaseDialog from "../components/purchase/CreatePurchaseDialog";
import RefundPurchaseDialog from "../components/purchase/RefundPurchaseDialog";
import PurchaseActionsMenu from "../components/purchase/PurchaseActionsMenu";
import PurchaseMobileCard from "../components/purchase/PurchaseMobileCard";

import { purchaseService } from "../services/purchaseService";

import type {
  PurchaseResponse,
  PurchaseType,
} from "../types/purchase";

type PurchaseFilter =
  | "all"
  | PurchaseType;

export default function PurchasesPage() {
  const [purchases, setPurchases] =
    useState<PurchaseResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [
    selectedType,
    setSelectedType,
  ] = useState<PurchaseFilter>("all");

  /*
   * CREATE
   */

  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);

  /*
   * ACTION MENU
   */

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [
    selectedPurchase,
    setSelectedPurchase,
  ] =
    useState<PurchaseResponse | null>(
      null
    );

  /*
   * REFUND
   */

  const [
    refundPurchase,
    setRefundPurchase,
  ] =
    useState<PurchaseResponse | null>(
      null
    );

  /*
   * LOAD
   */

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await purchaseService.getAll();

      setPurchases(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити список покупок"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  /*
   * SORTING
   *
   * Backend уже повертає покупки
   * від нових до старих.
   *
   * Додатково сортуємо на frontend,
   * щоб порядок залишався стабільним
   * після локальних оновлень.
   */

  const sortedPurchases =
    useMemo(() => {
      return [...purchases].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    }, [purchases]);

  /*
   * FILTER
   */

  const filteredPurchases =
    useMemo(() => {
      if (selectedType === "all") {
        return sortedPurchases;
      }

      return sortedPurchases.filter(
        (purchase) =>
          purchase.type ===
          selectedType
      );
    }, [
      sortedPurchases,
      selectedType,
    ]);

  /*
   * CREATE
   */

  const handlePurchaseCreated =
    async () => {
      setCreateDialogOpen(false);

      await loadPurchases();
    };

  /*
   * ACTION MENU
   */

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    purchase: PurchaseResponse
  ) => {
    /*
     * Додатковий frontend-захист.
     *
     * Дії доступні тільки для
     * завершеної активної покупки.
     */

    if (
      purchase.type !== "COMPLETED" ||
      !purchase.status
    ) {
      return;
    }

    setMenuAnchor(
      event.currentTarget
    );

    setSelectedPurchase(purchase);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  /*
   * REFUND
   */

  const handleOpenRefund = (
    purchase: PurchaseResponse
  ) => {
    setRefundPurchase(purchase);
  };

  const handleRefunded =
    async () => {
      setRefundPurchase(null);
      setSelectedPurchase(null);

      await loadPurchases();
    };

  /*
   * CLOSE REFUND
   */

  const handleCloseRefund = () => {
    if (actionLoading) {
      return;
    }

    setRefundPurchase(null);
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
            Продажі
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 650,
            }}
          >
            Оформлюйте послуги
            клієнтам та переглядайте
            історію продажів спортивного
            комплексу.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            <AddRoundedIcon />
          }
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
          Оформити покупку
        </Button>
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
        purchases.length > 0 && (
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
                Статус покупки
              </InputLabel>

              <Select
                value={selectedType}
                label="Статус покупки"
                onChange={(event) =>
                  setSelectedType(
                    event.target
                      .value as PurchaseFilter
                  )
                }
              >
                <MenuItem value="all">
                  Усі покупки
                </MenuItem>

                <MenuItem value="COMPLETED">
                  Оплачено
                </MenuItem>

                <MenuItem value="REFUNDED">
                  Повернено
                </MenuItem>

                <MenuItem value="CANCELLED">
                  Скасовано
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
      ) : purchases.length === 0 ? (
        /*
         * NO PURCHASES
         */

        <Paper
          sx={{
            py: 8,
            px: 3,

            borderRadius: 1.5,
            textAlign: "center",
          }}
        >
          <ShoppingBagOutlinedIcon
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
            Продажів ще немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Оформіть першу послугу
            клієнту спортивного
            комплексу.
          </Typography>
        </Paper>
      ) : filteredPurchases.length ===
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
          <ShoppingBagOutlinedIcon
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
            Покупок з таким статусом
            немає
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Оберіть інший статус для
            перегляду історії продажів.
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
                  "minmax(190px, 1.4fr) minmax(180px, 1.3fr) minmax(120px, 0.8fr) minmax(115px, 0.75fr) minmax(145px, 0.9fr) 48px",

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
                Сума
              </TableHeaderText>

              <TableHeaderText>
                Статус
              </TableHeaderText>

              <TableHeaderText>
                Дата
              </TableHeaderText>

              <Box />
            </Box>

            {/* TABLE ROWS */}

            {filteredPurchases.map(
              (purchase, index) => {
                const canRefund =
                  purchase.type ===
                    "COMPLETED" &&
                  purchase.status;

                return (
                  <Box
                    key={
                      purchase.purchaseId
                    }
                    sx={{
                      display: "grid",

                      gridTemplateColumns:
                        "minmax(190px, 1.4fr) minmax(180px, 1.3fr) minmax(120px, 0.8fr) minmax(115px, 0.75fr) minmax(145px, 0.9fr) 48px",

                      alignItems:
                        "center",

                      minHeight: 76,
                      px: 2.5,

                      borderBottom:
                        index !==
                        filteredPurchases.length -
                          1
                          ? "1px solid"
                          : "none",

                      borderColor:
                        "divider",

                      opacity:
                        purchase.status
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
                          purchase.clientFirstName
                        }{" "}
                        {
                          purchase.clientLastName
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.35,
                        }}
                      >
                        Покупка #
                        {
                          purchase.purchaseId
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
                          purchase.serviceTitle
                        }
                      </Typography>

                      {purchase.comment && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              "block",

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
                            purchase.comment
                          }
                        </Typography>
                      )}
                    </Box>

                    {/* AMOUNT */}

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,

                        whiteSpace:
                          "nowrap",

                        color:
                          purchase.type ===
                          "COMPLETED"
                            ? "#5bd68a"
                            : "text.secondary",
                      }}
                    >
                      {formatMoney(
                        purchase.amount
                      )}{" "}
                      грн
                    </Typography>

                    {/* STATUS */}

                    <PurchaseStatusChip
                      type={
                        purchase.type
                      }
                    />

                    {/* DATE */}

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatDate(
                          purchase.createdAt
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatTime(
                          purchase.createdAt
                        )}
                      </Typography>
                    </Box>

                    {/* ACTIONS */}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "center",
                      }}
                    >
                      {canRefund && (
                        <IconButton
                          size="small"
                          onClick={(
                            event
                          ) =>
                            handleOpenMenu(
                              event,
                              purchase
                            )
                          }
                          sx={{
                            color:
                              "text.secondary",
                          }}
                          aria-label="Дії з покупкою"
                        >
                          <MoreVertRoundedIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                );
              }
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
            {filteredPurchases.map(
              (purchase) => (
                <PurchaseMobileCard
                  key={
                    purchase.purchaseId
                  }
                  purchase={purchase}
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

      <PurchaseActionsMenu
        anchorEl={menuAnchor}
        purchase={selectedPurchase}
        loading={actionLoading}
        onClose={handleCloseMenu}
        onRefund={
          handleOpenRefund
        }
      />

      {/* DIALOGS */}

      <CreatePurchaseDialog
        open={createDialogOpen}
        onClose={() =>
          setCreateDialogOpen(false)
        }
        onCreated={
          handlePurchaseCreated
        }
      />

      <RefundPurchaseDialog
        open={refundPurchase !== null}
        purchase={refundPurchase}
        onClose={handleCloseRefund}
        onRefunded={
          handleRefunded
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
 * PURCHASE STATUS
 */

function PurchaseStatusChip({
  type,
}: {
  type: PurchaseType;
}) {
  const config =
    getPurchaseStatus(type);

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

function getPurchaseStatus(
  type: PurchaseType
) {
  switch (type) {
    case "COMPLETED":
      return {
        label: "Оплачено",
        color: "#5bd68a",
        bgcolor:
          "rgba(46,204,113,0.12)",
      };

    case "REFUNDED":
      return {
        label: "Повернено",
        color: "#ffb74d",
        bgcolor:
          "rgba(255,167,38,0.12)",
      };

    case "CANCELLED":
      return {
        label: "Скасовано",
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
 * MONEY
 */

function formatMoney(
  value: number
): string {
  return new Intl.NumberFormat(
    "uk-UA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
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
  ).format(new Date(value));
}

function formatTime(
  value: string
): string {
  return new Intl.DateTimeFormat(
    "uk-UA",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}