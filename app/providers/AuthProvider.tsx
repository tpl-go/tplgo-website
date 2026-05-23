"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import LoginModal from "@/app/components/common/LoginModal";
import {
  AccountType,
  AuthIntent,
  AuthState,
  AuthUser,
  OpenLoginModalOptions,
} from "@/app/lib/auth/auth.types";
import { registerCurrentDeviceSession } from "@/app/lib/account/deviceSessions";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";

type AuthContextType = AuthState & {
  openLoginModal: (options?: OpenLoginModalOptions) => void;
  closeLoginModal: () => void;
  setActiveAccountType: (type: AccountType) => void;
  sendOtp: (mobile: string, accountType: AccountType) => Promise<void>;
  verifyOtp: (
    mobile: string,
    otp: string,
    accountType: AccountType
  ) => Promise<void>;
  logout: () => void;
  requireAuth: (options?: OpenLoginModalOptions) => boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = "tpl_auth_session_v1";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeAccountType, setActiveAccountType] =
    useState<AccountType>("personal");
  const [loginIntent, setLoginIntent] = useState<AuthIntent>("generic");
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null
  );

  // 🔥 CENTRAL SYNC FUNCTION
  const syncAuthFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!raw) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const parsed = JSON.parse(raw);

      if (
        parsed?.user &&
        typeof parsed.user.mobile === "string" &&
        parsed.user.mobile.trim()
      ) {
        setUser(parsed.user);
        setIsAuthenticated(true);
        setActiveAccountType(parsed.user.accountType || "personal");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Auth restore failed:", err);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // ✅ INITIAL LOAD
  useEffect(() => {
    syncAuthFromStorage();
  }, [syncAuthFromStorage]);

  // ✅ LISTEN TO AUTH CHANGE
  useEffect(() => {
    const handleAuthUpdate = () => {
      syncAuthFromStorage();
    };

    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdate);

    // 🔥 EXTRA SAFETY (tab change / focus)
    window.addEventListener("focus", handleAuthUpdate);
    document.addEventListener("visibilitychange", handleAuthUpdate);

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdate);
      window.removeEventListener("focus", handleAuthUpdate);
      document.removeEventListener("visibilitychange", handleAuthUpdate);
    };
  }, [syncAuthFromStorage]);

  // ✅ PERSIST SESSION
  const persistSession = useCallback((nextUser: AuthUser | null) => {
    try {
      if (!nextUser) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: nextUser })
        );
      }

      // 🔥 CRITICAL: notify immediately
      window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
    } catch (err) {
      console.error("Persist session error:", err);
    }
  }, []);

  const openLoginModal = useCallback((options?: OpenLoginModalOptions) => {
    if (options?.accountType) setActiveAccountType(options.accountType);
    if (options?.intent) setLoginIntent(options.intent);
    if (options?.redirectAfterLogin !== undefined) {
      setRedirectAfterLogin(options.redirectAfterLogin);
    }
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const sendOtp = useCallback(
    async (mobile: string, accountType: AccountType) => {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, accountType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "OTP send failed");
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (mobile: string, otp: string, accountType: AccountType) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp, accountType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "OTP verify failed");
      }

      const nextUser: AuthUser = {
        id: data.user.id,
        mobile: data.user.mobile,
        accountType: data.user.accountType,
        fullName: data.user.fullName || "",
        email: data.user.email || "",
        leadTraveller: {
          phone: data.user.mobile,
        },
      };

      setUser(nextUser);
      setIsAuthenticated(true);
      setActiveAccountType(accountType);

      persistSession(nextUser);
      registerCurrentDeviceSession();

      setIsLoginModalOpen(false);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoginModalOpen(false);
    setActiveAccountType("personal");
    setLoginIntent("generic");
    setRedirectAfterLogin(null);

    persistSession(null);
  }, [persistSession]);

  const requireAuth = useCallback(
    (options?: OpenLoginModalOptions) => {
      if (isAuthenticated && user) return true;

      openLoginModal(options);
      return false;
    },
    [isAuthenticated, user, openLoginModal]
  );

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoginModalOpen,
      activeAccountType,
      loginIntent,
      redirectAfterLogin,
      openLoginModal,
      closeLoginModal,
      setActiveAccountType,
      sendOtp,
      verifyOtp,
      logout,
      requireAuth,
    }),
    [
      isAuthenticated,
      user,
      isLoginModalOpen,
      activeAccountType,
      loginIntent,
      redirectAfterLogin,
      openLoginModal,
      closeLoginModal,
      sendOtp,
      verifyOtp,
      logout,
      requireAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </AuthContext.Provider>
  );
}