import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import type {
  FinancialTransactionResponse,
  FinancialTransactionType,
} from "../../types/financialTransaction";

interface TransactionMobileCardProps {
  transaction: FinancialTransactionResponse;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    transaction: FinancialTransactionResponse
  ) => void;
}

interface TransactionTypeInfo {
  label: string;
  sign: "+" | "-";
  color: string;
  backgroundColor: string;
  icon: React.ReactNode;
}

export default function TransactionMobileCard({
  transaction,
  onOpenMenu,
}: TransactionMobileCardProps) {
  const typeInfo =
    getTransactionTypeInfo(transaction.type);

  /*
   * Керувати вручну можна тільки
   * непов'язаними INCOME / EXPENSE.
   */
  const canManage =
    (transaction.type === "INCOME" ||
      transaction.type === "EXPENSE") &&
    transaction.purchaseId === null &&
    transaction.transferId === null;

  const formattedAmount =
    new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(transaction.amount);

  const formattedDate =
    new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(
      new Date(transaction.createdAt)
    );

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,

        opacity: transaction.status
          ? 1
          : 0.6,
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "flex-start",
        }}
      >
        {/* TYPE ICON */}

        <Box
          sx={{
            width: 42,
            height: 42,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: 1.25,

            bgcolor:
              typeInfo.backgroundColor,

            color: typeInfo.color,

            flexShrink: 0,

            "& svg": {
              fontSize: 21,
            },
          }}
        >
          {typeInfo.icon}
        </Box>

        {/* TYPE + ACCOUNT */}

        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {typeInfo.label}
          </Typography>

          <Stack
            direction="row"
            spacing={0.6}
            sx={{
              mt: 0.4,
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <AccountBalanceWalletOutlinedIcon
              sx={{
                fontSize: 15,
                color: "text.secondary",
                flexShrink: 0,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
            >
              {transaction.accountTitle}
            </Typography>
          </Stack>
        </Box>

        {/* AMOUNT */}

        <Box
          sx={{
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: typeInfo.color,
              whiteSpace: "nowrap",
            }}
          >
            {typeInfo.sign}
            {formattedAmount} грн
          </Typography>
        </Box>

        {/* ACTIONS */}

        {canManage && (
          <IconButton
            size="small"
            onClick={(event) =>
              onOpenMenu(
                event,
                transaction
              )
            }
            sx={{
              color: "text.secondary",
              flexShrink: 0,
              mt: -0.5,
              mr: -0.5,
            }}
            aria-label="Дії з фінансовою операцією"
          >
            <MoreVertRoundedIcon />
          </IconButton>
        )}
      </Stack>

      {/* INFO */}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 1.75,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Chip
          label={typeInfo.label}
          size="small"
          sx={{
            bgcolor:
              typeInfo.backgroundColor,

            color: typeInfo.color,

            fontWeight: 600,
            fontSize: 12,
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {formattedDate}
        </Typography>
      </Stack>

      {/* COMMENT */}

      {transaction.comment && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1.5,
            lineHeight: 1.5,

            overflowWrap: "anywhere",
          }}
        >
          {transaction.comment}
        </Typography>
      )}

      {/* SYSTEM SOURCE */}

      {(transaction.purchaseId !== null ||
        transaction.transferId !== null) && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: transaction.comment
              ? 1
              : 1.5,
            opacity: 0.8,
          }}
        >
          {transaction.purchaseId !== null
            ? `Покупка #${transaction.purchaseId}`
            : `Переказ #${transaction.transferId}`}
        </Typography>
      )}
    </Paper>
  );
}

function getTransactionTypeInfo(
  type: FinancialTransactionType
): TransactionTypeInfo {
  switch (type) {
    case "INCOME":
      return {
        label: "Надходження",
        sign: "+",
        color: "#5bd68a",
        backgroundColor:
          "rgba(46,204,113,0.12)",
        icon: (
          <ArrowDownwardRoundedIcon />
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
          <ArrowUpwardRoundedIcon />
        ),
      };

    case "REFUND":
      return {
        label: "Повернення",
        sign: "-",
        color: "#ffb454",
        backgroundColor:
          "rgba(255,167,38,0.12)",
        icon: <ReplayRoundedIcon />,
      };

    case "TRANSFER_IN":
      return {
        label: "Переказ — надходження",
        sign: "+",
        color: "#63b3ff",
        backgroundColor:
          "rgba(47,140,255,0.12)",
        icon: <SwapHorizRoundedIcon />,
      };

    case "TRANSFER_OUT":
      return {
        label: "Переказ — списання",
        sign: "-",
        color: "#63b3ff",
        backgroundColor:
          "rgba(47,140,255,0.12)",
        icon: <SwapHorizRoundedIcon />,
      };

    case "OPENING_BALANCE":
      return {
        label: "Початковий баланс",
        sign: "+",
        color: "#b39ddb",
        backgroundColor:
          "rgba(179,157,219,0.12)",
        icon: (
          <AccountBalanceWalletOutlinedIcon />
        ),
      };
  }
}