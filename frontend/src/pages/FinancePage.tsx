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
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import AccountCard from "../components/finance/AccountCard";
import AccountActionsMenu from "../components/finance/AccountActionsMenu";
import CreateAccountDialog from "../components/finance/CreateAccountDialog";
import EditAccountDialog from "../components/finance/EditAccountDialog";
import DeactivateAccountDialog from "../components/finance/DeactivateAccountDialog";
import DeleteAccountDialog from "../components/finance/DeleteAccountDialog";

import TransactionMobileCard from "../components/transaction/TransactionMobileCard";
import TransactionActionsMenu from "../components/transaction/TransactionActionsMenu";
import CreateTransactionDialog from "../components/transaction/CreateTransactionDialog";
import EditTransactionDialog from "../components/transaction/EditTransactionDialog";
import DeleteTransactionDialog from "../components/transaction/DeleteTransactionDialog";
import CreateTransferDialog from "../components/transaction/CreateTransferDialog";

import { accountService } from "../services/accountService";
import { financialTransactionService } from "../services/financialTransactionService";
import type { FinancialTransactionResponse, FinancialTransactionType } from "../types/financialTransaction";

import type { AccountResponse } from "../types/account";

export default function FinancePage() {

  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [editAccountId, setEditAccountId] = useState<number | null>(null);
  const [menuAnchor, setMenuAnchor] =useState<HTMLElement | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);
  const [statusAccount, setStatusAccount] = useState<AccountResponse | null>(null);
  const [deleteAccount,setDeleteAccount] = useState<AccountResponse | null>(null);

  /* LOAD ACCOUNTS */

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await accountService.getAll();

      setAccounts(data);
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося завантажити рахунки"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadAccounts();
  loadTransactions();
}, []);

  /* SORTING */

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      return a.title.localeCompare(
        b.title,
        "uk"
      );
    });
  }, [accounts]);

  /* TOTAL BALANCE */

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (sum, account) =>
        sum + Number(account.balance),
      0
    );
  }, [accounts]);

  /* ACTION MENU */

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    account: AccountResponse
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  /* EDIT */

  const handleEditAccount = () => {
    if (!selectedAccount) {
      return;
    }

    setEditAccountId(
      selectedAccount.accountId
    );
  };

  /* CREATED */

  const handleAccountCreated = async () => {
    setCreateAccountDialogOpen(false);

    await loadAccounts();
  };

  /* UPDATED */

  const handleAccountUpdated = async () => {
    setEditAccountId(null);
    setSelectedAccount(null);

    await loadAccounts();
  };

  /* ACTIVATE */

  const handleActivateAccount = async (
    account: AccountResponse
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await accountService.updateAccountStatus(
        account.accountId,
        {
          status: true,
        }
      );

      setSelectedAccount(null);

      await loadAccounts();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати рахунок"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* DEACTIVATE */

  const handleConfirmDeactivate =
    async () => {
      if (!statusAccount) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await accountService.updateAccountStatus(
          statusAccount.accountId,
          {
            status: false,
          }
        );

        setStatusAccount(null);
        setSelectedAccount(null);

        await loadAccounts();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося деактивувати рахунок"
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* DELETE */

  const handleConfirmDelete =
    async () => {
      if (!deleteAccount) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await accountService.deleteAccount(
          deleteAccount.accountId
        );

        setDeleteAccount(null);
        setSelectedAccount(null);

        await loadAccounts();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося видалити рахунок"
        );
      } finally {
        setActionLoading(false);
      }
    };


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [transactions, setTransactions] = useState<FinancialTransactionResponse[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionActionLoading, setTransactionActionLoading] = useState(false);
  const [createTransactionDialogOpen, setCreateTransactionDialogOpen] = useState(false);
  const [createTransferDialogOpen, setCreateTransferDialogOpen] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<number | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<FinancialTransactionResponse | null>(null);
  const [transactionMenuAnchor, setTransactionMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransactionResponse | null>(null);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<FinancialTransactionType | "ALL">("ALL");

const loadTransactions = async () => {
  try {
    setTransactionsLoading(true);
    setError("");

    const data =
      await financialTransactionService.getAll();

    setTransactions(data);
  } catch (error: any) {
    setError(
      error?.message ||
        "Не вдалося завантажити фінансові операції"
    );
  } finally {
    setTransactionsLoading(false);
  }
};


const filteredTransactions = useMemo(() => {
  const search =
    transactionSearch
      .trim()
      .toLowerCase();

  return transactions.filter(
    (transaction) => {
      const matchesType =
        transactionTypeFilter === "ALL" ||
        transaction.type ===
          transactionTypeFilter;

      const matchesSearch =
        !search ||
        transaction.accountTitle
          .toLowerCase()
          .includes(search) ||
        transaction.comment
          ?.toLowerCase()
          .includes(search) ||
        String(transaction.transactionId)
          .includes(search);

      return matchesType && matchesSearch;
    }
  );
}, [
  transactions,
  transactionSearch,
  transactionTypeFilter,
]);

const canManageTransaction = (
  transaction: FinancialTransactionResponse
) => {
  return (
    (transaction.type === "INCOME" ||
      transaction.type === "EXPENSE") &&
    transaction.purchaseId === null &&
    transaction.transferId === null
  );
};

const handleOpenTransactionMenu = (
  event: React.MouseEvent<HTMLElement>,
  transaction: FinancialTransactionResponse
) => {
  if (!canManageTransaction(transaction)) {
    return;
  }

  setTransactionMenuAnchor(
    event.currentTarget
  );

  setSelectedTransaction(transaction);
};

const handleCloseTransactionMenu = () => {
  setTransactionMenuAnchor(null);
};

const handleEditTransaction = () => {
  if (!selectedTransaction) {
    return;
  }

  setEditTransactionId(
    selectedTransaction.transactionId
  );
};

const refreshFinanceData = async () => {
  await Promise.all([
    loadAccounts(),
    loadTransactions(),
  ]);
};

const handleTransactionCreated =
  async () => {
    setCreateTransactionDialogOpen(false);

    await refreshFinanceData();
  };

const handleTransferCreated =
  async () => {
    setCreateTransferDialogOpen(false);

    await refreshFinanceData();
  };

const handleTransactionUpdated =
  async () => {
    setEditTransactionId(null);
    setSelectedTransaction(null);

    await refreshFinanceData();
  };

  const handleConfirmDeleteTransaction =
  async () => {
    if (!deleteTransaction) {
      return;
    }

    try {
      setTransactionActionLoading(true);
      setError("");

      await financialTransactionService
        .deleteTransaction(
          deleteTransaction.transactionId
        );

      setDeleteTransaction(null);
      setSelectedTransaction(null);

      await refreshFinanceData();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося видалити фінансову операцію"
      );
    } finally {
      setTransactionActionLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* PAGE HEADER */}

      <Box sx={{ mb: 3 }}>
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
          Фінанси
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 650,
          }}
        >
          Керуйте рахунками та фінансовими
          операціями спортивного комплексу.
        </Typography>
      </Box>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* ACCOUNTS SECTION */}

      <Box>
        {/* SECTION HEADER */}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            mb: 2,
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
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Рахунки
            </Typography>

            {!loading &&
              accounts.length > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                  }}
                >
                  Загальний баланс:{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "text.primary",
                      fontWeight: 700,
                    }}
                  >
                    {totalBalance.toLocaleString(
                      "uk-UA",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                    грн
                  </Box>
                </Typography>
              )}
          </Box>

          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={() =>
              setCreateAccountDialogOpen(
                true
              )
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
            Додати рахунок
          </Button>
        </Stack>

        {/* ACCOUNTS CONTENT */}

        {loading ? (
          <Box
            sx={{
              minHeight: 180,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : accounts.length === 0 ? (
          <Paper
            sx={{
              py: 6,
              px: 3,
              borderRadius: 1.5,
              textAlign: "center",
            }}
          >
            <AccountBalanceWalletOutlinedIcon
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
              Рахунків ще немає
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Додайте перший рахунок для
              проведення фінансових операцій.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },

              gap: 2,
            }}
          >
            {sortedAccounts.map(
              (account) => (
                <AccountCard
                  key={
                    account.accountId
                  }
                  account={account}
                  onOpenMenu={
                    handleOpenMenu
                  }
                />
              )
            )}
          </Box>
        )}
      </Box>

      {/* TRANSACTIONS SECTION */}

<Box sx={{ mt: 5 }}>
  {/* HEADER */}

  <Stack
    direction={{
      xs: "column",
      md: "row",
    }}
    spacing={2}
    sx={{
      mb: 2,
      justifyContent: "space-between",

      alignItems: {
        xs: "stretch",
        md: "center",
      },
    }}
  >
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
        }}
      >
        Фінансові операції
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.35,
        }}
      >
        Історія доходів, витрат,
        повернень та переказів між
        рахунками.
      </Typography>
    </Box>

    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={1.25}
    >
      <Button
        variant="outlined"
        startIcon={
          <SwapHorizRoundedIcon />
        }
        onClick={() =>
          setCreateTransferDialogOpen(true)
        }
        sx={{
          whiteSpace: "nowrap",
        }}
      >
        Переказ
      </Button>

      <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={() =>
          setCreateTransactionDialogOpen(
            true
          )
        }
        sx={{
          whiteSpace: "nowrap",
        }}
      >
        Додати операцію
      </Button>
    </Stack>
  </Stack>

  {/* FILTERS */}

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
    <TextField
      size="small"
      placeholder="Пошук операцій..."
      value={transactionSearch}
      onChange={(event) =>
        setTransactionSearch(
          event.target.value
        )
      }
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon
                sx={{
                  color:
                    "text.secondary",
                }}
              />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        flex: 1,
        maxWidth: {
          sm: 420,
        },
      }}
    />

    <FormControl
      size="small"
      sx={{
        minWidth: {
          xs: "100%",
          sm: 210,
        },
      }}
    >
      <InputLabel>
        Тип операції
      </InputLabel>

      <Select
        value={transactionTypeFilter}
        label="Тип операції"
        onChange={(event) =>
          setTransactionTypeFilter(
            event.target.value as
              | FinancialTransactionType
              | "ALL"
          )
        }
      >
        <MenuItem value="ALL">
          Усі операції
        </MenuItem>

        <MenuItem value="INCOME">
          Надходження
        </MenuItem>

        <MenuItem value="EXPENSE">
          Витрати
        </MenuItem>

        <MenuItem value="REFUND">
          Повернення
        </MenuItem>

        <MenuItem value="TRANSFER_IN">
          Переказ — надходження
        </MenuItem>

        <MenuItem value="TRANSFER_OUT">
          Переказ — списання
        </MenuItem>

        <MenuItem value="OPENING_BALANCE">
          Початковий баланс
        </MenuItem>
      </Select>
    </FormControl>
  </Stack>

  {/* CONTENT */}

  {transactionsLoading ? (
    <Box
      sx={{
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  ) : filteredTransactions.length === 0 ? (
    <Paper
      sx={{
        py: 6,
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
        Фінансових операцій не знайдено
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {transactions.length === 0
          ? "Після проведення першої операції вона з'явиться тут."
          : "Спробуйте змінити параметри пошуку або фільтрації."}
      </Typography>
    </Paper>
  ) : isMobile ? (
    /* MOBILE */

    <Stack spacing={1.5}>
      {filteredTransactions.map(
        (transaction) => (
          <TransactionMobileCard
            key={
              transaction.transactionId
            }
            transaction={transaction}
            onOpenMenu={
              handleOpenTransactionMenu
            }
          />
        )
      )}
    </Stack>
  ) : (
    /* DESKTOP */

    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 1.5,
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Операція
            </TableCell>

            <TableCell>
              Рахунок
            </TableCell>

            <TableCell>
              Коментар
            </TableCell>

            <TableCell>
              Дата
            </TableCell>

            <TableCell align="right">
              Сума
            </TableCell>

            <TableCell
              align="right"
              sx={{
                width: 56,
              }}
            />
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredTransactions.map(
            (transaction) => {
              const info =
                getTransactionTypeInfo(
                  transaction.type
                );

              const canManage =
                canManageTransaction(
                  transaction
                );

              return (
                <TableRow
                  key={
                    transaction.transactionId
                  }
                  hover
                  sx={{
                    opacity:
                      transaction.status
                        ? 1
                        : 0.6,
                  }}
                >
                  <TableCell>
  <Stack
    direction="row"
    spacing={1.25}
    sx={{
      alignItems: "flex-start",
    }}
  >
    {/* ICON */}

    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: 1.25,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        bgcolor: info.backgroundColor,
        color: info.color,

        flexShrink: 0,
      }}
    >
      {info.icon}
    </Box>

    {/* TYPE + SOURCE */}

    <Box sx={{ minWidth: 0 }}>
      <Chip
        label={info.label}
        size="small"
        sx={{
          bgcolor: info.backgroundColor,
          color: info.color,

          fontWeight: 600,
          fontSize: 12,
        }}
      />

      {transaction.purchaseId !== null && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.6,
          }}
        >
          Покупка #{transaction.purchaseId}
        </Typography>
      )}

      {transaction.transferId !== null && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.6,
          }}
        >
          Переказ #{transaction.transferId}
        </Typography>
      )}
    </Box>
  </Stack>
</TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                      }}
                    >
                      {
                        transaction.accountTitle
                      }
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      color={
                        transaction.comment
                          ? "text.primary"
                          : "text.secondary"
                      }
                      sx={{
                        maxWidth: 280,
                      }}
                    >
                      {transaction.comment ||
                        "—"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {formatTransactionDate(
                        transaction.createdAt
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          info.color,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {info.sign}
                      {formatMoney(
                        transaction.amount
                      )}{" "}
                      грн
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    {canManage && (
                      <IconButton
                        size="small"
                        onClick={(event) =>
                          handleOpenTransactionMenu(
                            event,
                            transaction
                          )
                        }
                        sx={{
                          color:
                            "text.secondary",
                        }}
                        aria-label="Дії з фінансовою операцією"
                      >
                        <MoreVertRoundedIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</Box>

      {/* ACTION MENU */}

      <AccountActionsMenu
        anchorEl={menuAnchor}
        account={selectedAccount}
        loading={actionLoading}
        onClose={handleCloseMenu}
        onEdit={handleEditAccount}
        onActivate={handleActivateAccount}
        onDeactivate={(account) =>setStatusAccount(account)}
        onDelete={(account) =>setDeleteAccount(account)}
      />

      <TransactionActionsMenu
      anchorEl={transactionMenuAnchor}
      transaction={selectedTransaction}
      loading={transactionActionLoading}
      onClose={handleCloseTransactionMenu}
      onEdit={handleEditTransaction}
      onDelete={(transaction) => setDeleteTransaction(transaction)}
     />

      {/* DIALOGS */}

      <CreateAccountDialog
        open={
          createAccountDialogOpen
        }
        onClose={() =>
          setCreateAccountDialogOpen(
            false
          )
        }
        onCreated={
          handleAccountCreated
        }
      />

      <EditAccountDialog
        open={editAccountId !== null}
        accountId={editAccountId}
        onClose={() => {
          setEditAccountId(null);
          setSelectedAccount(null);
        }}
        onUpdated={
          handleAccountUpdated
        }
      />

      <DeactivateAccountDialog
        open={
          statusAccount !== null
        }
        account={statusAccount}
        loading={actionLoading}
        onClose={() =>
          setStatusAccount(null)
        }
        onConfirm={
          handleConfirmDeactivate
        }
      />

      <DeleteAccountDialog
        open={
          deleteAccount !== null
        }
        account={deleteAccount}
        loading={actionLoading}
        onClose={() =>
          setDeleteAccount(null)
        }
        onConfirm={
          handleConfirmDelete
        }
      />

      <CreateTransactionDialog
  open={createTransactionDialogOpen}
  onClose={() =>
    setCreateTransactionDialogOpen(false)
  }
  onCreated={
    handleTransactionCreated
  }
/>

<CreateTransferDialog
  open={createTransferDialogOpen}
  onClose={() =>
    setCreateTransferDialogOpen(false)
  }
  onCreated={handleTransferCreated}
/>

<EditTransactionDialog
  open={editTransactionId !== null}
  transactionId={editTransactionId}
  onClose={() => {
    setEditTransactionId(null);
    setSelectedTransaction(null);
  }}
  onUpdated={
    handleTransactionUpdated
  }
/>

<DeleteTransactionDialog
  open={deleteTransaction !== null}
  transaction={deleteTransaction}
  loading={transactionActionLoading}
  onClose={() =>
    setDeleteTransaction(null)
  }
  onConfirm={
    handleConfirmDeleteTransaction
  }
/>
    </Box>
  );
}


function formatMoney(
  amount: number
) {
  return new Intl.NumberFormat(
    "uk-UA",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

function formatTransactionDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "uk-UA",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
}

function getTransactionTypeInfo(
  type: FinancialTransactionType
) {
  switch (type) {
    case "INCOME":
      return {
        label: "Надходження",
        sign: "+",
        color: "#5bd68a",
        backgroundColor:
          "rgba(46,204,113,0.12)",
        icon: (
          <ArrowDownwardRoundedIcon
            sx={{ fontSize: 20 }}
          />
        ),
      };

    case "EXPENSE":
      return {
        label: "Витрата",
        sign: "-",
        color: "#ff6b6b",
        backgroundColor:
          "rgba(244,67,54,0.12)",
        icon: (
          <ArrowUpwardRoundedIcon
            sx={{ fontSize: 20 }}
          />
        ),
      };

    case "REFUND":
      return {
        label: "Повернення",
        sign: "-",
        color: "#ffb454",
        backgroundColor:
          "rgba(255,167,38,0.12)",
        icon: (
          <ReplayRoundedIcon
            sx={{ fontSize: 20 }}
          />
        ),
      };

    case "TRANSFER_IN":
      return {
        label: "Переказ — надходження",
        sign: "+",
        color: "#63b3ff",
        backgroundColor:
          "rgba(47,140,255,0.12)",
        icon: (
          <SwapHorizRoundedIcon
            sx={{ fontSize: 20 }}
          />
        ),
      };

    case "TRANSFER_OUT":
      return {
        label: "Переказ — списання",
        sign: "-",
        color: "#63b3ff",
        backgroundColor:
          "rgba(47,140,255,0.12)",
        icon: (
          <SwapHorizRoundedIcon
            sx={{ fontSize: 20 }}
          />
        ),
      };

    case "OPENING_BALANCE":
      return {
        label: "Початковий баланс",
        sign: "+",
        color: "#b39ddb",
        backgroundColor:
          "rgba(179,157,219,0.12)",
        icon: (
          <AccountBalanceWalletOutlinedIcon
            sx={{ fontSize: 20 }}
          />
        ),
      };
  }
}

