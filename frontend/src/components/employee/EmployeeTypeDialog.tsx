import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

interface EmployeeTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectAdmin: () => void;
  onSelectTrainer: () => void;
}

export default function EmployeeTypeDialog({
  open,
  onClose,
  onSelectAdmin,
  onSelectTrainer,
}: EmployeeTypeDialogProps) {
  return (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
  >
    {/* HEADER */}

    <DialogTitle>
      <Stack
        direction="row"
        spacing={{
          xs: 1,
          sm: 2,
        }}
        sx={{
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.15rem",
                sm: "1.5rem",
              },
            }}
          >
            Додати працівника
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Оберіть роль нового працівника у системі.
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            flexShrink: 0,
          }}
          aria-label="Закрити"
        >
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
    </DialogTitle>

    {/* CONTENT */}

    <DialogContent
      sx={{
        pt: "20px !important",
        pb: 3,
      }}
    >
      <Stack spacing={1.5}>
        <EmployeeTypeCard
          icon={<AdminPanelSettingsOutlinedIcon />}
          title="Адміністратор"
          description="Має доступ до керування спортивним комплексом, працівниками, послугами та іншими розділами системи."
          onClick={onSelectAdmin}
        />

        <EmployeeTypeCard
          icon={<FitnessCenterOutlinedIcon />}
          title="Тренер"
          description="Проводить заняття та матиме доступ до функцій системи, передбачених для тренерів."
          onClick={onSelectTrainer}
        />
      </Stack>
    </DialogContent>
  </Dialog>
);
}

interface EmployeeTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function EmployeeTypeCard({
  icon,
  title,
  description,
  onClick,
}: EmployeeTypeCardProps) {
  return (
  <Box
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    }}
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "44px minmax(0, 1fr) 24px",
        sm: "52px minmax(0, 1fr) 32px",
      },
      alignItems: "center",

      gap: {
        xs: 1.5,
        sm: 2,
      },

      p: {
        xs: 1.5,
        sm: 2.25,
      },

      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1.5,

      cursor: "pointer",

      transition:
        "border-color 0.15s ease, background-color 0.15s ease",

      "&:hover": {
        borderColor: "primary.main",
        bgcolor: "rgba(47,140,255,0.05)",

        "& .employee-arrow": {
          color: "primary.main",
          transform: "translateX(3px)",
        },
      },

      "&:focus-visible": {
        outline: "2px solid",
        outlineColor: "primary.main",
        outlineOffset: 2,
      },
    }}
  >
    {/* ICON */}

    <Box
      sx={{
        width: {
          xs: 44,
          sm: 52,
        },
        height: {
          xs: 44,
          sm: 52,
        },

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 1,

        bgcolor: "rgba(47,140,255,0.12)",
        color: "primary.main",

        "& svg": {
          fontSize: {
            xs: 22,
            sm: 25,
          },
        },
      }}
    >
      {icon}
    </Box>

    {/* TEXT */}

    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontWeight: 650,
          mb: 0.35,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>
    </Box>

    {/* ARROW */}

    <ArrowForwardRoundedIcon
      className="employee-arrow"
      sx={{
        color: "text.secondary",
        transition:
          "color 0.15s ease, transform 0.15s ease",
      }}
    />
  </Box>
);
}