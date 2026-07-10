import { useState } from "react";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BACKEND = "https://lkschool.onrender.com";

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
      width: "55mm", minHeight: "85mm",
      background: C.white, overflow: "hidden",
      border: `2px solid ${C.navy}`,
      fontFamily: "'Segoe UI', sans-serif",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2563eb)`, color: C.white, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <img src="https://i.ibb.co/jk9t2zpw/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: 4, objectFit: "contain", background: "white" }} onError={e => e.target.style.display='none'} />
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, lineHeight: 1.2 }}>Lord Krishna The School</div>
          <div style={{ fontSize: 7, opacity: .85 }}>MUNSHI HARPAL COLONY</div>
          <div style={{ fontSize: 7, opacity: .85 }}>SHAHPUR BAMHETA (GZB)</div>
        </div>
      </div>

      {/* Gold stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, #fbbf24)` }} />

      {/* Photo */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, border: `2px solid ${C.gold}` }}>
          {student.photo_url
            ? <img src={`https://lk-school-backend.onrender.com${student.photo_url}`} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
            : (student.name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
          }
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "0 10px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.navy, textAlign: "center", marginBottom: 6 }}>{student.name}</div>
        {[
          ["Class", student.class],
          ["DOB", student.dob || "—"],
          ["Father", student.father_name || student.father || "—"],
          ["Mother", student.mother_name || student.mother || "—"],
          ["Phone", student.phone],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", fontSize: 8, marginBottom: 3, gap: 4 }}>
            <span style={{ color: C.muted, minWidth: 36, fontWeight: 600 }}>{k}:</span>
            <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, color: C.white, fontSize: 7, textAlign: "center", padding: "5px 8px" }}>
        If found please return to school · 8700656652
      </div>
    </div>
  );
}

export default function IDCardPDF({ student, onClose }) {
  const [downloading, setDownloading] = useState(false);

 const downloadPDF = async () => {
    setDownloading(true);
    const element = document.getElementById("id-card-template");
    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [55, 85] });
    pdf.addImage(imgData, "PNG", 0, 0, 55, 85);
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