import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth";
import "./Account.css";

export default function Account() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="account account--centered">加载中…</div>;
  }

  return user ? <ProfileCard /> : <AuthForm />;
}

function ProfileCard() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="account">
      <div className="account__profile">
        <div className="account__avatar">{user.full_name.slice(0, 1)}</div>
        <p className="account__name">{user.full_name}</p>
        <p className="account__email">{user.email}</p>
        {user.is_admin && <span className="account__badge">管理员</span>}
      </div>
      <button type="button" className="account__logout" onClick={logout}>
        退出登录
      </button>
    </div>
  );
}

function AuthForm() {
  const { login, register, error } = useAuth();
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
      // error surfaced via useAuth().error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="account account--centered">
      <div className="auth-card">
        <div className="auth-card__switch">
          <button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            登录
          </button>
          <button
            type="button"
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-card__form">
          {mode === "register" && (
            <input
              type="text"
              placeholder="昵称"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="auth-card__error">{error}</p>}
          <button type="submit" className="auth-card__submit" disabled={submitting}>
            {submitting ? "请稍候…" : mode === "login" ? "登录" : "注册"}
          </button>
        </form>
      </div>
    </div>
  );
}
