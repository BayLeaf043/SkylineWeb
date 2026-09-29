import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import type { EmployeeResponse } from "../../types/employee";

interface EmployeeMobileCardProps {
  employee: EmployeeResponse;
  currentUserId?: string | number;

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    employee: EmployeeResponse
  ) => void;
}

export default function EmployeeMobileCard({
  employee,
  currentUserId,
  onOpenMenu,
}: EmployeeMobileCardProps) {
  const getInitials = () => {
    const first =
      employee.firstName?.charAt(0) || "";

    const last =
      employee.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  const isAdmin = employee.role === "ADMIN";
  const isCurrentUser =
    currentUserId != null &&
    String(employee.userId) === String(currentUserId);

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        opacity: employee.status ? 1 : 0.65,
      }}
    >
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

            bgcolor: isAdmin
              ? "rgba(47,140,255,0.16)"
              : "rgba(255,255,255,0.08)",

            color: isAdmin
              ? "primary.main"
              : "text.primary",

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
            {employee.firstName}{" "}
            {employee.lastName}
          </Typography>

          {employee.role === "TRAINER" &&
            employee.specialization && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                {employee.specialization}
              </Typography>
            )}
        </Box>

        {!isCurrentUser && (
          <IconButton
            size="small"
            onClick={(event) =>
              onOpenMenu(event, employee)
            }
            sx={{
              color: "text.secondary",
              flexShrink: 0,
            }}
            aria-label="Дії з працівником"
          >
            <MoreVertRoundedIcon />
          </IconButton>
        )}
      </Stack>

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
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
          }}
        >
          {isAdmin ? (
            <AdminPanelSettingsOutlinedIcon
              sx={{
                fontSize: 18,
                color: "primary.main",
              }}
            />
          ) : (
            <FitnessCenterOutlinedIcon
              sx={{
                fontSize: 18,
                color: "text.secondary",
              }}
            />
          )}

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
            }}
          >
            {isAdmin
              ? "Адміністратор"
              : "Тренер"}
          </Typography>
        </Stack>

        <Chip
          label={
            employee.status
              ? "Активний"
              : "Неактивний"
          }
          size="small"
          sx={{
            bgcolor: employee.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(255,255,255,0.06)",

            color: employee.status
              ? "#5bd68a"
              : "text.secondary",

            fontWeight: 600,
            fontSize: 12,
          }}
        />
      </Stack>

      <Typography
        variant="body2"
        color={
          employee.phone
            ? "text.primary"
            : "text.secondary"
        }
        sx={{
          mt: 1.25,
        }}
      >
        {employee.phone || "Телефон не вказано"}
      </Typography>
    </Paper>
  );
}