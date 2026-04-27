import { useState, useEffect } from "react";
import { studentsAPI } from "./api";
import * as XLSX from "xlsx";

const C = {
  navy: "#1e3a8a", gold: "#d97706", white: "#ffffff",
  green: "#16a34a", red: "#dc2626", muted: "#64748b",
  bg: "#f0f4ff", border: "#e2e8f0", text: "#0f172a"
};

const SUBJECTS = ["hindi", "english", "maths", "science", "sst"];
const SUBJECT_LABELS = { hindi: "Hindi", english: "English", maths: "Maths", science: "Science", sst: "SST" };
const MAX_MARKS = 100;

function gradeColor(grade) {
  if (["A1","A2"].includes(grade)) return "#16a34a";
  if (["B1","B2"].includes(grade)) return "#2563eb";
  if (["C1","C2"].includes(grade)) return "#d97706";
  if (grade === "D") return "#ea580c";
  return "#dc2626";
}

export default function Results({ students }) {
  const [results, setResults] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [modal, setModal] = useState(null);
  const [marks, setMarks] = useState({ hindi: "", english: "", maths: "", science: "", sst: "" });
  const [loading, setLoading] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [search, setSearch] = useState("");

  const classes = ["All", ...new Set(students.map(s => s.class))];

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    const res = await fetch("https://lk-school-backend.onrender.com/api/results");
    const data = await res.json();
    setResults(data);
  };

  const filteredStudents = students.filter(s =>
    (selectedClass === "All" || s.class === selectedClass) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getResult = (studentId) => results.find(r => r.student_id === studentId);

  const handleSaveMarks = async () => {
    const m = { hindi: parseFloat(marks.hindi) || 0, english: parseFloat(marks.english) || 0, maths: parseFloat(marks.maths) || 0, science: parseFloat(marks.science) || 0, sst: parseFloat(marks.sst) || 0 };
    setLoading(true);
    const res = await fetch("https://lk-school-backend.onrender.com/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: modal.id, ...m, exam_type: "Annual", session: "2024-25" })
    });
    const data = await res.json();
    await fetchResults();
    setLoading(false);
    setModal(null);
    setMarks({ hindi: "", english: "", maths: "", science: "", sst: "" });
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportMsg("Reading file...");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      const resultsData = rows.map(r => ({
        roll_no: String(r["Roll No"] || r["roll_no"] || ""),
        name: String(r["Name"] || r["name"] || ""),
        hindi: parseFloat(r["Hindi"] || r["hindi"] || 0),
        english: parseFloat(r["English"] || r["english"] || 0),
        maths: parseFloat(r["Maths"] || r["maths"] || 0),
        science: parseFloat(r["Science"] || r["science"] || 0),
        sst: parseFloat(r["SST"] || r["sst"] || 0),
        exam_type: "Annual", session: "2024-25"
      }));
      const res = await fetch("https://lk-school-backend.onrender.com/api/results/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: resultsData })
      });
      const data = await res.json();
      setImportMsg(`✅ Imported ${data.imported} results successfully!`);
      await fetchResults();
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { "Roll No": "1A-001", "Name": "ABHISHYAM", "Hindi": 85, "English": 78, "Maths": 92, "Science": 88, "SST": 76 },
      { "Roll No": "1A-002", "Name": "ANSH", "Hindi": 70, "English": 65, "Maths": 80, "Science": 75, "SST": 68 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks");
    XLSX.writeFile(wb, "marks_template.xlsx");
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, color: C.navy, fontWeight: 700, marginBottom: 20 }}>📝 Result Management</h2>

      {/* Upload Section */}
      <div style={{ background: C.white, borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(30,58,138,.08)", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 12 }}>📤 Bulk Upload Marks via Excel</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={downloadTemplate} style={{ background: C.navy, color: C.white, border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            ⬇️ Download Template
          </button>
          <label style={{ background: C.gold, color: C.white, border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            📂 Upload Marks Excel
            <input type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleExcelUpload} />
          </label>
          {importMsg && <span style={{ color: C.green, fontWeight: 600, fontSize: 14 }}>{importMsg}</span>}
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
          Excel must have columns: Roll No, Name, Hindi, English, Maths, Science, SST (max 100 each)
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search student" style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, fontFamily: "inherit", width: 220 }} />
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 14, fontFamily: "inherit" }}>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Students Results Table */}
      <div style={{ background: C.white, borderRadius: 14, boxShadow: "0 2px 12px rgba(30,58,138,.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.navy, color: C.white }}>
              {["Rank", "Name", "Class", "Roll No", "Hindi", "English", "Maths", "Science", "SST", "Total", "%", "Grade", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, i) => {
              const r = getResult(s.id);
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.bg }}>
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: C.gold }}>{r ? `#${r.rank}` : "-"}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "8px 12px", color: C.muted }}>{s.class}</td>
                  <td style={{ padding: "8px 12px", color: C.muted }}>{s.roll_no}</td>
                  {SUBJECTS.map(sub => (
                    <td key={sub} style={{ padding: "8px 12px" }}>{r ? r[sub] : "-"}</td>
                  ))}
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>{r ? r.total : "-"}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>{r ? `${r.percentage}%` : "-"}</td>
                  <td style={{ padding: "8px 12px" }}>
                    {r ? <span style={{ color: gradeColor(r.grade), fontWeight: 700 }}>{r.grade}</span> : "-"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {r ? <span style={{ color: r.status === "Pass" ? C.green : C.red, fontWeight: 700 }}>{r.status}</span> : "-"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <button onClick={() => { setModal(s); if(r) setMarks({ hindi: r.hindi, english: r.english, maths: r.maths, science: r.science, sst: r.sst }); }} style={{ background: C.navy, color: C.white, border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      {r ? "✏️ Edit" : "➕ Add"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Entry Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.white, borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ background: C.navy, color: C.white, padding: "18px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Enter Marks — {modal.name}</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: C.white, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 24, display: "grid", gap: 14 }}>
              <div style={{ fontSize: 13, color: C.muted, background: C.bg, borderRadius: 8, padding: "8px 12px" }}>
                {modal.class} · Roll: {modal.roll_no} · Max marks: 100 per subject
              </div>
              {SUBJECTS.map(sub => (
                <div key={sub} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ width: 80, fontWeight: 600, fontSize: 14 }}>{SUBJECT_LABELS[sub]}</label>
                  <input type="number" min="0" max="100" value={marks[sub]} onChange={e => setMarks(m => ({ ...m, [sub]: e.target.value }))}
                    style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 14, fontFamily: "inherit" }} />
                  <span style={{ fontSize: 12, color: C.muted }}>/ 100</span>
                </div>
              ))}
              {/* Preview */}
              <div style={{ background: C.bg, borderRadius: 8, padding: 12, fontSize: 13 }}>
                {(() => {
                  const total = SUBJECTS.reduce((s, sub) => s + (parseFloat(marks[sub]) || 0), 0);
                  const pct = (total / 500 * 100).toFixed(1);
                  return <span>Total: <b>{total}/500</b> · Percentage: <b>{pct}%</b></span>;
                })()}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setModal(null)} style={{ padding: "10px 20px", borderRadius: 8, border: `1.5px solid ${C.navy}`, background: "white", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button onClick={handleSaveMarks} disabled={loading} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: C.green, color: "white", cursor: "pointer", fontWeight: 600 }}>
                  {loading ? "Saving..." : "💾 Save Marks"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}