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
const API_BASE_URL = process.env.NEXT_PUBLIC_TPL_API_BASE_URL?.replace(/\/+$/, "") || "";

type StoredAuthSession = {
  user: AuthUser;
  token?: string | undefined;
  sessionToken?: string | undefined;
  session?: {
    token?: string | undefined;
    expiresAt?: string | undefined;
  } | undefined;
};

type BackendAuthResponse = {
  ok?: boolean;
  data?: {
    user?: unknown;
    session?: {
      token?: string | undefined;
      expiresAt?: string | undefined;
    } | undefined;
    token?: string | undefined;
    sessionToken?: string | undefined;
    developmentOtp?: string | undefined;
  } | undefined;
  error?: {
    message?: string | undefined;
  } | undefined;
  message?: string | undefined;
};

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
    const timer = window.setTimeout(syncAuthFromStorage, 0);
    return () => window.clearTimeout(timer);
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
  const persistSession = useCallback((nextUser: AuthUser | null, session?: StoredAuthSession["session"]) => {
    try {
      if (!nextUser) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        const token = session?.token;
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user: nextUser,
            ...(token ? { token, sessionToken: token, session } : {}),
          })
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
      try {
        await sendBackendOtp(mobile, accountType);
      } catch (error) {
        if (!canUseLocalAuthFallback(error)) throw error;
        await sendLocalOtp(mobile, accountType);
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (mobile: string, otp: string, accountType: AccountType) => {
      let authResult: { user: AuthUser; session?: StoredAuthSession["session"] | undefined };
      try {
        authResult = await verifyBackendOtp(mobile, otp, accountType);
      } catch (error) {
        if (!canUseLocalAuthFallback(error)) throw error;
        authResult = { user: await verifyLocalOtp(mobile, otp, accountType) };
      }

      const nextUser = authResult.user;

      setUser(nextUser);
      setIsAuthenticated(true);
      setActiveAccountType(accountType);

      persistSession(nextUser, authResult.session);
      registerCurrentDeviceSession();

      setIsLoginModalOpen(false);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    const token = readStoredAuthToken();
    if (token) void logoutBackendSession(token);

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

async function sendBackendOtp(mobile: string, accountType: AccountType): Promise<void> {
  if (!API_BASE_URL) throw authNetworkFallbackError("TPL API base URL is not configured.");
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ mobile, accountType }),
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "OTP send failed");
  }
}

async function verifyBackendOtp(
  mobile: string,
  otp: string,
  accountType: AccountType
): Promise<{ user: AuthUser; session?: StoredAuthSession["session"] | undefined }> {
  if (!API_BASE_URL) throw authNetworkFallbackError("TPL API base URL is not configured.");
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ mobile, otp, accountType }),
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "OTP verify failed");
  }

  const session = normalizeBackendSession(payload);
  const user = session?.token
    ? await readBackendMeUser(session.token).catch(() => normalizeAuthUser(payload?.data?.user, accountType))
    : normalizeAuthUser(payload?.data?.user, accountType);
  return { user, session };
}

async function readBackendMeUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "Failed to load authenticated user.");
  }
  const data = payload?.data as { user?: unknown } | undefined;
  return normalizeAuthUser(data?.user, "personal");
}

async function logoutBackendSession(token: string): Promise<void> {
  if (!API_BASE_URL) return;
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
  }
}

async function sendLocalOtp(mobile: string, accountType: AccountType): Promise<void> {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, accountType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "OTP send failed");
  }
}

async function verifyLocalOtp(mobile: string, otp: string, accountType: AccountType): Promise<AuthUser> {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, otp, accountType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "OTP verify failed");
  }
  return normalizeAuthUser(data.user, accountType);
}

async function readAuthJson(response: Response): Promise<BackendAuthResponse | null> {
  try {
    const parsed = await response.json();
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeBackendSession(payload: BackendAuthResponse | null): StoredAuthSession["session"] | undefined {
  const token = payload?.data?.session?.token || payload?.data?.token || payload?.data?.sessionToken;
  if (!token) return undefined;
  return {
    token,
    expiresAt: payload?.data?.session?.expiresAt,
  };
}

function normalizeAuthUser(input: unknown, fallbackAccountType: AccountType): AuthUser {
  const record = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  const mobile = stringValue(record.mobile);
  const accountType = record.accountType === "partner" || record.accountType === "personal"
    ? record.accountType
    : fallbackAccountType;
  const leadTraveller = record.leadTraveller && typeof record.leadTraveller === "object" && !Array.isArray(record.leadTraveller)
    ? record.leadTraveller as AuthUser["leadTraveller"]
    : undefined;

  return {
    id: stringValue(record.id) || `tpl_${accountType}_${mobile}`,
    mobile,
    accountType,
    fullName: stringValue(record.fullName),
    email: stringValue(record.email),
    leadTraveller: {
      ...leadTraveller,
      phone: leadTraveller?.phone || mobile,
    },
  };
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function authApiError(payload: BackendAuthResponse | null, fallbackMessage: string): Error {
  return new Error(payload?.error?.message || payload?.message || fallbackMessage);
}

function authNetworkFallbackError(message: string): Error {
  const error = new Error(message);
  error.name = "AuthNetworkFallbackError";
  return error;
}

function canUseLocalAuthFallback(error: unknown): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return error instanceof TypeError ||
    (error instanceof Error && error.name === "AuthNetworkFallbackError");
}

function readStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as StoredAuthSession : null;
    return parsed?.token || parsed?.sessionToken || parsed?.session?.token || null;
  } catch {
    return null;
  }
}
