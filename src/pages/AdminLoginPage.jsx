import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(
          "/api/admin/session"
        );

        const data = await response.json();

        if (data.authenticated) {
          navigate("/admin");
          return;
        }
      } catch (error) {
        // User can still use the login form.
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError("كلمة المرور غير صحيحة.");
        return;
      }

      navigate("/admin");
    } catch (error) {
      setError(
        "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div
        className="admin-login-loading"
        dir="rtl"
      >
        جاري التحقق...
      </div>
    );
  }

  return (
    <div className="admin-login-page" dir="rtl">
      <div className="admin-login-card">
        <span className="admin-login-label">
          Saint Mina Scouts
        </span>

        <h1>لوحة التحكم</h1>

        <p>
          قم بتسجيل الدخول لإدارة المحتوى التدريبي.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-password">
            كلمة المرور
          </label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="أدخل كلمة المرور"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "جاري تسجيل الدخول..."
              : "تسجيل الدخول"}
          </button>
        </form>

        <button
          className="admin-login-back"
          onClick={() => navigate("/")}
        >
          العودة إلى الموقع
        </button>
      </div>
    </div>
  );
}

export default AdminLoginPage;