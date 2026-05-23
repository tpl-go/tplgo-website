export type AccountType = "personal" | "partner";

export type AuthUser = {
  id: string;
  accountType: AccountType;
  mobile: string;
  email?: string;
  fullName?: string;
  leadTraveller?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    email?: string;
    phone?: string;
  };
};

export type AuthIntent =
  | "generic"
  | "booking"
  | "payment"
  | "traveller"
  | "ai"
  | "partner";

export type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoginModalOpen: boolean;
  activeAccountType: AccountType;
  loginIntent: AuthIntent;
  redirectAfterLogin?: string | null;
};

export type OpenLoginModalOptions = {
  accountType?: AccountType;
  intent?: AuthIntent;
  redirectAfterLogin?: string | null;
};

export type SendOtpPayload = {
  mobile: string;
  accountType: AccountType;
};

export type VerifyOtpPayload = {
  mobile: string;
  otp: string;
  accountType: AccountType;
};