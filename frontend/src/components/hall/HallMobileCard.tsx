import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import type { Hall } from "../../types/hall";

interface HallMobileCardProps {
  hall: Hall;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    hall: Hall
  ) => void;
}

export default function HallMobileCard({
  hall,
  onOpenMenu,
}: HallMobileCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        opacity: hall.status ? 1 : 0.65,
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
            {hall.title}
          </Typography>

          {hall.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                lineHeight: 1.5,
              }}
            >
              {hall.description}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={(event) =>
            onOpenMenu(event, hall)
          }
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії із залом"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>

      {/* INFO */}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 2,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Місткість:{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            {hall.capacity}
          </Box>
        </Typography>

        <Chip
          label={
            hall.status
              ? "Активний"
              : "Неактивний"
          }
          size="small"
          sx={{
            bgcolor: hall.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: hall.status
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