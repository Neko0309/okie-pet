import { useState, type FormEvent } from "react";
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
      <button type="button" className="account__logout" onClick={logout}>
        {t("account.logout")}
      </button>
    </div>
  );
}

function AuthForm() {
  const { t } = useTranslation();
  const { login, register, errorKey, errorDetail } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
    } catch {
      // error surfaced via useAuth().errorKey / errorDetail
    } finally {
      setSubmitting(false);
    }
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
