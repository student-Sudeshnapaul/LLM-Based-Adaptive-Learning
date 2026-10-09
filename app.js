// ===== STATE =====
let me = null;
const $ = (s) => document.querySelector(s);
const content = () => $("#content");
const yearName = (y) => ["", "1st", "2nd", "3rd", "4th"][y] + " Year";

// ===== AUTH =====
function login(email, pw) {
  const t = DB.teachers.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!email.endsWith("@college.edu")) return "Use your college email (@college.edu)";
  if (!t || t.password !== pw) return "Invalid email or password";
  me = t;
  sessionStorage.setItem("teacherId", t.id);
  return null;
}
function restore() {
  try {
    const id = sessionStorage.getItem("teacherId");
    if (id) me = DB.teachers.find((t) => t.id === id) || null;
  } catch (e) {}
}

$("#togglePw").onclick = () => {
  const p = $("#password");
  p.type = p.type === "password" ? "text" : "password";
  $("#togglePw").textContent = p.type === "password" ? "Show" : "Hide";
};
$("#loginForm").onsubmit = (e) => {
  e.preventDefault();
  const err = login($("#email").value.trim(), $("#password").value);
  $("#loginError").textContent = err || "";
  if (!err) startApp();
};
$("#logoutBtn").onclick = () => { sessionStorage.clear(); me = null; location.reload(); };
$("#menuBtn").onclick = () => $(".sidebar").classList.toggle("open");
document.querySelectorAll("[data-nav]").forEach((a) =>
  a.addEventListener("click", () => { $(".sidebar").classList.remove("open"); go(a.dataset.nav); })
);

function startApp() {
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  const init = me.name.split(" ").filter(w => !w.endsWith(".")).map(w => w[0]).join("").slice(0, 2);
  $("#userChip").innerHTML = `<div class="name"><b>${me.name}</b><br><span class="muted">${me.department}</span></div><div class="avatar">${init}</div>`;
  go("dashboard");
}

// ===== HELPERS =====
const mySubjects = () => me.assignments;
const myExams = () => DB.exams.filter((e) => mySubjects().some((s) => s.subjectCode === e.subjectCode));
const myEvals = () => DB.evaluations.filter((ev) => myExams().some((e) => e.id === ev.examId));
const total = (ev) => ev.results.reduce((a, r) => a + r.marks, 0);
const student = (id) => DB.students.find((s) => s.id === id);
const exam = (id) => DB.exams.find((e) => e.id === id);
const badge = (st) => `<span class="badge ${st === "Approved" ? "approved" : "pending"}">${st}</span>`;

function crumbs(list) {
  $("#crumbs").innerHTML = list.map(([label, fn]) => fn ? `<span onclick="${fn}">${label}</span>` : label).join(" / ");
}
function setActive(nav) {
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === nav));
}
function go(page) {
  setActive(page);
  ({ dashboard, subjects: subjectsPage, students: studentsPage, evaluations: evaluationsPage, profile })[page]();
}

// ===== DASHBOARD =====
function dashboard() {
  crumbs([["Dashboard"]]);
  const evs = myEvals();
  const pending = evs.filter((e) => e.status !== "Approved").length;
  const years = [1, 2, 3, 4].map((y) => {
    const subs = mySubjects().filter((s) => s.year === y);
    return `<div class="card year-card ${subs.length ? "" : "disabled"}" ${subs.length ? `onclick="yearPage(${y})"` : ""}>
      <div class="yr">${yearName(y)}</div>
      <p class="muted">${subs.length} subject${subs.length !== 1 ? "s" : ""} assigned</p>
      <div>${subs.map((s) => `<span class="subj-tag">${s.subjectCode}</span>`).join("") || '<span class="muted">—</span>'}</div>
    </div>`;
  }).join("");

  content().innerHTML = `
    ${profileBanner()}
    <div class="grid g4">
      ${stat("Subjects", mySubjects().length)}
      ${stat("Exams", myExams().length)}
      ${stat("Scripts evaluated", evs.length)}
      ${stat("Pending review", pending)}
    </div><br>
    <h2>Academic Years</h2>
    <div class="grid g4">${years}</div>
    <div class="card"><h3>Recent evaluations</h3>${evalTable(evs)}</div>`;
}
const stat = (l, n) => `<div class="card stat"><div class="muted">${l}</div><div class="num">${n}</div></div>`;

function profileBanner() {
  const init = me.name.split(" ").filter(w => !w.endsWith(".")).map(w => w[0]).join("").slice(0, 2);
  const depts = [...new Set(me.assignments.map((a) => a.department))];
  return `<div class="card profile-card">
    <div class="avatar">${init}</div>
    <div>
      <h2 style="margin:0">Welcome, ${me.name}</h2>
      <div>${me.designation} · Dept. of ${me.department}</div>
      <div class="meta">
        <span class="pill">✉ ${me.email}</span>
        <span class="pill">ID ${me.id}</span>
        <span class="pill">Teaches: ${depts.join(", ")}</span>
        <span class="pill">Years: ${[...new Set(me.assignments.map(a => a.year))].sort().map(yearName).join(", ")}</span>
      </div>
    </div>
  </div>`;
}

// ===== YEAR PAGE =====
function yearPage(y) {
  setActive("subjects");
  crumbs([["Dashboard", "go('dashboard')"], [yearName(y)]]);
  const subs = mySubjects().filter((s) => s.year === y);
  content().innerHTML = `<h2>${yearName(y)} — Assigned Subjects</h2>
    <div class="grid g3">${subs.map(subjectCard).join("")}</div>`;
}
function subjectCard(s) {
  const n = DB.exams.filter((e) => e.subjectCode === s.subjectCode).length;
  return `<div class="card year-card" onclick="subjectPage('${s.subjectCode}')">
    <span class="subj-tag">${s.subjectCode}</span>
    <h3 style="margin-top:8px">${s.subject}</h3>
    <p class="muted">${s.department} · Semester ${s.semester} · ${yearName(s.year)}</p>
    <p class="muted" style="margin-top:6px">${n} exam(s)</p>
  </div>`;
}

// ===== SUBJECTS LIST =====
function subjectsPage() {
  crumbs([["My Subjects"]]);
  content().innerHTML = `<h2>My Subjects</h2>
    <div class="card table-wrap"><table>
      <tr><th>Code</th><th>Subject</th><th>Department</th><th>Year</th><th>Semester</th><th></th></tr>
      ${mySubjects().map((s) => `<tr><td>${s.subjectCode}</td><td>${s.subject}</td><td>${s.department}</td>
        <td>${yearName(s.year)}</td><td>${s.semester}</td>
        <td><button class="btn" onclick="subjectPage('${s.subjectCode}')">Open</button></td></tr>`).join("")}
    </table></div>`;
}

// ===== SUBJECT PAGE =====
function subjectPage(code) {
  setActive("subjects");
  const s = mySubjects().find((x) => x.subjectCode === code);
  crumbs([["Dashboard", "go('dashboard')"], [yearName(s.year), `yearPage(${s.year})`], [s.subject]]);
  const exams = DB.exams.filter((e) => e.subjectCode === code);
  content().innerHTML = `
    <div class="row"><div><h2 style="margin:0">${s.subject} <span class="subj-tag">${code}</span></h2>
      <p class="muted">${s.department} · Semester ${s.semester} · ${yearName(s.year)}</p></div>
      <div class="spacer"></div>
      <button class="btn primary" onclick="newExamModal('${code}')">+ Create Exam</button></div><br>
    ${exams.length ? exams.map(examCard).join("") : `<div class="card muted">No exams yet. Create one to upload answer scripts.</div>`}`;
}
function examCard(e) {
  const evs = DB.evaluations.filter((v) => v.examId === e.id);
  return `<div class="card">
    <div class="row"><div><h3 style="margin:0">${e.name}</h3>
      <p class="muted">${e.date} · Max ${e.maxMarks} marks · ${e.questions.length} questions</p></div>
      <div class="spacer"></div>
      <button class="btn primary" onclick="uploadScriptModal('${e.id}')">Upload Answer Script</button></div>
    <details style="margin-top:12px"><summary class="muted" style="cursor:pointer">Question paper & CO mapping</summary>
      <div class="table-wrap"><table><tr><th>Q</th><th>Question</th><th>Marks</th><th>CO</th><th>Bloom (required)</th></tr>
      ${e.questions.map((q) => `<tr><td>${q.no}</td><td>${q.text}</td><td>${q.marks}</td><td>${q.co}</td><td>${q.bloom}</td></tr>`).join("")}
      </table></div></details>
    <h3 style="margin-top:16px">Evaluated scripts</h3>${evalTable(evs)}
  </div>`;
}

// ===== EVAL TABLE =====
function evalTable(evs) {
  if (!evs.length) return `<p class="muted">No scripts evaluated yet.</p>`;
  return `<div class="table-wrap"><table><tr><th>Student</th><th>Roll</th><th>Exam</th><th>Marks</th><th>Status</th><th></th></tr>
    ${evs.map((v) => { const st = student(v.studentId), ex = exam(v.examId);
      return `<tr><td>${st.name}</td><td>${st.roll}</td><td>${ex.name}</td><td><b>${total(v)}/${ex.maxMarks}</b></td>
      <td>${badge(v.status)}</td><td><button class="btn" onclick="resultPage('${v.id}')">View</button></td></tr>`; }).join("")}
  </table></div>`;
}

// ===== CREATE EXAM =====
function newExamModal(code) {
  openModal(`<h2>Create Exam — ${code}</h2>
    <label>Exam name</label><input id="exName" placeholder="Mid-Sem Test 2">
    <div class="grid g2"><div><label>Date</label><input id="exDate" type="date"></div>
    <div><label>Max marks</label><input id="exMax" type="number" value="20"></div></div>
    <label>Question paper (PDF/image)</label><input type="file" accept=".pdf,image/*">
    <label>Questions (one per line: text | marks | CO | Bloom)</label>
    <textarea id="exQs" rows="5" placeholder="Define recursion | 5 | CO1 | Remember"></textarea>
    <div class="row"><div class="spacer"></div><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="saveExam('${code}')">Save Exam</button></div>`);
}
function saveExam(code) {
  const name = $("#exName").value.trim();
  if (!name) return alert("Enter exam name");
  const qs = $("#exQs").value.split("\n").filter(Boolean).map((l, i) => {
    const [text, marks, co, bloom] = l.split("|").map((x) => x && x.trim());
    return { no: "Q" + (i + 1), text, marks: +marks || 0, co: co || "CO1", bloom: bloom || "Understand" };
  });
  DB.exams.push({ id: "E" + Date.now(), subjectCode: code, name, date: $("#exDate").value || "—", maxMarks: +$("#exMax").value, questions: qs });
  closeModal(); subjectPage(code);
}

// ===== UPLOAD SCRIPT (mock pipeline) =====
function uploadScriptModal(examId) {
  const ex = exam(examId);
  const subj = mySubjects().find((s) => s.subjectCode === ex.subjectCode);
  const eligible = DB.students.filter((s) => s.year === subj.year && s.department === subj.department);
  openModal(`<h2>Upload Answer Script</h2><p class="muted">${ex.name} · ${subj.subject}</p><br>
    <label>Student</label>
    <select id="stuSel">${eligible.map((s) => `<option value="${s.id}">${s.roll} — ${s.name}</option>`).join("")}</select>
    <div class="drop" onclick="document.getElementById('pages').click()">📄 Click to choose scanned pages (PDF / images)</div>
    <input type="file" id="pages" multiple accept=".pdf,image/*" class="hidden" onchange="listFiles(this)">
    <div class="file-list" id="fileList"></div>
    <div class="steps" id="steps">${["Uploaded", "PaddleOCR", "Question mapping", "LLM evaluation", "Ready"].map((s) => `<span class="step">${s}</span>`).join("")}</div>
    <div class="row"><div class="spacer"></div><button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" id="procBtn" onclick="processScript('${examId}')">Process Script</button></div>`);
}
function listFiles(inp) {
  $("#fileList").innerHTML = [...inp.files].map((f, i) => `Page ${i + 1}: ${f.name}`).join("<br>");
}
function processScript(examId) {
  const sid = $("#stuSel").value;
  if (!$("#pages").files.length) return alert("Choose at least one page");
  $("#procBtn").disabled = true;
  const steps = document.querySelectorAll("#steps .step");
  let i = 0;
  const tick = setInterval(() => {
    steps.forEach((s, k) => s.className = "step" + (k < i ? " done" : k === i ? " active" : ""));
    if (i++ >= steps.length) {
      clearInterval(tick);
      const ex = exam(examId);
      const ev = {
        id: "EV" + Date.now(), examId, studentId: sid, status: "Pending Review",
        results: ex.questions.map((q) => ({
          q: q.no, marks: Math.round(q.marks * (0.4 + Math.random() * 0.6)), demonstrated: q.bloom,
          ocrConf: +(0.7 + Math.random() * 0.28).toFixed(2), feedback: "Mock AI feedback — replace with LLM output.",
          extracted: "(Mock) Text extracted by PaddleOCR will appear here."
        })),
        gaps: ["(Mock) Gap detected from repeated low scores"]
      };
      DB.evaluations.push(ev);
      closeModal(); resultPage(ev.id);
    }
  }, 600);
}

// ===== RESULT PAGE =====
function resultPage(id) {
  setActive("evaluations");
  const v = DB.evaluations.find((x) => x.id === id), ex = exam(v.examId), st = student(v.studentId);
  const subj = mySubjects().find((s) => s.subjectCode === ex.subjectCode);
  crumbs([["Dashboard", "go('dashboard')"], [subj.subject, `subjectPage('${subj.subjectCode}')`], [st.name]]);
  const t = total(v);
  const coMap = {};
  ex.questions.forEach((q) => { const r = v.results.find((x) => x.q === q.no);
    coMap[q.co] = coMap[q.co] || [0, 0]; coMap[q.co][0] += r ? r.marks : 0; coMap[q.co][1] += q.marks; });

  content().innerHTML = `
    <div class="grid g4">
      ${stat("Student", `<span style="font-size:18px">${st.name}</span>`)}
      ${stat("Roll", `<span style="font-size:18px">${st.roll}</span>`)}
      ${stat("Total", `${t}/${ex.maxMarks}`)}
      <div class="card stat"><div class="muted">Status</div><div style="margin-top:12px">${badge(v.status)}</div></div>
    </div>
    <div class="card"><h3>Question-wise evaluation <span class="muted">(AI marks are provisional — edit before approving)</span></h3>
      <div class="table-wrap"><table>
      <tr><th>Q</th><th>Extracted answer (OCR)</th><th>OCR conf.</th><th>Bloom req. → shown</th><th>CO</th><th>Feedback</th><th>Marks</th></tr>
      ${v.results.map((r, i) => { const q = ex.questions.find((x) => x.no === r.q);
        return `<tr><td><b>${r.q}</b></td><td style="max-width:260px">${r.extracted}</td>
        <td><span class="badge ${r.ocrConf < 0.8 ? "low" : "approved"}">${Math.round(r.ocrConf * 100)}%</span></td>
        <td>${q.bloom} → ${r.demonstrated}</td><td>${q.co}</td><td>${r.feedback}</td>
        <td><input class="marks-input" type="number" min="0" max="${q.marks}" value="${r.marks}" ${v.status === "Approved" ? "disabled" : ""}
          onchange="editMark('${v.id}',${i},this,${q.marks})"> / ${q.marks}</td></tr>`; }).join("")}
      </table></div></div>
    <div class="grid g2">
      <div class="card"><h3>CO attainment</h3>
        ${Object.entries(coMap).map(([co, [g, m]]) => `<div style="margin-bottom:12px"><div class="row"><b>${co}</b><div class="spacer"></div>${g}/${m} (${Math.round(g / m * 100)}%)</div>
        <div class="progress"><div style="width:${g / m * 100}%"></div></div></div>`).join("")}
      </div>
      <div class="card"><h3>Detected knowledge gaps</h3><ul style="padding-left:18px;line-height:1.9">${v.gaps.map((g) => `<li>${g}</li>`).join("")}</ul></div>
    </div>
    <div class="row"><div class="spacer"></div>
      ${v.status !== "Approved" ? `<button class="btn ok" onclick="approve('${v.id}')">✓ Approve Final Result</button>` : `<span class="muted">Approved — marks locked.</span>`}
    </div>`;
}
function editMark(id, i, el, max) {
  const v = DB.evaluations.find((x) => x.id === id);
  const val = Math.max(0, Math.min(max, +el.value || 0));
  el.value = val; v.results[i].marks = val; resultPage(id);
}
function approve(id) { DB.evaluations.find((x) => x.id === id).status = "Approved"; resultPage(id); }

// ===== STUDENTS =====
function studentsPage() {
  crumbs([["Students"]]);
  const pairs = new Set(mySubjects().map((s) => s.department + s.year));
  const list = DB.students.filter((s) => pairs.has(s.department + s.year));
  content().innerHTML = `<h2>My Students</h2><div class="card table-wrap"><table>
    <tr><th>ID</th><th>Roll</th><th>Name</th><th>Dept</th><th>Year</th><th>Scripts</th></tr>
    ${list.map((s) => `<tr><td>${s.id}</td><td>${s.roll}</td><td>${s.name}</td><td>${s.department}</td><td>${yearName(s.year)}</td>
      <td>${DB.evaluations.filter((e) => e.studentId === s.id).length}</td></tr>`).join("")}
  </table></div>`;
}

// ===== EVALUATIONS =====
function evaluationsPage() {
  crumbs([["AI Evaluations"]]);
  content().innerHTML = `<h2>AI Evaluations</h2><div class="card">${evalTable(myEvals())}</div>`;
}

// ===== PROFILE =====
function profile() {
  crumbs([["Profile"]]);
  content().innerHTML = `${profileBanner()}
    <div class="card"><h3>Teacher details</h3><table>
      <tr><th>Teacher ID</th><td>${me.id}</td></tr><tr><th>Name</th><td>${me.name}</td></tr>
      <tr><th>Email</th><td>${me.email}</td></tr><tr><th>Phone</th><td>${me.phone}</td></tr>
      <tr><th>Designation</th><td>${me.designation}</td></tr><tr><th>Home dept.</th><td>${me.department}</td></tr>
    </table></div>
    <div class="card"><h3>Teaching assignments</h3><div class="table-wrap"><table>
      <tr><th>Year</th><th>Semester</th><th>Department</th><th>Code</th><th>Subject</th></tr>
      ${me.assignments.map((a) => `<tr><td>${yearName(a.year)}</td><td>${a.semester}</td><td>${a.department}</td><td>${a.subjectCode}</td><td>${a.subject}</td></tr>`).join("")}
    </table></div></div>`;
}

// ===== MODAL =====
function openModal(html) { $("#modalBox").innerHTML = html; $("#modal").classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
$("#modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };

// ===== BOOT =====
restore();
if (me) startApp();
