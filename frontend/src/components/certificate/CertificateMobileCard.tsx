import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

import type {
  CertificateResponse,
  CertificateType,
} from "../../types/certificate";

interface CertificateMobileCardProps {
  certificate: CertificateResponse;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    certificate: CertificateResponse
  ) => void;
}

export default function CertificateMobileCard({
  certificate,
  onOpenMenu,
}: CertificateMobileCardProps) {
  const certificateStatus =
    getCertificateStatus(
      certificate.type
    );

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,

        opacity:
          certificate.status ? 1 : 0.7,
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

            bgcolor:
              certificateStatus.iconBg,

            color:
              certificateStatus.color,

            flexShrink: 0,
          }}
        >
          <CardMembershipOutlinedIcon
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
            {certificate.clientFirstName}{" "}
            {certificate.clientLastName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            {certificate.serviceTitle}
          </Typography>
        </Box>

        {/* ACTIONS */}

        <IconButton
          size="small"
          onClick={(event) =>
            onOpenMenu(
              event,
              certificate
            )
          }
          sx={{
            mt: -0.5,
            mr: -0.75,
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії з сертифікатом"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>

      {/* STATUS + SESSIONS */}

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
          label={
            certificateStatus.label
          }
          size="small"
          sx={{
            bgcolor:
              certificateStatus.bgcolor,

            color:
              certificateStatus.color,

            fontWeight: 600,
            fontSize: 12,
          }}
        />

        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
          }}
        >
          {certificate.remainingSessions}{" "}
          з {certificate.totalSessions} занять
        </Typography>
      </Stack>

      {/* VALIDITY */}

      <Box
        sx={{
          mt: 1.75,
          p: 1.5,

          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.25,

          bgcolor:
            "rgba(255,255,255,0.02)",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <CalendarMonthOutlinedIcon
            sx={{
              fontSize: 18,
              color: "text.secondary",
              flexShrink: 0,
            }}
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Термін дії
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.1,
                fontWeight: 600,
              }}
            >
              {formatDate(
                certificate.validFrom
              )}
              {" — "}
              {formatDate(
                certificate.validTo
              )}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ADDITIONAL INFO */}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 1.5,
          alignItems: "center",
        }}
      >
        <ConfirmationNumberOutlinedIcon
          sx={{
            fontSize: 17,
            color: "text.secondary",
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Сертифікат #
          {certificate.certificateId}
          {" · "}
          Покупка #
          {certificate.purchaseId}
        </Typography>
      </Stack>

      {/* CREATED */}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mt: 1.25,
        }}
      >
        Створено:{" "}
        {formatDateTime(
          certificate.createdAt
        )}
      </Typography>
    </Paper>
  );
}

/*
 * CERTIFICATE STATUS
 */

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

        iconBg:
          "rgba(46,204,113,0.10)",
      };

    case "USED":
      return {
        label: "Використаний",

        color: "#64b5f6",

        bgcolor:
          "rgba(47,140,255,0.12)",

        iconBg:
          "rgba(47,140,255,0.10)",
      };

    case "EXPIRED":
      return {
        label: "Прострочений",

        color: "#ffb74d",

        bgcolor:
          "rgba(255,167,38,0.12)",

        iconBg:
          "rgba(255,167,38,0.10)",
      };

    case "CANCELLED":
      return {
        label: "Скасований",

        color: "text.secondary",

        bgcolor:
          "rgba(255,255,255,0.06)",

        iconBg:
          "rgba(255,255,255,0.06)",
      };

    default:
      return {
        label: type,

        color: "text.secondary",

        bgcolor:
          "rgba(255,255,255,0.06)",

        iconBg:
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

/*
 * DATE + TIME
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