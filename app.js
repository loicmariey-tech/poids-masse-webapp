const textarea = document.getElementById("data");
const updateBtn = document.getElementById("update");
const exportBtn = document.getElementById("export");
const exportPdfBtn = document.getElementById("exportPdf");
const statusEl = document.getElementById("status");
const regLineEl = document.getElementById("regLine");
const relErrorEl = document.getElementById("relError");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const modeStudentBtn = document.getElementById("modeStudent");
const modeTeacherBtn = document.getElementById("modeTeacher");
const studentOnly = document.querySelector(".student-only");
const teacherOnly = document.querySelector(".teacher-only");

function parseData(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const m = [];
  const p = [];

  for (const line of lines) {
    const parts = line.split(/[;,\s]+/).filter(Boolean);
    if (parts.length < 2) {
      throw new Error(`Ligne invalide: "${line}"`);
    }
    const mVal = Number(parts[0]);
    const pVal = Number(parts[1]);
    if (!Number.isFinite(mVal) || !Number.isFinite(pVal)) {
      throw new Error(`Valeurs non numeriques: "${line}"`);
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
  ctx.strokeStyle = "#6d655a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin, canvas.height - margin);
  ctx.lineTo(canvas.width - margin, margin);
  ctx.stroke();

  ctx.fillStyle = "#6d655a";
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
    const { m, p } = parseData(textarea.value);
    const { a, b } = computeLinearRegression(m, p);
    const gTheorique = 9.81;
    const relError = Math.abs(a - gTheorique) / gTheorique * 100;

    regLineEl.textContent = `P = ${a.toFixed(2)} m + ${b.toFixed(2)}`;
    relErrorEl.textContent = relError.toFixed(1);

    const xMin = Math.min(0, ...m);
    const xMax = Math.max(...m) * 1.1 || 1;
    const yMin = Math.min(0, ...p);
    const yMax = Math.max(...p) * 1.1 || 1;

    const margin = 50;
    clearCanvas();
    drawAxes(xMin, xMax, yMin, yMax, margin);
    drawLine(a, b, xMin, xMax, yMin, yMax, margin, "dashed", "#1f7a5d");
    drawLine(gTheorique, 0, xMin, xMax, yMin, yMax, margin, "dotted", "#2f5fb3");
    drawPoints(m, p, xMin, xMax, yMin, yMax, margin);
  } catch (err) {
    statusEl.textContent = err.message;
  }
}

updateBtn.addEventListener("click", render);
window.addEventListener("load", render);
window.addEventListener("resize", render);

exportBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "poids-masse.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

exportPdfBtn.addEventListener("click", () => {
  window.print();
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

modeStudentBtn.addEventListener("click", () => setMode("student"));
modeTeacherBtn.addEventListener("click", () => setMode("teacher"));
