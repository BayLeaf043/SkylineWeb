import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import type { Direction } from "../../types/direction";

interface DirectionMobileCardProps {
  direction: Direction;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    direction: Direction
  ) => void;
}

export default function DirectionMobileCard({
  direction,
  onOpenMenu,
}: DirectionMobileCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        opacity: direction.status ? 1 : 0.65,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
        }}
      >
        {/* TITLE */}

        <Typography
          sx={{
            minWidth: 0,
            flex: 1,
            fontWeight: 600,
            lineHeight: 1.3,

            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {direction.title}
        </Typography>

        {/* STATUS */}

        <Chip
          label={
            direction.status
              ? "Активна"
              : "Неактивна"
          }
          size="small"
          sx={{
            flexShrink: 0,

            bgcolor: direction.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: direction.status
              ? "#5bd68a"
              : "text.secondary",

            fontWeight: 600,
            fontSize: 12,
          }}
        />

        {/* ACTIONS */}

        <IconButton
          size="small"
          onClick={(event) =>
            onOpenMenu(event, direction)
          }
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії з напрямком"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}