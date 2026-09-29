import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import type { ClientResponse } from "../../types/client";

interface ClientMobileCardProps {
  client: ClientResponse;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    client: ClientResponse
  ) => void;
}

export default function ClientMobileCard({
  client,
  onOpenMenu,
}: ClientMobileCardProps) {
  const getInitials = () => {
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

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        opacity: client.status ? 1 : 0.65,
      }}
    >
      {/* CLIENT */}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Avatar
          sx={{
            width: 42,
            height: 42,

            bgcolor: "rgba(47,140,255,0.16)",
            color: "primary.main",

            fontWeight: 700,
            fontSize: 14,

            flexShrink: 0,
          }}
        >
          {getInitials()}
        </Avatar>

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
            {client.firstName}{" "}
            {client.lastName}
          </Typography>

          <Typography
            variant="body2"
            color={
              client.phone
                ? "text.secondary"
                : "text.disabled"
            }
            sx={{
              mt: 0.35,
            }}
          >
            {client.phone || "Телефон не вказано"}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={(event) =>
            onOpenMenu(event, client)
          }
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії з клієнтом"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>

      {/* CLIENT INFO */}

      <Stack
        spacing={1}
        sx={{
          mt: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
          }}
        >
          <EventAvailableOutlinedIcon
            sx={{
              fontSize: 18,
              color: "text.secondary",
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Відвідувань:
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
            }}
          >
            {client.countOfVisits}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
          }}
        >
          <HistoryRoundedIcon
            sx={{
              fontSize: 18,
              color: "text.secondary",
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Останнє відвідування:
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
            }}
          >
            {formatLastVisit(client.lastVisit)}
          </Typography>
        </Stack>
      </Stack>

      {/* STATUS */}

      <Stack
        direction="row"
        sx={{
          mt: 2,
          justifyContent: "flex-end",
        }}
      >
        <Chip
          label={
            client.status
              ? "Активний"
              : "Неактивний"
          }
          size="small"
          sx={{
            bgcolor: client.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: client.status
              ? "#5bd68a"
              : "text.secondary",

            fontWeight: 600,
            fontSize: 12,
          }}
        />
      </Stack>
    </Paper>
  );
}