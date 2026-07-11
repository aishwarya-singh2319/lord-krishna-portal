import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const BACKEND = "https://lkschool.onrender.com";

const C = {
  navy: "#1e3a8a",
  gold: "#d97706",
  white: "#ffffff",
  muted: "#64748b",
  text: "#0f172a",
  bg: "#f0f4ff",
};

function IDCardTemplate({ student, uploadedPhoto, onPhotoClick }) {
  const photoSrc = uploadedPhoto
    || (student.photo_url ? `https://lk-school-backend.onrender.com${student.photo_url}` : null);

  return (
    <div id="id-card-template" style={{
      width: "55mm", height: "85mm",
      background: C.white, overflow: "hidden",
      border: `2px solid ${C.navy}`,
      fontFamily: "'Segoe UI', sans-serif",
      boxSizing: "border-box",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header - tightened up */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2563eb)`, color: C.white, padding: "6px 8px", display: "flex", alignItems: "center", gap: 6 }}>
        <img src="https://i.ibb.co/jk9t2zpw/logo.png" alt="logo" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "contain", background: "white", flexShrink: 0 }} onError={e => e.target.style.display='none'} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 8.5, fontWeight: 800 }}>Lord Krishna The School</div>
          <div style={{ fontSize: 6.2, opacity: .9 }}>MUNSHI HARPAL COLONY</div>
          <div style={{ fontSize: 6.2, opacity: .9 }}>SHAHPUR BAMHETA (GZB)</div>
        </div>
      </div>

      {/* Gold stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, #fbbf24)` }} />

      {/* Photo - click to upload */}
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
        <div onClick={onPhotoClick} style={{ width: 54, height: 54, borderRadius: "50%", background: C.navy, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, border: `2px solid ${C.gold}`, cursor: "pointer", overflow: "hidden" }}>
          {photoSrc
            ? <img src={photoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (student.name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
          }
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "0 10px 6px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.navy, textAlign: "center", marginBottom: 5 }}>{student.name}</div>
        {[
          ["Class", student.class],
          ["DOB", student.dob || "—"],
          ["Father", student.father_name || student.father || "—"],
          ["Mother", student.mother_name || student.mother || "—"],
          ["Phone", student.phone],
          ["Address", "MUNSHI HARPAL COLONY, SHAHPUR BAMHETA (GZB)"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", fontSize: 7.5, marginBottom: 2.5, gap: 4 }}>
            <span style={{ color: C.muted, minWidth: 36, fontWeight: 600, flexShrink: 0 }}>{k}:</span>
            <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: C.navy, color: C.white, fontSize: 6.5, textAlign: "center", padding: "4px 8px" }}>
        If found please return to school · 8700656652
      </div>
    </div>
  );
}

export default function IDCardPDF({ student, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      setUploadedPhoto(canvas.toDataURL("image/png"));
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedPhoto(ev.target.result);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

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
      <IDCardTemplate
        student={student}
        uploadedPhoto={uploadedPhoto}
        onPhotoClick={() => document.getElementById("id-card-photo-input").click()}
      />
      <input
        id="id-card-photo-input"
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => document.getElementById("id-card-photo-input").click()} style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #d97706", background: "white", color: "#d97706", cursor: "pointer", fontWeight: 600 }}>
          📷 Upload Photo
        </button>
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