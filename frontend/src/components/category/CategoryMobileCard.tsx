import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import type { Category } from "../../types/category";

interface CategoryMobileCardProps {
  category: Category;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    category: Category
  ) => void;
}

export default function CategoryMobileCard({
  category,
  onOpenMenu,
}: CategoryMobileCardProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        opacity: category.status ? 1 : 0.65,
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
          {category.title}
        </Typography>

        {/* STATUS */}

        <Chip
          label={
            category.status
              ? "Активна"
              : "Неактивна"
          }
          size="small"
          sx={{
            flexShrink: 0,

            bgcolor: category.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: category.status
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
            onOpenMenu(event, category)
          }
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Дії з категорією"
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}