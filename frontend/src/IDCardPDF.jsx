import { useState } from "react";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const C = {
  navy: "#1e3a8a",
  gold: "#d97706",
  white: "#ffffff",
  muted: "#64748b",
  bg: "#f0f4ff",
};

function IDCardTemplate({ student }) {
  return (
    <div id="id-card-template" style={{
      width: 320,
      background: C.white,
      borderRadius: 14,
      overflow: "hidden",
      border: `2px solid ${C.navy}`,
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2563eb)`, color: C.white, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 36 }}>🏫</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Lord Krishna The School</div>
          <div style={{ fontSize: 10, opacity: .85 }}>CBSE Affiliated, Ghaziabad, U.P.</div>
        </div>
      </div>

      {/* Gold stripe */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.gold}, #fbbf24)` }} />

      {/* Body */}
      <div style={{ padding: "16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Photo */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, border: `3px solid ${C.gold}`, flexShrink: 0 }}>
          {student.photo_url
            ? <img src={`http://localhost:5000${student.photo_url}`} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
            : student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 8 }}>{student.name}</div>
          
          {[
            ["Class",    student.class],
            ["Roll No.", student.roll_no || student.roll],
            ["Father",   student.father_name || student.father || ""],
            ["Phone",    student.phone],
            ].map(([k, v]) => (
            <div key={k} style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
              <b style={{ color: "#0f172a", minWidth: 60, display: "inline-block" }}>{k}:</b> {v}
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      {student.address && (
        <div style={{ margin: "0 16px 12px", background: C.bg, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: C.muted }}>
          📍 {student.address}
        </div>
      )}

      {/* Footer */}
      <div style={{ background: C.navy, color: C.white, fontSize: 10, textAlign: "center", padding: "8px 12px" }}>
        If found, please return to school · 8700656652
      </div>
    </div>
  );
}

export default function IDCardPDF({ student, onClose }) {
  const cardRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    setDownloading(true);
    const element = document.getElementById("id-card-template");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [86, 54] });
    pdf.addImage(imgData, "PNG", 0, 0, 86, 54);
    pdf.save(`IDCard_${student.name.replace(/ /g, "_")}.pdf`);
    setDownloading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <IDCardTemplate student={student} />
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #1e3a8a", background: "white", cursor: "pointer", fontWeight: 600 }}>
          Close
        </button>
        <button onClick={downloadPDF} disabled={downloading} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", cursor: "pointer", fontWeight: 600 }}>
          {downloading ? "Generating..." : "⬇️ Download PDF"}
        </button>
      </div>
    </div>
  );
}