import { useState } from "react";

const C = {
  navy: "#1e3a8a", gold: "#d97706", white: "#ffffff",
  border: "#e2e8f0", muted: "#64748b", red: "#dc2626",
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://lk-school-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("lk_admin_token", data.token);
        localStorage.setItem("lk_admin_role", data.role);
        localStorage.setItem("lk_admin_name", data.name);
        onLogin(data.role, data.name);
      } else {
        setError("Invalid username or password");
      }
    } catch (e) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${C.navy} 0%, #1e40af 50%, #1e3a8a 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: 20,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(217,119,6,0.1)" }} />

      <div style={{ background: C.white, borderRadius: 24, padding: 48, width: "100%", maxWidth: 420, boxShadow: "0 40px 120px rgba(0,0,0,0.4)", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${C.navy}, #1e40af)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px" }}>🏫</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>Lord Krishna The School</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Admin Portal Login</div>
          <div style={{ width: 50, height: 3, background: C.gold, borderRadius: 2, margin: "12px auto 0" }} />
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: C.red, padding: "12px 16px", borderRadius: 10, fontSize: 14, marginBottom: 20, textAlign: "center", fontWeight: 500 }}>
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 7 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter username" style={{ width: "100%", padding: "12px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 7 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter password" style={{ width: "100%", padding: "12px 48px 12px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? C.muted : C.navy, color: C.white, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loading ? "⏳ Logging in..." : "🔐 Login to Portal"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted }}>🔒 Authorized personnel only</div>
      </div>
    </div>
  );
}