import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import CategoryDialog from "../components/category/CategoryDialog";
import DeactivateCategoryDialog from "../components/category/DeactivateCategoryDialog";
import DeleteCategoryDialog from "../components/category/DeleteCategoryDialog";
import CategoryActionsMenu from "../components/category/CategoryActionsMenu";
import CategoryMobileCard from "../components/category/CategoryMobileCard";

import DirectionDialog from "../components/direction/DirectionDialog";
import DeactivateDirectionDialog from "../components/direction/DeactivateDirectionDialog";
import DeleteDirectionDialog from "../components/direction/DeleteDirectionDialog";
import DirectionActionsMenu from "../components/direction/DirectionActionsMenu";
import DirectionMobileCard from "../components/direction/DirectionMobileCard";

import { categoryService } from "../services/categoryService";
import { directionService } from "../services/directionService";

import type { Category } from "../types/category";
import type { Direction } from "../types/direction";

export default function CategoriesPage() {
  /*
   * DATA
   */

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [directions, setDirections] =
    useState<Direction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * CATEGORY STATE
   */

  const [
    categoryDialogOpen,
    setCategoryDialogOpen,
  ] = useState(false);

  const [
    categoryMenuAnchor,
    setCategoryMenuAnchor,
  ] = useState<HTMLElement | null>(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<Category | null>(null);

  const [
    statusCategory,
    setStatusCategory,
  ] = useState<Category | null>(null);

  const [
    deleteCategory,
    setDeleteCategory,
  ] = useState<Category | null>(null);

  /*
   * DIRECTION STATE
   */

  const [
    directionDialogOpen,
    setDirectionDialogOpen,
  ] = useState(false);

  const [
    directionMenuAnchor,
    setDirectionMenuAnchor,
  ] = useState<HTMLElement | null>(null);

  const [
    selectedDirection,
    setSelectedDirection,
  ] = useState<Direction | null>(null);

  const [
    statusDirection,
    setStatusDirection,
  ] = useState<Direction | null>(null);

  const [
    deleteDirection,
    setDeleteDirection,
  ] = useState<Direction | null>(null);

  /*
   * LOAD DATA
   */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        categoriesData,
        directionsData,
      ] = await Promise.all([
        categoryService.getAll(),
        directionService.getAll(),
      ]);

      setCategories(categoriesData);
      setDirections(directionsData);
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося завантажити категорії та напрямки"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
   * SORTING
   */

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      return a.title.localeCompare(
        b.title,
        "uk"
      );
    });
  }, [categories]);

  const sortedDirections = useMemo(() => {
    return [...directions].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }

      return a.title.localeCompare(
        b.title,
        "uk"
      );
    });
  }, [directions]);

  /*
   * CATEGORY ACTIONS
   */

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleOpenCategoryMenu = (
    event: React.MouseEvent<HTMLElement>,
    category: Category
  ) => {
    setCategoryMenuAnchor(
      event.currentTarget
    );

    setSelectedCategory(category);
  };

  const handleCloseCategoryMenu = () => {
    setCategoryMenuAnchor(null);
  };

  const handleEditCategory = () => {
    if (!selectedCategory) {
      return;
    }

    setCategoryDialogOpen(true);
  };

  const handleCategorySaved = (
    savedCategory: Category
  ) => {
    setCategories((current) => {
      const exists = current.some(
        (category) =>
          category.categoryId ===
          savedCategory.categoryId
      );

      if (exists) {
        return current.map(
          (category) =>
            category.categoryId ===
            savedCategory.categoryId
              ? savedCategory
              : category
        );
      }

      return [
        ...current,
        savedCategory,
      ];
    });

    setCategoryDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleActivateCategory = async (
    category: Category
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await categoryService.updateCategoryStatus(
        category.categoryId,
        {
          status: true,
        }
      );

      setSelectedCategory(null);

      await loadData();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати категорію"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeactivateCategory =
    async () => {
      if (!statusCategory) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await categoryService.updateCategoryStatus(
          statusCategory.categoryId,
          {
            status: false,
          }
        );

        setStatusCategory(null);
        setSelectedCategory(null);

        await loadData();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося деактивувати категорію"
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleConfirmDeleteCategory =
    async () => {
      if (!deleteCategory) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await categoryService.deleteCategory(
          deleteCategory.categoryId
        );

        setDeleteCategory(null);
        setSelectedCategory(null);

        await loadData();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося видалити категорію"
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * DIRECTION ACTIONS
   */

  const handleAddDirection = () => {
    setSelectedDirection(null);
    setDirectionDialogOpen(true);
  };

  const handleOpenDirectionMenu = (
    event: React.MouseEvent<HTMLElement>,
    direction: Direction
  ) => {
    setDirectionMenuAnchor(
      event.currentTarget
    );

    setSelectedDirection(direction);
  };

  const handleCloseDirectionMenu = () => {
    setDirectionMenuAnchor(null);
  };

  const handleEditDirection = () => {
    if (!selectedDirection) {
      return;
    }

    setDirectionDialogOpen(true);
  };

  const handleDirectionSaved = (
    savedDirection: Direction
  ) => {
    setDirections((current) => {
      const exists = current.some(
        (direction) =>
          direction.directionId ===
          savedDirection.directionId
      );

      if (exists) {
        return current.map(
          (direction) =>
            direction.directionId ===
            savedDirection.directionId
              ? savedDirection
              : direction
        );
      }

      return [
        ...current,
        savedDirection,
      ];
    });

    setDirectionDialogOpen(false);
    setSelectedDirection(null);
  };

  const handleCloseDirectionDialog = () => {
    setDirectionDialogOpen(false);
    setSelectedDirection(null);
  };

  const handleActivateDirection = async (
    direction: Direction
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await directionService.updateDirectionStatus(
        direction.directionId,
        {
          status: true,
        }
      );

      setSelectedDirection(null);

      await loadData();
    } catch (error: any) {
      setError(
        error?.message ||
          "Не вдалося активувати напрямок"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeactivateDirection =
    async () => {
      if (!statusDirection) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await directionService.updateDirectionStatus(
          statusDirection.directionId,
          {
            status: false,
          }
        );

        setStatusDirection(null);
        setSelectedDirection(null);

        await loadData();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося деактивувати напрямок"
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleConfirmDeleteDirection =
    async () => {
      if (!deleteDirection) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await directionService.deleteDirection(
          deleteDirection.directionId
        );

        setDeleteDirection(null);
        setSelectedDirection(null);

        await loadData();
      } catch (error: any) {
        setError(
          error?.message ||
            "Не вдалося видалити напрямок"
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
   * PAGE
   */

  return (
    <Box sx={{ width: "100%" }}>
      {/* PAGE HEADER */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,

            fontSize: {
              xs: "1.75rem",
              sm: "2.125rem",
            },
          }}
        >
          Категорії та напрямки
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 700,
          }}
        >
          Керуйте структурою послуг вашого
          спортивного комплексу.
        </Typography>
      </Box>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* CONTENT */}

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={4}>
          {/* DIRECTIONS */}

          <ManagementSection
            title="Напрямки"
            description="Види тренувань та активностей спортивного комплексу."
            buttonLabel="Додати напрямок"
            icon={
              <ExploreOutlinedIcon />
            }
            onAdd={handleAddDirection}
          >
            {sortedDirections.length === 0 ? (
              <EmptyState
                icon={
                  <ExploreOutlinedIcon />
                }
                title="Напрямків ще немає"
                description="Додайте перший напрямок спортивного комплексу."
              />
            ) : (
              <>
                {/* DESKTOP */}

                <SimpleDesktopTable
                  items={sortedDirections}
                  getId={(direction) =>
                    direction.directionId
                  }
                  getTitle={(direction) =>
                    direction.title
                  }
                  getStatus={(direction) =>
                    direction.status
                  }
                  statusLabels={{
                    active: "Активний",
                    inactive:
                      "Неактивний",
                  }}
                  onOpenMenu={
                    handleOpenDirectionMenu
                  }
                  ariaLabel="Дії з напрямком"
                />

                {/* MOBILE */}

                <Stack
                  spacing={1.5}
                  sx={{
                    display: {
                      xs: "flex",
                      md: "none",
                    },
                  }}
                >
                  {sortedDirections.map(
                    (direction) => (
                      <DirectionMobileCard
                        key={
                          direction.directionId
                        }
                        direction={
                          direction
                        }
                        onOpenMenu={
                          handleOpenDirectionMenu
                        }
                      />
                    )
                  )}
                </Stack>
              </>
            )}
          </ManagementSection>

          {/* CATEGORIES */}

          <ManagementSection
            title="Категорії"
            description="Формати надання послуг спортивного комплексу."
            buttonLabel="Додати категорію"
            icon={
              <CategoryOutlinedIcon />
            }
            onAdd={handleAddCategory}
          >
            {sortedCategories.length === 0 ? (
              <EmptyState
                icon={
                  <CategoryOutlinedIcon />
                }
                title="Категорій ще немає"
                description="Додайте першу категорію послуг спортивного комплексу."
              />
            ) : (
              <>
                {/* DESKTOP */}

                <SimpleDesktopTable
                  items={sortedCategories}
                  getId={(category) =>
                    category.categoryId
                  }
                  getTitle={(category) =>
                    category.title
                  }
                  getStatus={(category) =>
                    category.status
                  }
                  statusLabels={{
                    active: "Активна",
                    inactive:
                      "Неактивна",
                  }}
                  onOpenMenu={
                    handleOpenCategoryMenu
                  }
                  ariaLabel="Дії з категорією"
                />

                {/* MOBILE */}

                <Stack
                  spacing={1.5}
                  sx={{
                    display: {
                      xs: "flex",
                      md: "none",
                    },
                  }}
                >
                  {sortedCategories.map(
                    (category) => (
                      <CategoryMobileCard
                        key={
                          category.categoryId
                        }
                        category={category}
                        onOpenMenu={
                          handleOpenCategoryMenu
                        }
                      />
                    )
                  )}
                </Stack>
              </>
            )}
          </ManagementSection>
        </Stack>
      )}

      {/* CATEGORY MENU */}

      <CategoryActionsMenu
        anchorEl={categoryMenuAnchor}
        category={selectedCategory}
        loading={actionLoading}
        onClose={handleCloseCategoryMenu}
        onEdit={handleEditCategory}
        onActivate={handleActivateCategory}
        onDeactivate={(category) =>
          setStatusCategory(category)
        }
        onDelete={(category) =>
          setDeleteCategory(category)
        }
      />

      {/* DIRECTION MENU */}

      <DirectionActionsMenu
        anchorEl={directionMenuAnchor}
        direction={selectedDirection}
        loading={actionLoading}
        onClose={handleCloseDirectionMenu}
        onEdit={handleEditDirection}
        onActivate={handleActivateDirection}
        onDeactivate={(direction) =>
          setStatusDirection(direction)
        }
        onDelete={(direction) =>
          setDeleteDirection(direction)
        }
      />

      {/* CATEGORY DIALOGS */}

      <DeactivateCategoryDialog
        open={statusCategory !== null}
        category={statusCategory}
        loading={actionLoading}
        onClose={() =>
          setStatusCategory(null)
        }
        onConfirm={
          handleConfirmDeactivateCategory
        }
      />

      <DeleteCategoryDialog
        open={deleteCategory !== null}
        category={deleteCategory}
        loading={actionLoading}
        onClose={() =>
          setDeleteCategory(null)
        }
        onConfirm={
          handleConfirmDeleteCategory
        }
      />

      <CategoryDialog
        open={categoryDialogOpen}
        category={selectedCategory}
        onClose={
          handleCloseCategoryDialog
        }
        onSaved={handleCategorySaved}
      />

      {/* DIRECTION DIALOGS */}

      <DeactivateDirectionDialog
        open={statusDirection !== null}
        direction={statusDirection}
        loading={actionLoading}
        onClose={() =>
          setStatusDirection(null)
        }
        onConfirm={
          handleConfirmDeactivateDirection
        }
      />

      <DeleteDirectionDialog
        open={deleteDirection !== null}
        direction={deleteDirection}
        loading={actionLoading}
        onClose={() =>
          setDeleteDirection(null)
        }
        onConfirm={
          handleConfirmDeleteDirection
        }
      />

      <DirectionDialog
        open={directionDialogOpen}
        direction={selectedDirection}
        onClose={
          handleCloseDirectionDialog
        }
        onSaved={handleDirectionSaved}
      />
    </Box>
  );
}

/*
 * SECTION
 */

interface ManagementSectionProps {
  title: string;
  description: string;
  buttonLabel: string;
  icon: React.ReactNode;
  onAdd: () => void;
  children: React.ReactNode;
}

function ManagementSection({
  title,
  description,
  buttonLabel,
  icon,
  onAdd,
  children,
}: ManagementSectionProps) {
  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 1.75,

          justifyContent:
            "space-between",

          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              borderRadius: 1.25,

              bgcolor:
                "rgba(47,140,255,0.10)",

              color: "primary.main",

              flexShrink: 0,

              "& svg": {
                fontSize: 21,
              },
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {description}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={
            <AddRoundedIcon />
          }
          onClick={onAdd}
          sx={{
            px: 2.5,

            width: {
              xs: "100%",
              sm: "auto",
            },

            flexShrink: 0,
          }}
        >
          {buttonLabel}
        </Button>
      </Stack>

      {children}
    </Box>
  );
}

/*
 * DESKTOP TABLE
 */

interface SimpleDesktopTableProps<T> {
  items: T[];
  getId: (item: T) => number;
  getTitle: (item: T) => string;
  getStatus: (item: T) => boolean;

  statusLabels: {
    active: string;
    inactive: string;
  };

  onOpenMenu: (
    event: React.MouseEvent<HTMLElement>,
    item: T
  ) => void;

  ariaLabel: string;
}

function SimpleDesktopTable<T>({
  items,
  getId,
  getTitle,
  getStatus,
  statusLabels,
  onOpenMenu,
  ariaLabel,
}: SimpleDesktopTableProps<T>) {
  return (
    <Paper
      sx={{
        display: {
          xs: "none",
          md: "block",
        },

        overflow: "hidden",
        borderRadius: 1.5,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            "minmax(240px, 1fr) minmax(130px, 180px) 48px",

          alignItems: "center",

          minHeight: 52,
          px: 2.5,

          borderBottom:
            "1px solid",

          borderColor: "divider",
        }}
      >
        <TableHeaderText>
          Назва
        </TableHeaderText>

        <TableHeaderText>
          Статус
        </TableHeaderText>

        <Box />
      </Box>

      {/* ROWS */}

      {items.map((item, index) => {
        const active =
          getStatus(item);

        return (
          <Box
            key={getId(item)}
            sx={{
              display: "grid",

              gridTemplateColumns:
                "minmax(240px, 1fr) minmax(130px, 180px) 48px",

              alignItems: "center",

              minHeight: 72,
              px: 2.5,

              borderBottom:
                index !==
                items.length - 1
                  ? "1px solid"
                  : "none",

              borderColor: "divider",

              opacity:
                active ? 1 : 0.6,

              transition:
                "background-color 0.15s ease",

              "&:hover": {
                bgcolor:
                  "rgba(255,255,255,0.025)",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                pr: 2,

                overflow: "hidden",
                textOverflow:
                  "ellipsis",

                whiteSpace: "nowrap",
              }}
            >
              {getTitle(item)}
            </Typography>

            <StatusChip
              active={active}
              activeLabel={
                statusLabels.active
              }
              inactiveLabel={
                statusLabels.inactive
              }
            />

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <IconButton
                size="small"
                onClick={(event) =>
                  onOpenMenu(
                    event,
                    item
                  )
                }
                sx={{
                  color:
                    "text.secondary",
                }}
                aria-label={
                  ariaLabel
                }
              >
                <MoreVertRoundedIcon />
              </IconButton>
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
}

/*
 * EMPTY STATE
 */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <Paper
      sx={{
        py: 5,
        px: 3,
        borderRadius: 1.5,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          color: "text.secondary",
          mb: 1.25,

          "& svg": {
            fontSize: 38,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {description}
      </Typography>
    </Paper>
  );
}

/*
 * TABLE HEADER
 */

function TableHeaderText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        fontWeight: 700,

        textTransform:
          "uppercase",

        letterSpacing:
          "0.05em",
      }}
    >
      {children}
    </Typography>
  );
}

/*
 * STATUS
 */

interface StatusChipProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}

function StatusChip({
  active,
  activeLabel,
  inactiveLabel,
}: StatusChipProps) {
  return (
    <Chip
      label={
        active
          ? activeLabel
          : inactiveLabel
      }
      size="small"
      sx={{
        justifySelf: "start",

        bgcolor: active
          ? "rgba(46,204,113,0.12)"
          : "rgba(255,255,255,0.06)",

        color: active
          ? "#5bd68a"
          : "text.secondary",

        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}