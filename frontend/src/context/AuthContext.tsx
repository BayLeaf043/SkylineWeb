import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/authService";
import type { CurrentUser, RegisterClubRequest, } from "../types/auth";


interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerClub: (data: RegisterClubRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    const accessToken = authService.getAccessToken();

    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getMe(accessToken);

      setUser(currentUser);
    } catch (error: any) {

      // Access token протермінований або невалідний
      if (error?.status === 401) {
        try {
          const newTokens = await authService.refresh();

          const currentUser = await authService.getMe(
            newTokens.accessToken
          );

          setUser(currentUser);
        } catch {
          authService.clearTokens();
          setUser(null);
        }
      } else {
        authService.clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const tokens = await authService.login({
      email,
      password,
    });

    authService.saveTokens(tokens);

    try {
      const currentUser = await authService.getMe(
        tokens.accessToken
      );

      setUser(currentUser);
    } catch (error) {
      authService.clearTokens();
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const registerClub = async (
  data: RegisterClubRequest
) => {
  await authService.registerClub(data);

  const tokens = await authService.login({
    email: data.email,
    password: data.password,
  });

  authService.saveTokens(tokens);

  try {
    const currentUser = await authService.getMe(
      tokens.accessToken
    );

    setUser(currentUser);
  } catch (error) {
    authService.clearTokens();
    throw error;
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        logout,
        registerClub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}