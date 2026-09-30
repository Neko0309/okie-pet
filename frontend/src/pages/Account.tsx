import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/auth";
import "./Account.css";

export default function Account() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="account account--centered">{t("account.loading")}</div>;
  }

  return user ? <ProfileCard /> : <AuthForm />;
}

function ProfileCard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="account">
      <div className="account__profile">
        <div className="account__avatar">{user.full_name.slice(0, 1)}</div>
        <p className="account__name">{user.full_name}</p>
        <p className="account__email">{user.email}</p>
        {user.is_admin && <span className="account__badge">{t("account.admin_badge")}</span>}
      </div>
      <Link to="/orders" className="account__orders-link">
        {t("nav.orders")}
      </Link>
      {user.is_admin && (
        <Link to="/admin" className="account__orders-link">
          Admin
        </Link>
      )}
      <button type="button" className="account__logout" onClick={logout}>
        {t("account.logout")}
      </button>
    </div>
  );
}

function AuthForm() {
  const { t } = useTranslation();
  const {
    login,
    register,
    errorKey,
    errorDetail,
    unverifiedEmail,
    resendCode,
    clearUnverifiedEmail,
  } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName);
        setPendingVerifyEmail(email);
      }
    } catch {
      // error surfaced via useAuth().errorKey / errorDetail / unverifiedEmail
    } finally {
      setSubmitting(false);
    }
  }

  const verifyEmailTarget = pendingVerifyEmail ?? unverifiedEmail;
  if (verifyEmailTarget) {
    return (
      <VerifyCodeForm
        email={verifyEmailTarget}
        onBack={() => {
          setPendingVerifyEmail(null);
          clearUnverifiedEmail();
        }}
        resendCode={resendCode}
      />
    );
  }

  const errorMessage = errorDetail ?? (errorKey ? t(errorKey) : null);

  return (
    <div className="account account--centered">
      <div className="auth-card">
        <div className="auth-card__switch">
          <button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            {t("account.login")}
          </button>
          <button
            type="button"
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            {t("account.register")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-card__form">
          {mode === "register" && (
            <input
              type="text"
              placeholder={t("account.nickname_placeholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder={t("account.email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("account.password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {errorMessage && <p className="auth-card__error">{errorMessage}</p>}
          <button type="submit" className="auth-card__submit" disabled={submitting}>
            {submitting
              ? t("account.submitting")
              : mode === "login"
                ? t("account.login")
                : t("account.register")}
          </button>
        </form>
      </div>
    </div>
  );
}

function VerifyCodeForm({
  email,
  onBack,
  resendCode,
}: {
  email: string;
  onBack: () => void;
  resendCode: (email: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const { verifyEmail, errorKey } = useAuth();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await verifyEmail(email, code);
    } catch {
      // error surfaced via useAuth().errorKey
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendState("sending");
    try {
      await resendCode(email);
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  }

  return (
    <div className="account account--centered">
      <div className="auth-card">
        <p className="auth-card__verify-intro">
          {t("account.verify_intro", { email })}
        </p>
        <form onSubmit={handleSubmit} className="auth-card__form">
          <input
            type="text"
            inputMode="numeric"
            placeholder={t("account.code_placeholder")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
          {errorKey && <p className="auth-card__error">{t(errorKey)}</p>}
          <button type="submit" className="auth-card__submit" disabled={submitting}>
            {submitting ? t("account.submitting") : t("account.verify_submit")}
          </button>
        </form>
        <button
          type="button"
          className="auth-card__resend"
          onClick={handleResend}
          disabled={resendState === "sending"}
        >
          {resendState === "sent"
            ? t("account.code_resent")
            : t("account.resend_code")}
        </button>
        <button type="button" className="auth-card__back" onClick={onBack}>
          {t("account.back")}
        </button>
      </div>
    </div>
  );
}
