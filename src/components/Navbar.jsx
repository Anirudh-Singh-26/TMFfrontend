import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* LEFT LOGO */}
      <Link
        to="/dashboard"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "-0.02em",
          }}
        >
          TaskFlow
        </span>

        <span
          style={{
            fontSize: "0.65rem",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            padding: "2px 7px",
            borderRadius: "4px",
            fontFamily: "var(--mono)",
            letterSpacing: "0.05em",
          }}
        >
          BETA
        </span>
      </Link>

      {/* RIGHT USER SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* USER INFO */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "flex",
              textAlign: "center",
              alignItems: "center",

            }}
          >
            {user?.name}
          </div>

          <span className={`badge badge-${user?.role}`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>

        {/* LOGOUT */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
