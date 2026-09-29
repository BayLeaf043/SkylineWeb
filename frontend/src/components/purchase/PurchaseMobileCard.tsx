import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import type {
  PurchaseResponse,
  PurchaseType,
} from "../../types/purchase";

interface PurchaseMobileCardProps {
  purchase: PurchaseResponse;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    purchase: PurchaseResponse
  ) => void;
}

export default function PurchaseMobileCard({
  purchase,
  onOpenMenu,
}: PurchaseMobileCardProps) {
  const status = getPurchaseStatus(
    purchase.type
  );

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,

        opacity:
          purchase.status ? 1 : 0.7,
      }}
    >
      {/* HEADER */}

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
            width: 42,
            height: 42,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: 1.25,

            bgcolor: status.iconBg,
            color: status.color,

            flexShrink: 0,
          }}
        >
          <ShoppingBagOutlinedIcon
            sx={{
              fontSize: 21,
            }}
          />
        </Box>

        {/* CLIENT + SERVICE */}

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
            {purchase.clientFirstName}{" "}
            {purchase.clientLastName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            {purchase.serviceTitle}
          </Typography>
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
              color: status.amountColor,
              whiteSpace: "nowrap",
            }}
          >
            {formatMoney(
              purchase.amount
            )}{" "}
            грн
          </Typography>

          {purchase.type === "COMPLETED" &&
  purchase.status && (
    <IconButton
      size="small"
      onClick={(event) =>
        onOpenMenu(
          event,
          purchase
        )
      }
      sx={{
        mt: 0.25,
        mr: -0.75,
        color: "text.secondary",
      }}
      aria-label="Дії з покупкою"
    >
      <MoreVertRoundedIcon />
    </IconButton>
  )}
        </Box>
      </Stack>

      {/* STATUS + DATE */}

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
          label={status.label}
          size="small"
          sx={{
            bgcolor: status.bgcolor,
            color: status.color,

            fontWeight: 600,
            fontSize: 12,
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {formatDateTime(
            purchase.createdAt
          )}
        </Typography>
      </Stack>

      {/* PURCHASE INFO */}

      <Stack
        spacing={0.75}
        sx={{
          mt: 1.75,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
          }}
        >
          <PersonOutlineRoundedIcon
            sx={{
              fontSize: 17,
              color: "text.secondary",
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Клієнт #{purchase.clientId}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Покупка #{purchase.purchaseId}
        </Typography>
      </Stack>

      {/* COMMENT */}

      {purchase.comment && (
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,

            borderTop:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.5,
            }}
          >
            {purchase.comment}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

/*
 * PURCHASE STATUS
 */

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

        iconBg:
          "rgba(46,204,113,0.10)",

        amountColor: "#5bd68a",
      };

    case "REFUNDED":
      return {
        label: "Повернено",

        color: "#ffb74d",

        bgcolor:
          "rgba(255,167,38,0.12)",

        iconBg:
          "rgba(255,167,38,0.10)",

        amountColor: "text.secondary",
      };

    case "CANCELLED":
      return {
        label: "Скасовано",

        color: "text.secondary",

        bgcolor:
          "rgba(255,255,255,0.06)",

        iconBg:
          "rgba(255,255,255,0.06)",

        amountColor: "text.secondary",
      };

    default:
      return {
        label: type,

        color: "text.secondary",

        bgcolor:
          "rgba(255,255,255,0.06)",

        iconBg:
          "rgba(255,255,255,0.06)",

        amountColor: "text.primary",
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

function formatDateTime(
  value: string
): string {
  return new Intl.DateTimeFormat(
    "uk-UA",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}