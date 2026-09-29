import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import type { Service } from "../../types/service";

interface ServiceMobileCardProps {
  service: Service;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    service: Service
  ) => void;
}

export default function ServiceMobileCard({
  service,
  onOpenMenu,
}: ServiceMobileCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        opacity: service.status ? 1 : 0.65,
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "flex-start",
        }}
      >
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
            {service.title}
          </Typography>

          {service.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                lineHeight: 1.5,
              }}
            >
              {service.description}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={(event) =>
            onOpenMenu(event, service)
          }
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії з послугою"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>

      {/* DIRECTION + CATEGORY */}

      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          mt: 1.5,
          flexWrap: "wrap",
          gap: 0.75,
        }}
      >
        <Chip
          icon={
            <ExploreOutlinedIcon />
          }
          label={service.directionTitle}
          size="small"
          sx={{
            bgcolor:
              "rgba(47,140,255,0.12)",
            color: "primary.main",

            fontWeight: 600,
            fontSize: 12,

            "& .MuiChip-icon": {
              color: "primary.main",
              fontSize: 16,
            },
          }}
        />

        <Chip
          icon={
            <CategoryOutlinedIcon />
          }
          label={service.categoryTitle}
          size="small"
          sx={{
            bgcolor:
              "rgba(255,255,255,0.06)",

            color: "text.secondary",

            fontWeight: 600,
            fontSize: 12,

            "& .MuiChip-icon": {
              color: "text.secondary",
              fontSize: 16,
            },
          }}
        />
      </Stack>

      {/* INFO */}

      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: 1.75,
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Вартість:{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {formatMoney(service.price)} грн
          </Box>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Занять:{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {service.sessionsCount}
          </Box>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Термін:{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {service.validityDays} дн.
          </Box>
        </Typography>
      </Stack>

      {/* STATUS */}

      <Box
        sx={{
          mt: 2,

          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Chip
          label={
            service.status
              ? "Активна"
              : "Неактивна"
          }
          size="small"
          sx={{
            bgcolor: service.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: service.status
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

function formatMoney(
  value: number
): string {
  return new Intl.NumberFormat(
    "uk-UA",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(value);
}