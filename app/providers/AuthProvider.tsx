"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import { clearPartnerProfilePreference } from "@/app/lib/partner/partnerProfilePreference";
import {
  readGoogleReturnOutcome,
  removeGoogleReturnQuery,
} from "@/app/lib/auth/googleReturn";

type AuthContextType = AuthState & {
  openLoginModal: (options?: OpenLoginModalOptions) => void;
  closeLoginModal: () => void;
  setActiveAccountType: (type: AccountType) => void;
  sendOtp: (mobile: string, accountType: AccountType) => Promise<SendOtpResult>;
  sendEmailOtp: (email: string, accountType: AccountType) => Promise<SendOtpResult>;
  verifyOtp: (
    mobile: string,
    otp: string,
    accountType: AccountType
  ) => Promise<void>;
  verifyEmailOtp: (
    email: string,
    otp: string,
    accountType: AccountType
  ) => Promise<void>;
  verifyOtpForSession: (
    mobile: string,
    otp: string,
    accountType: AccountType
  ) => Promise<AuthUser>;
  verifyEmailOtpForSession: (
    email: string,
    otp: string,
    accountType: AccountType
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  adoptRecoveredPartnerSession: (session: { token: string; expiresAt: string } | null) => Promise<void>;
  adoptLinkedUserSession: (session: { token: string; expiresAt: string }, expectedOwner: string, previousToken: string | null) => Promise<void>;
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
    resendAvailableAt?: string | undefined;
    expiresAt?: string | undefined;
  } | undefined;
  error?: {
    code?: string | undefined;
    message?: string | undefined;
  } | undefined;
  message?: string | undefined;
};

export type SendOtpResult = {
  resendAvailableAt?: string | undefined;
  expiresAt?: string | undefined;
};

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginModalError, setLoginModalError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeAccountType, setActiveAccountType] =
    useState<AccountType>("personal");
  const [loginIntent, setLoginIntent] = useState<AuthIntent>("generic");
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null
  );
  const sessionRestoreSequenceRef = useRef(0);
  const logoutRestoreBlockedRef = useRef(false);
  const currentOwnerRef = useRef(user?.id);
  const validatedTokenRef = useRef<string | null | undefined>(undefined);
  useLayoutEffect(() => { currentOwnerRef.current = user?.id; }, [user?.id]);

  const clearVisibleAuthState = useCallback(() => {
    validatedTokenRef.current = undefined;
    setUser(null);
    setIsAuthenticated(false);
    setActiveAccountType("personal");
    setAuthError(null);
  }, []);

  // ✅ PERSIST SESSION
  const persistSession = useCallback((nextUser: AuthUser | null, session?: StoredAuthSession["session"], notify = true) => {
    try {
      if (!nextUser) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        validatedTokenRef.current = undefined;
      } else {
        const token = session?.token;
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user: nextUser,
            ...(token ? { token, sessionToken: token, session } : {}),
          })
        );
        validatedTokenRef.current = token ?? null;
      }

      if (notify) {
        window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT, { detail: { source: "auth-provider" } }));
      }
    } catch (err) {
      console.error("Persist session error:", err);
    }
  }, []);

  const hydrateBackendCookieSession = useCallback(async () => {
    const restoreSequence = sessionRestoreSequenceRef.current + 1;
    sessionRestoreSequenceRef.current = restoreSequence;
    const isCurrentRestore = () => sessionRestoreSequenceRef.current === restoreSequence;

    if (logoutRestoreBlockedRef.current) {
      clearVisibleAuthState();
      return false;
    }

    if (!API_BASE_URL) {
      if (isCurrentRestore()) {
        clearVisibleAuthState();
        setAuthError("TPL account service is unavailable.");
      }
      return false;
    }
    try {
      const authResult = await readBackendSession(readStoredAuthToken());
      if (!isCurrentRestore()) return false;
      const nextUser = authResult.user;
      setUser(nextUser);
      setIsAuthenticated(true);
      setActiveAccountType(nextUser.accountType || "personal");
      setAuthError(null);
      persistSession(nextUser, authResult.session, false);
      return true;
    } catch (error) {
      if (!isCurrentRestore()) return false;
      clearVisibleAuthState();
      if (isUnauthorizedAuthError(error)) {
        persistSession(null, undefined, false);
      } else {
        setAuthError("We could not confirm your TPL session. Please retry.");
      }
      return false;
    }
  }, [clearVisibleAuthState, persistSession]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void hydrateBackendCookieSession().finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hydrateBackendCookieSession]);

  useEffect(() => {
    const outcome = readGoogleReturnOutcome(window.location.search);
    if (outcome.kind === "none") return;
    const cleanUrl = `${window.location.pathname}${removeGoogleReturnQuery(window.location.search)}${window.location.hash}`;
    window.history.replaceState({}, "", cleanUrl || "/");
    let cancelled = false;
    const timer = window.setTimeout(() => {
    if (outcome.kind === "success") {
      void hydrateBackendCookieSession().then((hydrated) => {
        if (cancelled) return;
        if (hydrated) {
          setLoginModalError(null);
          setIsLoginModalOpen(false);
          const safeRedirect = normalizeRedirectAfterLogin(redirectAfterLogin);
          if (safeRedirect) {
            setRedirectAfterLogin(null);
            window.location.assign(safeRedirect);
          }
        }
      });
    } else {
      setLoginModalError(outcome.message);
      setIsLoginModalOpen(true);
    }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hydrateBackendCookieSession, redirectAfterLogin]);

  // ✅ LISTEN TO AUTH CHANGE
  useEffect(() => {
    const handleAuthUpdate = (event?: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail &&
        typeof event.detail === "object" &&
        event.detail.source === "auth-provider"
      ) {
        return;
      }
      if (readStoredAuthToken()) {
        logoutRestoreBlockedRef.current = false;
      }
      // Focus revalidates an already server-validated session without destroying
      // an in-progress Google reauthentication flow. Known identity changes clear immediately.
      if (event?.type === AUTH_UPDATED_EVENT || !currentOwnerRef.current ||
          validatedTokenRef.current !== readStoredAuthToken()) clearVisibleAuthState();
      void hydrateBackendCookieSession();
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
  }, [clearVisibleAuthState, hydrateBackendCookieSession]);

  const openLoginModal = useCallback((options?: OpenLoginModalOptions) => {
    if (options?.accountType) setActiveAccountType(options.accountType);
    if (options?.intent) setLoginIntent(options.intent);
    if (options?.redirectAfterLogin !== undefined) {
      setRedirectAfterLogin(options.redirectAfterLogin);
    }
    setLoginModalError(null);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalError(null);
    setIsLoginModalOpen(false);
  }, []);

  const sendOtp = useCallback(
    async (mobile: string, accountType: AccountType) => {
      try {
        return await sendBackendOtp(mobile, accountType);
      } catch (error) {
        if (!canUseLocalAuthFallback(error)) throw error;
        return await sendLocalOtp(mobile, accountType);
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
      setAuthError(null);
      logoutRestoreBlockedRef.current = false;

      persistSession(nextUser, authResult.session);
      registerCurrentDeviceSession();

      setIsLoginModalOpen(false);
      const safeRedirect = normalizeRedirectAfterLogin(redirectAfterLogin);
      if (safeRedirect) {
        setRedirectAfterLogin(null);
        window.location.assign(safeRedirect);
      }
    },
    [persistSession, redirectAfterLogin]
  );

  const verifyEmailOtp = useCallback(
    async (email: string, otp: string, accountType: AccountType) => {
      const authResult = await verifyBackendEmailOtp(email, otp, accountType);
      const nextUser = authResult.user;

      setUser(nextUser);
      setIsAuthenticated(true);
      setActiveAccountType(accountType);
      setAuthError(null);
      logoutRestoreBlockedRef.current = false;

      persistSession(nextUser, authResult.session);
      registerCurrentDeviceSession();

      setIsLoginModalOpen(false);
      const safeRedirect = normalizeRedirectAfterLogin(redirectAfterLogin);
      if (safeRedirect) {
        setRedirectAfterLogin(null);
        window.location.assign(safeRedirect);
      }
    },
    [persistSession, redirectAfterLogin]
  );

  const sendEmailOtp = useCallback(
    async (email: string, accountType: AccountType) => {
      return await sendBackendEmailOtp(email, accountType);
    },
    []
  );

  const verifyOtpForSession = useCallback(
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
      setAuthError(null);
      logoutRestoreBlockedRef.current = false;
      persistSession(nextUser, authResult.session);
      registerCurrentDeviceSession();

      return nextUser;
    },
    [persistSession]
  );

  const verifyEmailOtpForSession = useCallback(
    async (email: string, otp: string, accountType: AccountType) => {
      const authResult = await verifyBackendEmailOtp(email, otp, accountType);
      const nextUser = authResult.user;

      setUser(nextUser);
      setIsAuthenticated(true);
      setActiveAccountType(accountType);
      setAuthError(null);
      logoutRestoreBlockedRef.current = false;
      persistSession(nextUser, authResult.session);
      registerCurrentDeviceSession();

      return nextUser;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    clearPartnerProfilePreference();
    logoutRestoreBlockedRef.current = true;
    sessionRestoreSequenceRef.current += 1;
    const token = readStoredAuthToken();

    setIsAuthLoading(false);
    clearVisibleAuthState();
    setIsLoginModalOpen(false);
    setLoginIntent("generic");
    setRedirectAfterLogin(null);

    persistSession(null);
    try {
      await logoutBackendSession(token);
      logoutRestoreBlockedRef.current = false;
    } catch (error) {
      clearVisibleAuthState();
      persistSession(null, undefined, false);
      const message = error instanceof Error ? error.message : 'Server logout could not be confirmed.';
      setAuthError(message);
    }
  }, [clearVisibleAuthState, persistSession]);

  const requireAuth = useCallback(
    (options?: OpenLoginModalOptions) => {
      if (isAuthenticated && user) return true;

      openLoginModal(options);
      return false;
    },
    [isAuthenticated, user, openLoginModal]
  );

  const adoptRecoveredPartnerSession = useCallback(async (session: { token: string; expiresAt: string } | null) => {
    const resolved = session
      ? { user: await readBackendMeUser(session.token), session }
      : await readBackendSession(null);
    if (!resolved.session?.token) throw new Error("Sign in again to open your Partner account.");
    clearPartnerProfilePreference();
    logoutRestoreBlockedRef.current = false;
    persistSession(resolved.user, resolved.session);
    setUser(resolved.user);
    setIsAuthenticated(true);
    setActiveAccountType('partner');
    setAuthError(null);
  }, [persistSession]);

  const adoptLinkedUserSession = useCallback(async (session: { token: string; expiresAt: string }, expectedOwner: string, previousToken: string | null) => {
    const sequence = sessionRestoreSequenceRef.current;
    const resolved = await readBackendMeUser(session.token);
    if (resolved.id !== expectedOwner || currentOwnerRef.current !== expectedOwner
      || logoutRestoreBlockedRef.current || sessionRestoreSequenceRef.current !== sequence
      || readStoredAuthToken() !== previousToken) throw new Error("Your account changed. Sign in again to continue.");
    sessionRestoreSequenceRef.current += 1;
    persistSession(resolved, session);
    setUser(resolved);
    setIsAuthenticated(true);
    setAuthError(null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      isAuthLoading,
      isAuthenticated,
      user,
      authError,
      isLoginModalOpen,
      activeAccountType,
      loginIntent,
      redirectAfterLogin,
      openLoginModal,
      closeLoginModal,
      setActiveAccountType,
      sendOtp,
      sendEmailOtp,
      verifyOtp,
      verifyEmailOtp,
      verifyOtpForSession,
      verifyEmailOtpForSession,
      logout,
      requireAuth,
      adoptRecoveredPartnerSession,
      adoptLinkedUserSession,
    }),
    [
      isAuthLoading,
      isAuthenticated,
      user,
      authError,
      isLoginModalOpen,
      activeAccountType,
      loginIntent,
      redirectAfterLogin,
      openLoginModal,
      closeLoginModal,
      sendOtp,
      sendEmailOtp,
      verifyOtp,
      verifyEmailOtp,
      verifyOtpForSession,
      verifyEmailOtpForSession,
      logout,
      requireAuth,
      adoptRecoveredPartnerSession,
      adoptLinkedUserSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        externalError={loginModalError}
      />
    </AuthContext.Provider>
  );
}

async function sendBackendOtp(mobile: string, accountType: AccountType): Promise<SendOtpResult> {
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
  return {
    resendAvailableAt: payload?.data?.resendAvailableAt,
    expiresAt: payload?.data?.expiresAt,
  };
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

async function sendBackendEmailOtp(email: string, accountType: AccountType): Promise<SendOtpResult> {
  if (!API_BASE_URL) throw authNetworkFallbackError("TPL API base URL is not configured.");
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/send-otp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, accountType }),
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "Email OTP send failed");
  }
  return {
    resendAvailableAt: payload?.data?.resendAvailableAt,
    expiresAt: payload?.data?.expiresAt,
  };
}

async function verifyBackendEmailOtp(
  email: string,
  otp: string,
  accountType: AccountType
): Promise<{ user: AuthUser; session?: StoredAuthSession["session"] | undefined }> {
  if (!API_BASE_URL) throw authNetworkFallbackError("TPL API base URL is not configured.");
  const token = readStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/email/verify-otp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ email, otp, accountType }),
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "Email OTP verify failed");
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
    credentials: "include",
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

async function readBackendSession(token?: string | null): Promise<{ user: AuthUser; session?: StoredAuthSession["session"] | undefined }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/session`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "Failed to load authenticated session.", response.status);
  }
  return {
    user: normalizeAuthUser(payload?.data?.user, "personal"),
    session: normalizeBackendSession(payload),
  };
}

async function logoutBackendSession(token?: string | null): Promise<void> {
  if (!API_BASE_URL) return;
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const payload = await readAuthJson(response);
  if (!response.ok || payload?.ok !== true) {
    throw authApiError(payload, "Server logout could not be confirmed.", response.status);
  }
}

async function sendLocalOtp(mobile: string, accountType: AccountType): Promise<SendOtpResult> {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, accountType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "OTP send failed");
  }
  return {
    resendAvailableAt: data?.resendAvailableAt,
    expiresAt: data?.expiresAt,
  };
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

type AuthApiError = Error & { status?: number; code?: string };

function authApiError(payload: BackendAuthResponse | null, fallbackMessage: string, status?: number): AuthApiError {
  const error = new Error(payload?.error?.message || payload?.message || fallbackMessage) as AuthApiError;
  error.status = status;
  error.code = payload?.error?.code;
  return error;
}

function isUnauthorizedAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("status" in error)) return false;
  const status = Number((error as AuthApiError).status);
  return status === 401 || status === 403;
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

function normalizeRedirectAfterLogin(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
