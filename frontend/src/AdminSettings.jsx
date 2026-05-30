import { useState } from "react";

const C = {
  navy: "#1e3a8a", gold: "#d97706", white: "#ffffff",
  border: "#e2e8f0", muted: "#64748b", red: "#dc2626",
  green: "#16a34a", bg: "#f0f4ff",
};

function Card({ children, style = {} }) {
  return <div style={{ background: C.white, borderRadius: 14, boxShadow: "0 2px 12px rgba(30,58,138,.08)", padding: 24, ...style }}>{children}</div>;
}

export default function AdminSettings({ adminName, onLogout }) {
  const [users, setUsers] = useState([
    { username: 'friend1', name: 'Sub Admin 1', role: 'subadmin' },
    { username: 'friend2', name: 'Sub Admin 2', role: 'subadmin' },
  ]);
  const [selectedUser, setSelectedUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      setMsg("❌ Please select a user and enter new password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://lk-school-backend.onrender.com/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminToken: localStorage.getItem("lk_admin_token"),
          targetUsername: selectedUser,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Password changed successfully!");
        setNewPassword("");
        setSelectedUser("");
      } else {
        setMsg("❌ " + data.error);
      }
    } catch (e) {
      setMsg("❌ Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, color: C.navy, marginBottom: 24, fontWeight: 700 }}>⚙️ Admin Settings</h2>

      {/* Current Admin Info */}
      <Card style={{ marginBottom: 20, borderTop: `4px solid ${C.gold}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👑</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.navy }}>{adminName}</div>
            <div style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>Super Admin — Full Access</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>You have complete control over the portal</div>
          </div>
        </div>
      </Card>

      {/* Sub Admin Users */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>👥 Sub Admin Users</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {users.map(u => (
            <div key={u.username} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, color: C.navy }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>@{u.username} · Sub Admin</div>
                </div>
              </div>
              <div style={{ background: "#dbeafe", color: C.navy, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Limited Access
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Change Password */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>🔑 Change Sub Admin Password</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 7 }}>Select User</label>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: "inherit" }}>
              <option value="">— Select Sub Admin —</option>
              <option value="friend1">Sub Admin 1 (@friend1)</option>
              <option value="friend2">Sub Admin 2 (@friend2)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.navy, display: "block", marginBottom: 7 }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontFamily: "inherit" }} />
          </div>
          {msg && <div style={{ padding: "10px 14px", borderRadius: 8, background: msg.includes("✅") ? "#dcfce7" : "#fee2e2", color: msg.includes("✅") ? C.green : C.red, fontSize: 14, fontWeight: 500 }}>{msg}</div>}
          <button onClick={handleChangePassword} disabled={loading} style={{ background: C.navy, color: C.white, border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {loading ? "Saving..." : "🔑 Update Password"}
          </button>
        </div>
      </Card>

      {/* Access Summary */}
      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>🛡️ Access Levels</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: C.navy, color: C.white }}>
              <th style={{ padding: "10px 14px", textAlign: "left" }}>Feature</th>
              <th style={{ padding: "10px 14px", textAlign: "center" }}>👑 Main Admin</th>
              <th style={{ padding: "10px 14px", textAlign: "center" }}>👤 Sub Admins</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Dashboard", true, true],
              ["View Students", true, true],
              ["Add / Edit / Delete Students", true, true],
              ["Fee Management", true, true],
              ["ID Card Generator", true, true],
              ["Results Management", true, true],
              ["Admin Settings", true, false],
              ["Change Passwords", true, false],
              ["Manage Users", true, false],
            ].map(([feature, admin, sub], i) => (
              <tr key={feature} style={{ background: i % 2 === 0 ? C.white : C.bg, borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 14px", fontWeight: 500 }}>{feature}</td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>{admin ? "✅" : "❌"}</td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>{sub ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}