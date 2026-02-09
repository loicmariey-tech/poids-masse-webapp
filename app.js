const updateBtn = document.getElementById("update");
const exportBtn = document.getElementById("export");
const exportPdfBtn = document.getElementById("exportPdf");
const prefillBtn = document.getElementById("prefill");
const exampleCountSelect = document.getElementById("exampleCount");
const statusEl = document.getElementById("status");
const regLineEl = document.getElementById("regLine");
const relErrorEl = document.getElementById("relError");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const nbMesuresInput = document.getElementById("nbMesures");
const unitMasseSelect = document.getElementById("unitMasse");
const unitPoidsSelect = document.getElementById("unitPoids");
const tableWrapper = document.getElementById("tableWrapper");
const nomInput = document.getElementById("nom");
const prenomInput = document.getElementById("prenom");
const classeInput = document.getElementById("classe");
const printNom = document.getElementById("printNom");
const printPrenom = document.getElementById("printPrenom");
const printClasse = document.getElementById("printClasse");
const qAlign = document.getElementById("qAlign");
const qCompare = document.getElementById("qCompare");
const qConclusion = document.getElementById("qConclusion");

function parseTableData() {
  const rows = Array.from(document.querySelectorAll(".measure-row"));
  const m = [];
  const p = [];

  for (const row of rows) {
    const mVal = Number(row.querySelector(".m-input").value);
    const pVal = Number(row.querySelector(".p-input").value);
    if (!Number.isFinite(mVal) || !Number.isFinite(pVal)) {
      throw new Error("Toutes les valeurs doivent etre numeriques.");
    }
    m.push(mVal);
    p.push(pVal);
  }

  if (m.length < 2) {
    throw new Error("Il faut au moins 2 points.");
  }

  return { m, p };
}

function computeLinearRegression(m, p) {
  const n = m.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i += 1) {
    sumX += m[i];
    sumY += p[i];
    sumXY += m[i] * p[i];
    sumX2 += m[i] * m[i];
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    throw new Error("Regression impossible (denominateur nul).");
  }
  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;
  return { a, b };
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawAxes(xMin, xMax, yMin, yMax, margin) {
  const axisColor = "#3e3a35";
  const gridColor = "#d8cfc1";
  const ticks = 5;

  // Grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 1; i < ticks; i += 1) {
    const x = margin + (i / ticks) * (canvas.width - 2 * margin);
    const y = margin + (i / ticks) * (canvas.height - 2 * margin);
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, canvas.height - margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin, canvas.height - margin);
  ctx.moveTo(margin, canvas.height - margin);
  ctx.lineTo(margin, margin);
  ctx.stroke();

  // Arrowheads
  ctx.beginPath();
  ctx.moveTo(canvas.width - margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin - 10, canvas.height - margin - 5);
  ctx.lineTo(canvas.width - margin - 10, canvas.height - margin + 5);
  ctx.closePath();
  ctx.fillStyle = axisColor;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin - 5, margin + 10);
  ctx.lineTo(margin + 5, margin + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = axisColor;
  ctx.font = "14px Georgia";
  ctx.fillText("Masse (kg)", canvas.width - margin - 90, canvas.height - margin + 25);
  ctx.save();
  ctx.translate(margin - 40, margin + 30);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Poids (N)", 0, 0);
  ctx.restore();
}

function toCanvasX(value, xMin, xMax, margin) {
  return (
    margin +
    ((value - xMin) / (xMax - xMin)) * (canvas.width - 2 * margin)
  );
}

function toCanvasY(value, yMin, yMax, margin) {
  return (
    canvas.height -
    margin -
    ((value - yMin) / (yMax - yMin)) * (canvas.height - 2 * margin)
  );
}

function drawPoints(m, p, xMin, xMax, yMin, yMax, margin) {
  ctx.fillStyle = "#b0493b";
  for (let i = 0; i < m.length; i += 1) {
    const x = toCanvasX(m[i], xMin, xMax, margin);
    const y = toCanvasY(p[i], yMin, yMax, margin);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLine(a, b, xMin, xMax, yMin, yMax, margin, style, color) {
  const y1 = a * xMin + b;
  const y2 = a * xMax + b;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash(style === "dashed" ? [6, 6] : [4, 2, 1, 2]);
  ctx.beginPath();
  ctx.moveTo(toCanvasX(xMin, xMin, xMax, margin), toCanvasY(y1, yMin, yMax, margin));
  ctx.lineTo(toCanvasX(xMax, xMin, xMax, margin), toCanvasY(y2, yMin, yMax, margin));
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  statusEl.textContent = "";
  try {
    const { m, p } = parseTableData();
    const unitMasse = unitMasseSelect.value;
    const unitPoids = unitPoidsSelect.value;

    const m_kg = m.map((val) => (unitMasse === "g" ? val / 1000 : val));
    const p_N = p.map((val) => (unitPoids === "mN" ? val / 1000 : val));

    const { a, b } = computeLinearRegression(m_kg, p_N);
    const gTheorique = 9.81;
    const relError = Math.abs(a - gTheorique) / gTheorique * 100;

    regLineEl.textContent = `P = ${a.toFixed(2)} m + ${b.toFixed(2)}`;
    relErrorEl.textContent = relError.toFixed(1);

    const xMin = Math.min(0, ...m_kg);
    const xMax = Math.max(...m_kg) * 1.1 || 1;
    const yMin = Math.min(0, ...p_N);
    const yMax = Math.max(...p_N) * 1.1 || 1;

    const margin = 50;
    clearCanvas();
    drawAxes(xMin, xMax, yMin, yMax, margin);
    drawLine(a, b, xMin, xMax, yMin, yMax, margin, "dashed", "#1f7a5d");
    drawLine(gTheorique, 0, xMin, xMax, yMin, yMax, margin, "dotted", "#2f5fb3");
    drawPoints(m_kg, p_N, xMin, xMax, yMin, yMax, margin);
  } catch (err) {
    statusEl.textContent = err.message;
  }
}

updateBtn.addEventListener("click", render);
window.addEventListener("resize", render);

exportBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "poids-masse.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

exportPdfBtn.addEventListener("click", () => {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      statusEl.textContent = "Export PDF indisponible (lib manquante).";
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Compte-rendu eleve - Poids et masse (3e)", 15, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Nom : ${nomInput.value || "__________"}`, 15, 26);
    doc.text(`Prenom : ${prenomInput.value || "__________"}`, 15, 32);
    doc.text(`Classe : ${classeInput.value || "__________"}`, 15, 38);

    doc.text("Objectif : verifier P = m * g et comparer la regression a la droite theorique.", 15, 46);

    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 15, 55, 180, 95);

    doc.setFont("helvetica", "bold");
    doc.text("Resultats", 15, 158);
    doc.setFont("helvetica", "normal");
    doc.text(`Regression : ${regLineEl.textContent}`, 15, 166);
    doc.text("Droite theorique : P = 9.81 m", 15, 172);
    doc.text(`Ecart relatif (pente) : ${relErrorEl.textContent} %`, 15, 178);

    // Table des mesures
    const { m, p } = parseTableData();
    const unitMasse = unitMasseSelect.value;
    const unitPoids = unitPoidsSelect.value;
    let y = 186;
    doc.setFont("helvetica", "bold");
    doc.text("Tableau des mesures", 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Unites : masse en ${unitMasse}, poids en ${unitPoids}`, 15, y);
    y += 6;

    // Header
    doc.setFont("helvetica", "bold");
    doc.text("#", 15, y);
    doc.text(`Masse (${unitMasse})`, 30, y);
    doc.text(`Poids (${unitPoids})`, 90, y);
    doc.setFont("helvetica", "normal");
    y += 6;

    // Rows
    for (let i = 0; i < m.length; i += 1) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(i + 1), 15, y);
      doc.text(String(m[i]), 30, y);
      doc.text(String(p[i]), 90, y);
      y += 6;
    }

    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Reponses", 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`1. Alignement : ${qAlign.value || "-"}`, 15, y);
    y += 6;
    doc.text(`2. Comparaison : ${qCompare.value || "-"}`, 15, y);
    y += 6;
    doc.text(`Conclusion : ${qConclusion.value || "-"}`, 15, y);

    doc.save("poids-masse.pdf");
  } catch (err) {
    statusEl.textContent = "Erreur export PDF.";
  }
});

function setMode(mode) {
  if (mode === "teacher") {
    modeTeacherBtn.classList.add("active");
    modeStudentBtn.classList.remove("active");
    teacherOnly.classList.remove("hidden");
    studentOnly.classList.add("hidden");
  } else {
    modeStudentBtn.classList.add("active");
    modeTeacherBtn.classList.remove("active");
    studentOnly.classList.remove("hidden");
    teacherOnly.classList.add("hidden");
  }
}

function buildTable() {
  const count = Math.max(2, Math.min(20, Number(nbMesuresInput.value || 2)));
  const unitMasse = unitMasseSelect.value;
  const unitPoids = unitPoidsSelect.value;

  const rows = [];
  rows.push(`<table class="measure-table">`);
  rows.push(`<thead><tr><th>Mesure</th><th>Masse (${unitMasse})</th><th>Poids (${unitPoids})</th></tr></thead>`);
  rows.push("<tbody>");
  for (let i = 0; i < count; i += 1) {
    rows.push(
      `<tr class="measure-row">` +
        `<td>${i + 1}</td>` +
        `<td><input class="m-input" type="number" step="any" value="${i === 0 ? 0 : ""}"></td>` +
        `<td><input class="p-input" type="number" step="any" value="${i === 0 ? 0 : ""}"></td>` +
      `</tr>`
    );
  }
  rows.push("</tbody></table>");
  tableWrapper.innerHTML = rows.join("");
}

nbMesuresInput.addEventListener("change", buildTable);
unitMasseSelect.addEventListener("change", buildTable);
unitPoidsSelect.addEventListener("change", buildTable);

buildTable();

function syncPrintHeader() {
  printNom.textContent = nomInput.value || "-";
  printPrenom.textContent = prenomInput.value || "-";
  printClasse.textContent = classeInput.value || "-";
}

nomInput.addEventListener("input", syncPrintHeader);
prenomInput.addEventListener("input", syncPrintHeader);
classeInput.addEventListener("input", syncPrintHeader);
syncPrintHeader();

function prefillExample() {
  const count = Number(exampleCountSelect.value || 15);
  nbMesuresInput.value = count;
  unitMasseSelect.value = "kg";
  unitPoidsSelect.value = "N";
  buildTable();

  const rows = Array.from(document.querySelectorAll(".measure-row"));
  const start = 0.05;
  const end = 0.45;
  const step = (end - start) / (count - 1);

  rows.forEach((row, i) => {
    const m = start + step * i;
    const noise = (((i * 37) % 10) - 5) / 100; // -0.05 to +0.04
    const p = 9.81 * m + noise;
    row.querySelector(".m-input").value = m.toFixed(3);
    row.querySelector(".p-input").value = p.toFixed(2);
  });
  render();
}

prefillBtn.addEventListener("click", prefillExample);

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const prefill = params.get("prefill");
  if (prefill) {
    const n = Number(prefill);
    if (Number.isFinite(n)) {
      exampleCountSelect.value = String(Math.min(20, Math.max(2, n)));
      prefillExample();
      return;
    }
  }
  render();
}

window.addEventListener("load", applyUrlParams);
