import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import type {
  AccountResponse,
  AccountType,
} from "../../types/account";

interface AccountCardProps {
  account: AccountResponse;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    account: AccountResponse
  ) => void;
}

export default function AccountCard({
  account,
  onOpenMenu,
}: AccountCardProps) {
  const getAccountTypeLabel = (
    type: AccountType
  ) => {
    switch (type) {
      case "CASH":
        return "Готівковий рахунок";

      case "BANK":
        return "Банківський рахунок";

      case "OTHER":
        return "Інший рахунок";

      default:
        return type;
    }
  };

  const getAccountIcon = (
    type: AccountType
  ) => {
    switch (type) {
      case "CASH":
        return <PaymentsOutlinedIcon />;

      case "BANK":
        return <AccountBalanceOutlinedIcon />;

      case "OTHER":
        return <WalletOutlinedIcon />;

      default:
        return <WalletOutlinedIcon />;
    }
  };

  const formatAmount = (
    amount: number
  ) => {
    return new Intl.NumberFormat("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        height: "100%",

        opacity: account.status
          ? 1
          : 0.65,
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
        <Box
          sx={{
            width: 42,
            height: 42,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: 1,

            bgcolor: "rgba(47,140,255,0.12)",
            color: "primary.main",

            flexShrink: 0,

            "& svg": {
              fontSize: 22,
            },
          }}
        >
          {getAccountIcon(account.type)}
        </Box>

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

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {account.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.4,
            }}
          >
            {getAccountTypeLabel(
              account.type
            )}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={(event) =>
            onOpenMenu(event, account)
          }
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії з рахунком"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>

      {/* BALANCE */}

      <Box
        sx={{
          mt: 2.5,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Поточний баланс
        </Typography>

        <Typography
          sx={{
            mt: 0.4,

            fontSize: {
              xs: "1.5rem",
              sm: "1.65rem",
            },

            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {formatAmount(account.balance)} грн
        </Typography>
      </Box>

      {/* STATUS */}

      <Box
        sx={{
          mt: 2.25,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Chip
          label={
            account.status
              ? "Активний"
              : "Неактивний"
          }
          size="small"
          sx={{
            bgcolor: account.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: account.status
              ? "#5bd68a"
              : "text.secondary",

            fontWeight: 600,
            fontSize: 12,
          }}
        />
      </Box>
    </Paper>
  );
}