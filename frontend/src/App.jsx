import { useState, useRef, useEffect } from "react";
import { studentsAPI, feesAPI } from './api';
import IDCardPDF from './IDCardPDF';
import Results from './Results';

const CLASSES = ["Pre-Nursery","Nursery","KG","Class I","Class II","Class III","Class IV","Class V","Class VI","Class VII","Class VIII","Class IX","Class X"];

const C = {
  navy:"#1e3a8a", navyD:"#172554", gold:"#d97706", goldL:"#fef3c7",
  white:"#ffffff", bg:"#f0f4ff", card:"#ffffff", text:"#0f172a",
  muted:"#64748b", green:"#16a34a", red:"#dc2626", border:"#e2e8f0",
};

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

function Avatar({ name, photo, size = 40 }) {
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.gold}` }} />;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, border: `2px solid ${C.gold}`, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ label, color }) {
  const map = { green: ["#dcfce7","#15803d"], red: ["#fee2e2","#b91c1c"], gold: [C.goldL,"#92400e"], blue: ["#dbeafe",C.navy] };
  const [bg, fg] = map[color] || map.blue;
  return <span style={{ background: bg, color: fg, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{label}</span>;
}

function Card({ children, style = {} }) {
  return <div style={{ background: C.card, borderRadius: 14, boxShadow: "0 2px 12px rgba(30,58,138,.08)", padding: 24, ...style }}>{children}</div>;
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

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `2px solid ${C.goldL}`, background: C.navy, borderRadius: "16px 16px 0 0" }}>
          <h3 style={{ color: C.white, margin: 0, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.white, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Dashboard({ students, fees }) {
  const totalStudents = students.length;
  const totalFees = Object.values(fees).reduce((s, f) => s + f.total, 0);
  const paidFees = Object.values(fees).reduce((s, f) => s + f.paid, 0);
  const dueFees = totalFees - paidFees;
  const pending = students.filter(s => (fees[s.id]?.total || 0) - (fees[s.id]?.paid || 0) > 0).length;

  const stats = [
    { icon: "👨‍🎓", label: "Total Students", value: totalStudents, color: C.navy, sub: "Enrolled" },
    { icon: "💰", label: "Fees Collected", value: fmt(paidFees), color: C.green, sub: "This session" },
    { icon: "⏳", label: "Pending Fees", value: fmt(dueFees), color: C.red, sub: `${pending} students` },
    { icon: "📊", label: "Collection Rate", value: totalFees > 0 ? Math.round(paidFees / totalFees * 100) + "%" : "0%", color: C.gold, sub: "Of total fees" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, color: C.navy, marginBottom: 24, fontWeight: 700 }}>📊 Admin Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18, marginBottom: 32 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.label}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{s.sub}</div>
          </Card>
        ))}
      </div>
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Fee Collection Overview</h3>
        <div style={{ background: "#f1f5f9", borderRadius: 8, height: 18, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${totalFees > 0 ? paidFees / totalFees * 100 : 0}%`, background: `linear-gradient(90deg, ${C.navy}, ${C.gold})`, borderRadius: 8 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted }}>
          <span>Collected: <b style={{ color: C.green }}>{fmt(paidFees)}</b></span>
          <span>Pending: <b style={{ color: C.red }}>{fmt(dueFees)}</b></span>
          <span>Total: <b>{fmt(totalFees)}</b></span>
        </div>
      </Card>
      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Students by Class</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[...new Set(students.map(s => s.class))].map(cls => {
            const count = students.filter(s => s.class === cls).length;
            return (
              <div key={cls} style={{ background: C.bg, borderRadius: 10, padding: "8px 16px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{cls}</span>
                <Badge label={count} color="blue" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function StudentForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { 
    name: "", class: CLASSES[0], roll: "", phone: "", 
    father: "", mother: "", aadhar: "", pan_number: "",
    address: "", photo: null, admitted: new Date().toISOString().slice(0, 10) 
  });
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const valid = form.name.trim() && form.roll.trim() && form.phone.trim();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current.click()}>
          <Avatar name={form.name || "?"} photo={form.photo} size={80} />
          <span style={{ position: "absolute", bottom: 0, right: 0, background: C.gold, borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.white }}>📷</span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student Full Name" />
        <Select label="Class *" value={form.class} options={CLASSES} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} />
        <Input label="Roll Number *" value={form.roll} onChange={e => setForm(f => ({ ...f, roll: e.target.value }))} placeholder="V-01" />
        <Input label="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="98XXXXXXXX" />
        <Input label="Father's Name" value={form.father} onChange={e => setForm(f => ({ ...f, father: e.target.value }))} placeholder="Father's full name" />
        <Input label="Mother's Name" value={form.mother} onChange={e => setForm(f => ({ ...f, mother: e.target.value }))} placeholder="Mother's full name" />
        <Input label="Aadhar Number" value={form.aadhar} onChange={e => setForm(f => ({ ...f, aadhar: e.target.value }))} placeholder="XXXX XXXX XXXX" />
        <Input label="PAN Number" value={form.pan_number} onChange={e => setForm(f => ({ ...f, pan_number: e.target.value }))} placeholder="Student PAN Number" />
        <Input label="Admission Date" type="date" value={form.admitted} onChange={e => setForm(f => ({ ...f, admitted: e.target.value }))} />
      </div>
      <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="House No., Area, City" />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={() => valid && onSave(form)} style={{ opacity: valid ? 1 : .5 }}>💾 Save Student</Btn>
      </div>
    </div>
  );
} 

function Students({ students, setStudents, fees, setFees }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_no || s.roll || "").toLowerCase().includes(search.toLowerCase())
  );

  const reloadData = async () => {
    const [sRes, fRes] = await Promise.all([studentsAPI.getAll(), feesAPI.getAll()]);
    setStudents(sRes.data);
    const feeMap = {};
    fRes.data.forEach(f => {
      feeMap[f.student_id] = { total: f.total_fees, paid: f.paid_amount };
    });
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
      data.append('email', form.email || '');
      data.append('address', form.address || '');
      data.append('admitted_on', form.admitted || new Date().toISOString().slice(0, 10));
      if (form.photo && form.photo.startsWith('data:')) {
        const res = await fetch(form.photo);
        const blob = await res.blob();
        data.append('photo', blob, 'photo.jpg');
      }
      if (modal === "add") {
        await studentsAPI.create(data);
      } else {
        await studentsAPI.update(modal.id, data);
      }
      await reloadData();
      setModal(null);
    } catch (e) {
      alert('Error saving: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await studentsAPI.delete(id);
      await reloadData();
      setConfirmDel(null);
    } catch (e) {
      alert('Error deleting: ' + (e.response?.data?.error || e.message));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 22, color: C.navy, fontWeight: 700, margin: 0 }}>👨‍🎓 Student Management</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name / class / roll" style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, width: 260, fontFamily: "inherit" }} />
          <Btn variant="gold" onClick={() => setModal("add")}>➕ Add Student</Btn>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(s => {
          const fee = fees[s.id] || { total: 0, paid: 0 };
          const due = fee.total - fee.paid;
          const roll = s.roll_no || s.roll || "";
          const phone = s.phone || "";
          return (
            <Card key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "16px 20px" }}>
              <Avatar name={s.name} photo={s.photo_url || s.photo} size={48} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{s.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{s.class} &bull; Roll: {roll}</div>
                <div style={{ fontSize: 12, color: C.muted }}>📞 {phone}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <Badge label={due > 0 ? "Fee Pending" : "Fees Clear"} color={due > 0 ? "red" : "green"} />
                {due > 0 && <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>Due: {fmt(due)}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn small variant="outline" onClick={() => setModal({ 
               ...s, 
              roll: s.roll_no || s.roll, 
              admitted: s.admitted_on || s.admitted,
              father: s.father_name || '',
              mother: s.mother_name || '',
              aadhar: s.aadhar_no || '',
              pan_number: s.pan_number || '',
              })}>✏️ Edit</Btn> 
                <Btn small variant="danger" onClick={() => setConfirmDel(s)}>🗑️</Btn>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.muted }}>No students found.</div>}
      </div>

      {modal && (
        <Modal title={modal === "add" ? "Add New Student" : `Edit — ${modal.name}`} onClose={() => setModal(null)}>
          <StudentForm initial={modal !== "add" ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />
          {saving && <div style={{ textAlign: "center", color: C.navy, marginTop: 10 }}>Saving...</div>}
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDel(null)}>
          <p style={{ marginBottom: 20 }}>Delete <b>{confirmDel.name}</b>? This also removes all fee records and cannot be undone.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => handleDelete(confirmDel.id)} style={{ opacity: deleting ? .6 : 1 }}>
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FeeReceipt({ student, fee, receipt, onClose }) {
  const due = fee.total - fee.paid;
  return (
    <div>
      <div style={{ border: `2px solid ${C.navy}`, borderRadius: 12, padding: 24, background: C.white }}>
        <div style={{ textAlign: "center", borderBottom: `3px solid ${C.gold}`, paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 28 }}>🏫</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>Lord Krishna The School</div>
          <div style={{ fontSize: 12, color: C.muted }}>CBSE Affiliated | Ghaziabad, U.P.</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginTop: 6 }}>FEE RECEIPT</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 14, marginBottom: 16 }}>
          {[
            ["Receipt No.", receipt.no], ["Date", receipt.date],
            ["Student Name", student.name], ["Class", student.class],
            ["Roll No.", student.roll_no || student.roll], ["Phone", student.phone],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 6 }}>
              <span style={{ color: C.muted, minWidth: 100 }}>{k}:</span>
              <b style={{ color: C.text }}>{v}</b>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 12 }}>
          <thead>
            <tr style={{ background: C.navy, color: C.white }}>
              {["Description", "Amount"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: h === "Amount" ? "right" : "left" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "8px 12px" }}>Annual School Fees</td>
              <td style={{ padding: "8px 12px", textAlign: "right" }}>{fmt(fee.total)}</td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "8px 12px" }}>Amount Paid</td>
              <td style={{ padding: "8px 12px", textAlign: "right", color: C.green }}>{fmt(receipt.amount)}</td>
            </tr>
            <tr style={{ background: due > 0 ? "#fee2e2" : "#dcfce7" }}>
              <td style={{ padding: "8px 12px", fontWeight: 700 }}>Balance Due</td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: due > 0 ? C.red : C.green }}>{fmt(due)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ textAlign: "center", fontSize: 12, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          This is a computer generated receipt. | For queries: 8700656652
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn variant="outline" onClick={onClose}>Close</Btn>
        <Btn variant="green" onClick={() => window.print()}>🖨️ Print Receipt</Btn>
      </div>
    </div>
  );
}

function Fees({ students, fees, setFees }) {
  const [search, setSearch] = useState("");
  const [payModal, setPayModal] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [totalInput, setTotalInput] = useState("");

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const handlePay = (student) => {
    const amount = parseFloat(payAmount);
    const fee = fees[student.id] || { total: 0, paid: 0 };
    const newPaid = Math.min(fee.paid + amount, fee.total);
    const receipt = { no: "LKTS-" + Date.now().toString().slice(-6), date: new Date().toLocaleDateString("en-IN"), amount };
    setFees(prev => ({ ...prev, [student.id]: { ...fee, paid: newPaid } }));
    setPayModal(null);
    setReceiptModal({ student, fee: { ...fee, paid: newPaid }, receipt });
    setPayAmount("");
  };

  const handleSetTotal = (student) => {
    const total = parseFloat(totalInput);
    if (!isNaN(total) && total >= 0) {
      setFees(prev => ({ ...prev, [student.id]: { ...prev[student.id], total } }));
    }
    setTotalInput("");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 22, color: C.navy, fontWeight: 700, margin: 0 }}>💰 Fee Management</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search student" style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, width: 240, fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(s => {
          const fee = fees[s.id] || { total: 0, paid: 0 };
          const due = fee.total - fee.paid;
          const pct = fee.total > 0 ? Math.round(fee.paid / fee.total * 100) : 0;
          return (
            <Card key={s.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <Avatar name={s.name} photo={s.photo_url || s.photo} size={44} />
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.class} · Roll {s.roll_no || s.roll}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: "4px 20px", fontSize: 13 }}>
                  <span style={{ color: C.muted }}>Total</span>
                  <span style={{ color: C.muted }}>Paid</span>
                  <span style={{ color: C.muted }}>Due</span>
                  <b>{fmt(fee.total)}</b>
                  <b style={{ color: C.green }}>{fmt(fee.paid)}</b>
                  <b style={{ color: due > 0 ? C.red : C.green }}>{fmt(due)}</b>
                </div>
                <Badge label={due > 0 ? "Pending" : "Cleared"} color={due > 0 ? "red" : "green"} />
                <div style={{ display: "flex", gap: 8 }}>
                  {due > 0 && <Btn small variant="gold" onClick={() => setPayModal(s)}>💳 Collect</Btn>}
                  <Btn small variant="outline" onClick={() => { setTotalInput(fee.total.toString()); setPayModal({ ...s, setTotal: true }); }}>✏️ Set Total</Btn>
                </div>
              </div>
              {fee.total > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ background: "#f1f5f9", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.green : `linear-gradient(90deg, ${C.navy}, ${C.gold})`, borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3, textAlign: "right" }}>{pct}% paid</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {payModal && (
        <Modal title={payModal.setTotal ? `Set Annual Fees — ${payModal.name}` : `Collect Fee — ${payModal.name}`} onClose={() => { setPayModal(null); setPayAmount(""); setTotalInput(""); }}>
          {payModal.setTotal ? (
            <div style={{ display: "grid", gap: 16 }}>
              <Input label="Annual Total Fees (₹)" type="number" value={totalInput} onChange={e => setTotalInput(e.target.value)} placeholder="e.g. 45000" />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn variant="outline" onClick={() => { setPayModal(null); setTotalInput(""); }}>Cancel</Btn>
                <Btn variant="primary" onClick={() => { handleSetTotal(payModal); setPayModal(null); }}>Save</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ background: C.bg, borderRadius: 10, padding: 14, fontSize: 14 }}>
                <div>Total: <b>{fmt((fees[payModal.id] || {}).total || 0)}</b></div>
                <div>Already Paid: <b style={{ color: C.green }}>{fmt((fees[payModal.id] || {}).paid || 0)}</b></div>
                <div>Balance Due: <b style={{ color: C.red }}>{fmt(((fees[payModal.id] || {}).total || 0) - ((fees[payModal.id] || {}).paid || 0))}</b></div>
              </div>
              <Input label="Amount to Collect (₹)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="e.g. 15000" />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn variant="outline" onClick={() => { setPayModal(null); setPayAmount(""); }}>Cancel</Btn>
                <Btn variant="green" onClick={() => parseFloat(payAmount) > 0 && handlePay(payModal)}>✅ Confirm & Generate Receipt</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
      {receiptModal && (
        <Modal title="Fee Receipt Generated" onClose={() => setReceiptModal(null)}>
          <FeeReceipt {...receiptModal} onClose={() => setReceiptModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function IDCards({ students }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 22, color: C.navy, fontWeight: 700, margin: 0 }}>🪪 ID Card Generator</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search student" style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, width: 240, fontFamily: "inherit" }} />
      </div>
      {selected ? (
        <div>
          <Btn variant="outline" onClick={() => setSelected(null)} style={{ marginBottom: 20 }}>← Back to list</Btn>
          <IDCardPDF student={selected} onClose={() => setSelected(null)} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {filtered.map(s => (
            <Card key={s.id} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <Avatar name={s.name} photo={s.photo_url || s.photo} size={52} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.class} · {s.roll_no || s.roll}</div>
                </div>
              </div>
              <Btn variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSelected(s)}>🪪 View & Download ID</Btn>
            </Card>
          ))}
          {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: C.muted }}>No students found.</div>}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "students",  icon: "👨‍🎓", label: "Students" },
  { id: "fees",      icon: "💰", label: "Fees" },
  { id: "idcards",   icon: "🪪", label: "ID Cards" },
  { id: "results",   icon: "📝", label: "Results" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(true);

  useEffect(() => {
    Promise.all([studentsAPI.getAll(), feesAPI.getAll()])
      .then(([sRes, fRes]) => {
        setStudents(sRes.data);
        const feeMap = {};
        fRes.data.forEach(f => {
          feeMap[f.student_id] = { total: f.total_fees, paid: f.paid_amount };
        });
        setFees(feeMap);
      })
      .catch(e => console.error('Load error:', e))
      .finally(() => setLoading(false));
  }, []);

  const renderTab = () => {
    if (loading) return <div style={{ textAlign: "center", padding: 60, color: C.muted, fontSize: 16 }}>⏳ Loading portal data...</div>;
    if (tab === "dashboard") return <Dashboard students={students} fees={fees} />;
    if (tab === "students")  return <Students students={students} setStudents={setStudents} fees={fees} setFees={setFees} />;
    if (tab === "fees")      return <Fees students={students} fees={fees} setFees={setFees} />;
    if (tab === "idcards")   return <IDCards students={students} />;
    if (tab === "results")   return <Results students={students} />;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: C.bg }}>
      <div style={{ width: sideOpen ? 220 : 64, background: C.navy, color: C.white, display: "flex", flexDirection: "column", transition: "width .3s", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowX: "hidden" }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid rgba(255,255,255,.1)`, display: "flex", alignItems: "center", gap: 10, minHeight: 80 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🏫</span>
          {sideOpen && <div>
            <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>Lord Krishna</div>
            <div style={{ fontSize: 10, opacity: .75 }}>School Portal</div>
          </div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "rgba(255,255,255,.15)" : "transparent", border: tab === t.id ? `1px solid ${C.gold}` : "1px solid transparent", color: C.white, borderRadius: 10, padding: "11px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: tab === t.id ? 700 : 400, textAlign: "left", transition: "all .2s" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
              {sideOpen && <span style={{ whiteSpace: "nowrap" }}>{t.label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSideOpen(o => !o)} style={{ background: "rgba(255,255,255,.08)", border: "none", color: C.white, padding: "12px", cursor: "pointer", fontSize: 16, borderTop: "1px solid rgba(255,255,255,.1)" }}>
          {sideOpen ? "◀ Collapse" : "▶"}
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ background: C.white, borderBottom: `2px solid ${C.goldL}`, padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Lord Krishna The School</span>
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>CBSE · Ghaziabad</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge label={`${students.length} Students`} color="blue" />
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>A</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "28px 28px 40px", maxWidth: 1100, width: "100%" }}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}