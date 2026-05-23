"use client";

import { useState } from "react";

const PASSWORD_STORAGE_KEY = "tpl_account_password_v1";

export default function ResetPasswordSection() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateNewPassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleResetPassword = () => {
    setPasswordMessage("");
    setPasswordError("");

    const savedPassword =
      typeof window !== "undefined"
        ? window.localStorage.getItem(PASSWORD_STORAGE_KEY) || "Admin@123"
        : "Admin@123";

    if (!oldPassword.trim()) {
      setPasswordError("Please enter old password.");
      return;
    }

    if (oldPassword !== savedPassword) {
      setPasswordError("Old password is incorrect.");
      return;
    }

    if (!validateNewPassword(newPassword)) {
      setPasswordError(
        "New password must be 8+ characters and include uppercase, lowercase, number and special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Confirm password does not match.");
      return;
    }

    window.localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
    setPasswordMessage("Password reset successfully.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    window.setTimeout(() => {
      setPasswordMessage("");
    }, 2500);
  };

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Reset Password
        </h1>
        <p className="mt-1 text-[12px] text-slate-500">
          Password must be at least 8 characters and include uppercase, lowercase, number and special character.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6 max-w-2xl">
        {passwordError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
            {passwordError}
          </div>
        ) : null}

        {passwordMessage ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12px] text-green-700">
            {passwordMessage}
          </div>
        ) : null}

        <PasswordField
          label="OLD PASSWORD"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          visible={showOldPassword}
          onToggle={() => setShowOldPassword((prev) => !prev)}
        />

        <PasswordField
          label="NEW PASSWORD"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          visible={showNewPassword}
          onToggle={() => setShowNewPassword((prev) => !prev)}
        />

        <PasswordField
          label="CONFIRM PASSWORD"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((prev) => !prev)}
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setPasswordError("");
              setPasswordMessage("");
            }}
            className="h-10 rounded-xl border border-gray-300 px-5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            className="h-10 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-semibold tracking-wide text-white transition hover:bg-[#094ee0]"
          >
            RESET PASSWORD
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 pr-16 text-[14px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b5fff]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-slate-500 hover:text-slate-800"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}