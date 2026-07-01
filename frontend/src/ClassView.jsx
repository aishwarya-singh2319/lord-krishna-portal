import { useState } from "react";
import { studentsAPI, feesAPI } from "./api";

const C = {
  navy: "#1e3a8a", gold: "#d97706", white: "#ffffff",
  bg: "#f0f4ff", card: "#ffffff", text: "#0f172a",
  muted: "#64748b", green: "#16a34a", red: "#dc2626", border: "#e2e8f0",
};

const CLASSES = ["Pre-Nursery","Nursery","KG","Class I","Class II","Class III","Class IV","Class V","Class VI","Class VII","Class VIII","Class IX","Class X"];
const CASTE_OPTIONS = ["General", "OBC", "SC", "ST", "EWS"];

function Avatar({ name, photo, size = 40 }) {
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.gold}` }} />;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: `2px solid ${C.gold}`, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, style = {}, small }) {
  const styles = {
    primary: { background: C.navy, color: C.white },
    gold:    { background: C.gold, color: C.white },
    outline: { background: "transparent", color: C.navy, border: `1.5px solid ${C.navy}` },
    danger:  { background: C.red, color: C.white },
    green:   { background: C.green, color: C.white },
  };
  return (
    <button onClick={onClick} style={{ ...styles[variant], border: "none", borderRadius: 8, padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 13 : 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, ...style }}>
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</label>}
      <input {...props} style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", fontFamily: "inherit", ...props.style }} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</label>}
      <select {...props} style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 14, background: C.white, fontFamily: "inherit", ...props.style }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `2px solid #fef3c7`, background: C.navy, borderRadius: "16px 16px 0 0" }}>
          <h3 style={{ color: C.white, margin: 0, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.white, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function StudentEditForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: "", class: CLASSES[0], roll: "", phone: "",
    father: "", mother: "", aadhar: "", pan_number: "", dob: "", caste: "General",
    address: "", photo: null, admitted: new Date().toISOString().slice(0, 10)
  });

  const valid = form.name.trim() && form.roll.trim() && form.phone.trim();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Avatar name={form.name || "?"} photo={form.photo} size={72} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student Name" />
        <Select label="Class *" value={form.class} options={CLASSES} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} />
        <Input label="Roll Number *" value={form.roll} onChange={e => setForm(f => ({ ...f, roll: e.target.value }))} placeholder="V-01" />
        <Input label="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="98XXXXXXXX" />
        <Input label="Father's Name" value={form.father} onChange={e => setForm(f => ({ ...f, father: e.target.value }))} />
        <Input label="Mother's Name" value={form.mother} onChange={e => setForm(f => ({ ...f, mother: e.target.value }))} />
        <Input label="Date of Birth" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
        <Select label="Caste" value={form.caste} options={CASTE_OPTIONS} onChange={e => setForm(f => ({ ...f, caste: e.target.value }))} />
        <Input label="Aadhar Number" value={form.aadhar} onChange={e => setForm(f => ({ ...f, aadhar: e.target.value }))} placeholder="XXXX XXXX XXXX" />
        <Input label="PAN Number" value={form.pan_number} onChange={e => setForm(f => ({ ...f, pan_number: e.target.value }))} />
        <Input label="Admission Date" type="date" value={form.admitted} onChange={e => setForm(f => ({ ...f, admitted: e.target.value }))} />
      </div>
      <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="House No., Area, City" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={() => valid && onSave(form)} style={{ opacity: valid ? 1 : .5 }}>💾 Save</Btn>
      </div>
    </div>
  );
}

export default function ClassView({ className, students, setStudents, fees, setFees, onBack }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const classStudents = students.filter(s => s.class === className);
  const filtered = classStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const reloadData = async () => {
    const [sRes, fRes] = await Promise.all([studentsAPI.getAll(), feesAPI.getAll()]);
    setStudents(sRes.data);
    const feeMap = {};
    fRes.data.forEach(f => { feeMap[f.student_id] = { total: f.total_fees, paid: f.paid_amount }; });
    setFees(feeMap);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('class', form.class);
      data.append('roll_no', form.roll);
      data.append('phone', form.phone || '0000000000');
      data.append('father_name', form.father || '');
      data.append('mother_name', form.mother || '');
      data.append('aadhar_no', form.aadhar || '');
      data.append('pan_number', form.pan_number || '');
      data.append('dob', form.dob || '');
      data.append('caste', form.caste || '');
      data.append('address', form.address || '');
      data.append('admitted_on', form.admitted || new Date().toISOString().slice(0, 10));

      if (modal === "add") {
        await studentsAPI.create(data);
      } else {
        await studentsAPI.update(modal.id, data);
      }
      await reloadData();
      setModal(null);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await studentsAPI.delete(id);
      await reloadData();
      setConfirmDel(null);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div>
      <Btn variant="outline" onClick={onBack} style={{ marginBottom: 20 }}>← Back to Dashboard</Btn>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, color: C.navy, fontWeight: 700, margin: 0 }}>🎓 {className}</h2>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{classStudents.length} students enrolled</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or roll" style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, width: 240, fontFamily: "inherit" }} />
          <Btn variant="gold" onClick={() => setModal("add")}>➕ Add Student</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(s => {
          const fee = fees[s.id] || { total: 0, paid: 0 };
          const due = fee.total - fee.paid;
          return (
            <div key={s.id} style={{ background: C.card, borderRadius: 14, boxShadow: "0 2px 12px rgba(30,58,138,.08)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Avatar name={s.name} photo={s.photo_url} size={48} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>Roll: {s.roll_no} · 📞 {s.phone}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {s.father_name && `👨 ${s.father_name}`} {s.caste && `· ${s.caste}`} {s.dob && `· 🎂 ${s.dob}`}
                </div>
              </div>
              <div style={{ fontSize: 12 }}>
                {due > 0 ? <span style={{ color: C.red, fontWeight: 600 }}>Due: ₹{due.toLocaleString("en-IN")}</span> : <span style={{ color: C.green, fontWeight: 600 }}>Fees Clear</span>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn small variant="outline" onClick={() => setModal({
                  ...s, roll: s.roll_no, admitted: s.admitted_on,
                  father: s.father_name || '', mother: s.mother_name || '',
                  aadhar: s.aadhar_no || '', pan_number: s.pan_number || '',
                  dob: s.dob || '', caste: s.caste || 'General', photo: s.photo_url,
                })}>✏️ Edit</Btn>
                <Btn small variant="danger" onClick={() => setConfirmDel(s)}>🗑️</Btn>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.muted }}>No students found in {className}.</div>}
      </div>

      {modal && (
        <Modal title={modal === "add" ? `Add Student to ${className}` : `Edit — ${modal.name}`} onClose={() => setModal(null)}>
          <StudentEditForm initial={modal !== "add" ? modal : { class: className, name: "", roll: "", phone: "", father: "", mother: "", aadhar: "", pan_number: "", dob: "", caste: "General", address: "", photo: null, admitted: new Date().toISOString().slice(0,10) }} onSave={handleSave} onClose={() => setModal(null)} />
          {saving && <div style={{ textAlign: "center", color: C.navy, marginTop: 10 }}>Saving...</div>}
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDel(null)}>
          <p style={{ marginBottom: 20 }}>Delete <b>{confirmDel.name}</b>? This cannot be undone.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => handleDelete(confirmDel.id)}>Yes, Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}