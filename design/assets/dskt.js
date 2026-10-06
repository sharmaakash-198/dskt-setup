/* DSKT design mockups: shared sample data and the one floor renderer used by
   both the Facilities and Workplace pages. Static design reference only.

   Geometry follows docs/architecture/GEOMETRY.md: integer world units of 10 cm,
   template-local polygons, placements that translate and quarter-turn only.
   Every employee here is synthetic. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  /* ---------------- icons ---------------- */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    download: '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    cursor: '<path d="M5.5 3.5 18.5 12l-6 1.6-3 5.9z"/>',
    hand: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5V5a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.6-2.2L4.6 15a1.5 1.5 0 0 1 2.3-1.9L8 14.2"/>',
    boundary: '<path d="M4 4h10v6h6v10H4z"/><circle cx="4" cy="4" r="1.4"/><circle cx="14" cy="4" r="1.4"/><circle cx="20" cy="20" r="1.4"/>',
    rotate: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path d="m3.5 16.5 8.5 4.5 8.5-4.5"/>',
    building: '<path d="M5 20V5h10v15M15 9h4v11M3 20h18M8 8h1M11 8h1M8 11h1M11 11h1M8 14h1M11 14h1"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    chevronDown: '<path d="m5 9 7 7 7-7"/>',
    zoomIn: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8 11h6M11 8v6"/>',
    zoomOut: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8 11h6"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    sheet: '<path d="M5 3h10l4 4v14H5z"/><path d="M5 10h14M5 15h14M10 10v11"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>',
    tag: '<path d="M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5z"/><circle cx="8" cy="8.5" r="1.3"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    users: '<circle cx="9" cy="9" r="3.5"/><path d="M2.5 19.5a6.5 6.5 0 0 1 13 0"/><path d="M15.5 5.7a3.5 3.5 0 0 1 0 6.6M17.5 14a6.5 6.5 0 0 1 4 5.5"/>',
    grid: '<path d="M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
    template: '<path d="M4 4h7v7H4zM13 4h7v4h-3v3h-4zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    publish: '<path d="M12 16V5m0 0L7.5 9.5M12 5l4.5 4.5"/><path d="M5 20h14"/>',
    dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
    logout: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V4H4v12h4"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
  };

  function injectIcons() {
    const symbols = Object.entries(ICONS)
      .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`)
      .join("");
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${symbols}</svg>`
    );
  }
  const icon = (name, cls = "ico") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  /* ---------------- theme toggle (local review convenience) ---------------- */
  function bindThemeToggle() {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const root = document.documentElement;
        const dark =
          root.dataset.theme === "dark" ||
          (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
        root.dataset.theme = dark ? "light" : "dark";
        try { localStorage.setItem("dskt-theme", root.dataset.theme); } catch (e) {}
      });
    });
    try {
      const saved = localStorage.getItem("dskt-theme");
      if (saved) document.documentElement.dataset.theme = saved;
    } catch (e) {}
  }

  /* ---------------- toasts ---------------- */
  function toast(msg, kind) {
    let host = document.querySelector(".toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "toasts";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ---------------- seeded random ---------------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- templates (template-local integer coordinates) ---------------- */
  const rect = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];
  const TEMPLATES = {
    desk:    { name: "Desk 160 × 80 cm", rev: 3, category: "Desk", cls: "physical", assignable: true, color: "desk", poly: rect(16, 8) },
    corner:  { name: "Corner desk 160 × 140 cm", rev: 1, category: "Desk", cls: "physical", assignable: true, color: "desk", poly: [[0, 0], [16, 0], [16, 14], [8, 14], [8, 8], [0, 8]] },
    office:  { name: "Private office 3.2 × 3.2 m", rev: 2, category: "Private Office", cls: "physical", assignable: true, color: "office", poly: rect(32, 32) },
    pillar:  { name: "Pillar 60 × 60 cm", rev: 1, category: "Obstacle", cls: "obstacle", assignable: false, color: "obstacle", poly: rect(6, 6) },
    planter: { name: "Planter 40 × 40 cm", rev: 1, category: "Plant", cls: "physical", assignable: false, color: "plant", poly: rect(4, 4) },
    counter: { name: "Pantry counter 4 × 0.8 m", rev: 1, category: "Furniture", cls: "physical", assignable: false, color: "furniture", poly: rect(40, 8) },
    table:   { name: "Meeting table 3.6 × 1.2 m", rev: 2, category: "Furniture", cls: "physical", assignable: false, color: "furniture", poly: rect(36, 12) },
    meeting: { name: "Meeting room 12 × 9 m", rev: 1, category: "Room", cls: "zone", assignable: false, color: "zone", poly: rect(120, 90) },
    pantry:  { name: "Pantry 12 × 9 m", rev: 1, category: "Room", cls: "zone", assignable: false, color: "zone", poly: rect(120, 90) },
    walkway: { name: "Walkway 36 × 2.4 m", rev: 1, category: "Walking area", cls: "zone", assignable: false, color: "walk", poly: rect(360, 24) },
    teamA:   { name: "Team area 19 × 12 m", rev: 1, category: "Team area", cls: "zone", assignable: false, color: "zone", poly: rect(190, 120) },
    teamB:   { name: "Team area 33 × 12.4 m", rev: 1, category: "Team area", cls: "zone", assignable: false, color: "zone", poly: rect(330, 124) },
  };
  // Placement counts shown in the template library (illustrative, across Arrise).
  const TEMPLATE_USAGE = { desk: 1184, corner: 22, office: 61, pillar: 148, planter: 203, counter: 9, table: 31, meeting: 27, pantry: 8, walkway: 14, teamA: 3, teamB: 2 };

  /* ---------------- geometry ---------------- */
  function rotatePoint([a, b], rot) {
    switch (rot) {
      case 90: return [-b, a];
      case 180: return [-a, -b];
      case 270: return [b, -a];
      default: return [a, b];
    }
  }
  function bbox(pts) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
      if (x < minX) minX = x; if (y < minY) minY = y;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }
  // World polygon of a placement: rotate local vertices about the template origin, then translate.
  function worldPoly(p) {
    return TEMPLATES[p.tpl].poly.map((v) => {
      const [a, b] = rotatePoint(v, p.rot);
      return [a + p.x, b + p.y];
    });
  }
  // Translation that puts the rotated shape's bounding box at (bx, by).
  function translationFor(tpl, bx, by, rot) {
    const b = bbox(TEMPLATES[tpl].poly.map((v) => rotatePoint(v, rot)));
    return { x: bx - b.minX, y: by - b.minY };
  }

  // Floor Boundary, anticlockwise with y up (rendered y-down), first vertex not repeated.
  const BOUNDARY = [[0, 0], [480, 0], [480, 200], [360, 200], [360, 300], [0, 300]];
  // The boundary decomposed into two rectangles for the mockup's containment check.
  const BOUNDARY_RECTS = [
    { minX: 0, minY: 0, maxX: 360, maxY: 300 },
    { minX: 0, minY: 0, maxX: 480, maxY: 200 },
  ];
  function insideBoundary(b) {
    return BOUNDARY_RECTS.some((r) => b.minX >= r.minX && b.minY >= r.minY && b.maxX <= r.maxX && b.maxY <= r.maxY);
  }
  // Interior overlap of two bounding boxes; touching edges is allowed.
  const overlaps = (a, b) => a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;

  /* ---------------- published floor: Noida, Tower B, Floor 3 ---------------- */
  let seq = 0;
  const pid = () => "pl_" + (1000 + seq++).toString(36);
  function place(tpl, bx, by, rot = 0, extra = {}) {
    const t = translationFor(tpl, bx, by, rot);
    return { id: pid(), tpl, x: t.x, y: t.y, rot, label: "", ...extra };
  }

  function buildFloor() {
    seq = 0;
    const P = [];
    P.push(place("teamA", 140, 8, 0, { label: "Platform Engineering" }));
    P.push(place("teamB", 8, 164, 0, { label: "Game Studio" }));
    P.push(place("walkway", 0, 132, 0, { label: "Main walkway" }));
    P.push(place("meeting", 360, 0, 0, { label: "Ganga" }));
    P.push(place("pantry", 360, 110, 0, { label: "Pantry" }));

    ["O-01", "O-02", "O-03", "O-04"].forEach((l, i) => P.push(place("office", i * 32, 0, 0, { label: l })));
    P.push(place("corner", 16, 60, 0, { label: "C-01" }));
    P.push(place("corner", 56, 60, 90, { label: "C-02" }));

    // Desk pods: two back-to-back rows of four, the far row turned 180°.
    function pod(x0, y0, prefix, start) {
      let n = start;
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 4; i++) {
          const label = prefix ? `${prefix}-${String(n++).padStart(3, "0")}` : "";
          P.push(place("desk", x0 + i * 16, y0 + row * 8, row ? 180 : 0, { label, pod: `${x0},${y0}` }));
        }
      return n;
    }
    let a = 1;
    for (const y of [24, 56, 88]) for (const x of [150, 230]) a = pod(x, y, "A", a);
    let b = 1;
    for (const y of [180, 220, 260]) for (const x of [20, 100, 180, 260]) b = pod(x, y, x === 260 ? "" : "B", b);

    P.push(place("pillar", 218, 62), place("pillar", 90, 200), place("pillar", 250, 240), place("pillar", 330, 92));
    P.push(place("table", 402, 39));
    P.push(place("counter", 380, 186), place("planter", 364, 190), place("planter", 472, 114), place("planter", 132, 116), place("planter", 340, 170));
    return P;
  }
  const PLACEMENTS = buildFloor();

  /* ---------------- synthetic people ---------------- */
  const FIRST = ["Aarav","Ananya","Rohan","Priya","Kabir","Isha","Vikram","Meera","Arjun","Sneha","Karan","Diya","Rahul","Neha","Aditya","Tanvi","Siddharth","Pooja","Nikhil","Riya","Varun","Kavya","Manish","Shreya","Harsh","Aisha","Dev","Nandini","Kunal","Ira","Yash","Sana","Omar","Leela","Farhan","Zoya","Gaurav","Ritika","Pranav","Anjali","Tara","Imran","Esha","Rehan","Maya","Sameer","Lavanya","Ishaan"];
  const LAST = ["Sharma","Iyer","Reddy","Kapoor","Menon","Gupta","Nair","Das","Bose","Khan","Joshi","Pillai","Verma","Rao","Chatterjee","Mehta","Singh","Kulkarni","Banerjee","Saxena","Thomas","Fernandes","Malhotra","Agarwal","Hegde","Sethi"];
  const TEAMS = {
    PLAT: { name: "Platform Engineering", dept: "Engineering", titles: ["Backend Engineer", "Senior Backend Engineer", "Site Reliability Engineer", "Engineering Manager"] },
    STUD: { name: "Game Studio", dept: "Studios", titles: ["Game Developer", "Senior Game Developer", "Technical Artist", "Game Designer", "Studio Lead"] },
    QA:   { name: "QA Automation", dept: "Engineering", titles: ["QA Engineer", "SDET"] },
    DATA: { name: "Data & Analytics", dept: "Engineering", titles: ["Data Analyst", "Data Engineer"] },
    LEAD: { name: "Leadership", dept: "Operations", titles: ["Head of Studio", "Director, Engineering", "Head of Operations", "VP, Product"] },
  };

  function buildPeople() {
    const r = rng(42);
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const people = [];
    const used = new Set();
    function make(team) {
      let name;
      do { name = pick(FIRST) + " " + pick(LAST); } while (used.has(name));
      used.add(name);
      const id = "ARR-" + (10200 + people.length * 7 + Math.floor(r() * 6));
      const [f, l] = name.toLowerCase().split(" ");
      const p = {
        id, name, team, teamName: TEAMS[team].name, dept: TEAMS[team].dept,
        title: pick(TEAMS[team].titles), email: `${f}.${l}@arrise.example`,
        site: "Noida", status: "Active", manager: null,
      };
      people.push(p);
      return p;
    }
    const leads = [make("LEAD"), make("LEAD"), make("LEAD"), make("LEAD")];
    for (let i = 0; i < 52; i++) make(i % 6 === 0 ? "QA" : "PLAT");
    for (let i = 0; i < 92; i++) make(i % 9 === 0 ? "DATA" : "STUD");
    for (let i = 0; i < 18; i++) make(pick(["PLAT", "STUD", "QA", "DATA"]));
    people.forEach((p, i) => { if (p.team !== "LEAD") p.manager = leads[i % 4].id; });
    return people;
  }
  const PEOPLE = buildPeople();
  const PEOPLE_BY_ID = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

  /* ---------------- assignments ---------------- */
  // state: current | future. Inactive employees keep their assignment until a planner ends it.
  function buildAssignments() {
    const r = rng(9);
    const out = [];
    const assignable = PLACEMENTS.filter((p) => TEMPLATES[p.tpl].assignable && p.label);
    const queue = {
      LEAD: PEOPLE.filter((p) => p.team === "LEAD"),
      A: PEOPLE.filter((p) => p.team === "PLAT" || p.team === "QA"),
      B: PEOPLE.filter((p) => p.team === "STUD" || p.team === "DATA"),
      X: PEOPLE.filter((p) => p.team !== "LEAD").slice(-18),
    };
    const day = (d) => d.toISOString().slice(0, 10);
    for (const p of assignable) {
      const key = p.label.startsWith("O-") ? "LEAD" : p.label.startsWith("A") ? "A" : p.label.startsWith("B") ? "B" : "X";
      const roll = r();
      if (key !== "LEAD" && roll < 0.14) continue; // vacant
      const emp = queue[key].shift();
      if (!emp) continue;
      const start = new Date(Date.UTC(2025, Math.floor(r() * 20), 1 + Math.floor(r() * 27)));
      if (roll < 0.21 && key !== "LEAD") {
        out.push({ id: "as_" + out.length, pid: p.id, emp: emp.id, start: r() < 0.5 ? "2026-10-19" : "2026-11-02", end: null, state: "future" });
      } else {
        out.push({ id: "as_" + out.length, pid: p.id, emp: emp.id, start: day(start), end: null, state: "current" });
      }
    }
    // Two employees deactivated by the last import while still assigned.
    const cur = out.filter((a) => a.state === "current" && !PEOPLE_BY_ID[a.emp].team.startsWith("LEAD"));
    [cur[7], cur[40]].forEach((a) => { PEOPLE_BY_ID[a.emp].status = "Inactive"; });
    // One leader also holds a studio desk: an Employee may hold multiple Assignments.
    const lead = PEOPLE.find((p) => p.team === "LEAD");
    const free = assignable.find((p) => p.label === "B-030" && !out.some((a) => a.pid === p.id));
    const target = free || assignable.find((p) => p.label.startsWith("B") && !out.some((a) => a.pid === p.id));
    if (target) out.push({ id: "as_" + out.length, pid: target.id, emp: lead.id, start: "2026-03-02", end: null, state: "current" });
    return out;
  }
  const ASSIGNMENTS = buildAssignments();

  function spaceStatus(placement, assignments = ASSIGNMENTS) {
    const list = assignments.filter((a) => a.pid === placement.id);
    const cur = list.find((a) => a.state === "current");
    const fut = list.find((a) => a.state === "future");
    if (cur && PEOPLE_BY_ID[cur.emp].status === "Inactive") return { state: "inactive", a: cur, emp: PEOPLE_BY_ID[cur.emp], next: fut };
    if (cur) return { state: "occupied", a: cur, emp: PEOPLE_BY_ID[cur.emp], next: fut };
    if (fut) return { state: "future", a: fut, emp: PEOPLE_BY_ID[fut.emp] };
    return { state: "vacant" };
  }
  const initials = (name) => name.split(" ").map((s) => s[0]).join("").slice(0, 2);

  /* ---------------- map view: pan and Zoom (visual only) ---------------- */
  // 100% Zoom = 2 screen px per world unit (20 px per metre).
  function MapView(svg, { onChange, panGate } = {}) {
    const vb = { x: -24, y: -24, w: 528, h: 348 };
    const apply = () => {
      svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
      const s = pxPerUnit();
      svg.classList.toggle("lod-low", s < 2.6);
      svg.classList.toggle("lod-mid", s >= 2.6 && s < 5);
      onChange && onChange(api);
    };
    const pxPerUnit = () => { const m = svg.getScreenCTM(); return m ? m.a : 1; };
    function toWorld(evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const m = svg.getScreenCTM();
      return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
    }
    function zoomAt(k, p) {
      const nk = Math.min(Math.max(k, 0.12), 8);
      vb.x = p.x - nk * (p.x - vb.x); vb.y = p.y - nk * (p.y - vb.y);
      vb.w *= nk; vb.h *= nk;
      apply();
    }
    function zoomBy(k) { zoomAt(k, { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }); }
    function fit(b = { minX: 0, minY: 0, maxX: 480, maxY: 300 }, pad = 24) {
      vb.x = b.minX - pad; vb.y = b.minY - pad; vb.w = b.maxX - b.minX + pad * 2; vb.h = b.maxY - b.minY + pad * 2;
      apply();
    }
    function visible() {
      const r = svg.getBoundingClientRect(); const s = pxPerUnit();
      const c = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 };
      return { minX: c.x - r.width / s / 2, maxX: c.x + r.width / s / 2, minY: c.y - r.height / s / 2, maxY: c.y + r.height / s / 2 };
    }
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const k = Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0022));
      zoomAt(k, toWorld(e));
    }, { passive: false });
    let pan = null;
    svg.addEventListener("pointerdown", (e) => {
      if (e.button === 1 || (panGate && panGate(e))) {
        pan = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y };
        svg.setPointerCapture(e.pointerId);
        svg.style.cursor = "grabbing";
        e.stopImmediatePropagation();
      }
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pan) return;
      const s = pxPerUnit();
      vb.x = pan.vx - (e.clientX - pan.x) / s; vb.y = pan.vy - (e.clientY - pan.y) / s;
      apply();
    });
    const end = () => { if (pan) { pan = null; svg.style.cursor = ""; } };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    new ResizeObserver(() => apply()).observe(svg);
    const api = { vb, apply, toWorld, zoomBy, zoomAt, fit, pxPerUnit, visible, get panning() { return !!pan; }, zoomPercent: () => Math.round((pxPerUnit() / 2) * 100) };
    return api;
  }

  /* ---------------- renderer (shared by both experiences) ---------------- */
  const pts = (poly) => poly.map((v) => v.join(",")).join(" ");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function setupMap(svg) {
    svg.classList.add("map");
    svg.innerHTML = `
      <defs>
        <pattern id="hatch" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2.4" height="2.4" fill="var(--el-fill)"/>
          <line x1="0" y1="0" x2="0" y2="2.4" stroke="var(--cat-obstacle)" stroke-width="0.8"/>
        </pattern>
        <pattern id="hatch-warn" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2" height="2" fill="var(--warn-soft)"/>
          <line x1="0" y1="0" x2="0" y2="2" stroke="var(--warn)" stroke-width="0.5"/>
        </pattern>
        <clipPath id="boundary-clip"><polygon points="${pts(BOUNDARY)}"/></clipPath>
      </defs>
      <rect class="outside" x="-4000" y="-4000" width="8480" height="8300"/>
      <polygon class="boundary" points="${pts(BOUNDARY)}"/>
      <g class="layer-grid" clip-path="url(#boundary-clip)"></g>
      <polygon points="${pts(BOUNDARY)}" fill="none" stroke="var(--boundary)" stroke-width="2.5" vector-effect="non-scaling-stroke" pointer-events="none"/>
      <g class="layer-zones"></g>
      <g class="layer-obstacles"></g>
      <g class="layer-elements"></g>
      <g class="layer-labels"></g>
      <g class="layer-status"></g>
      <g class="layer-selection"></g>
      <g class="layer-preview"></g>`;
    return svg;
  }

  // Adaptive grid: lines at the Editing Scale, thinned (render only) when they would crowd.
  function renderGrid(svg, view, scale) {
    const g = svg.querySelector(".layer-grid");
    if (!scale) { g.innerHTML = ""; return 1; }
    const s = view.pxPerUnit();
    let step = scale, thin = 1;
    while (step * s < 6) { step *= 2; thin *= 2; }
    const v = view.visible();
    const x0 = Math.max(0, Math.floor(v.minX / step) * step), x1 = Math.min(480, v.maxX);
    const y0 = Math.max(0, Math.floor(v.minY / step) * step), y1 = Math.min(300, v.maxY);
    const major = step * 8;
    let minor = "", maj = "";
    for (let x = x0; x <= x1; x += step) (x % major === 0 ? (maj += `M${x} 0V300`) : (minor += `M${x} 0V300`));
    for (let y = y0; y <= y1; y += step) (y % major === 0 ? (maj += `M0 ${y}H480`) : (minor += `M0 ${y}H480`));
    g.innerHTML = `<path class="grid-minor" d="${minor}"/><path class="grid-major" d="${maj}"/>`;
    return thin;
  }

  /* opts: { mode: 'facilities'|'workplace', placements, selected:Set, invalid:Set,
             status(p) -> {state, emp}, dim(p) -> bool, highlight:Set } */
  function renderFloor(svg, opts) {
    const { mode, placements, selected = new Set(), invalid = new Set(), highlight = new Set() } = opts;
    let zones = "", obst = "", els = "", labels = "", status = "", sel = "";
    for (const p of placements) {
      const t = TEMPLATES[p.tpl];
      const poly = worldPoly(p);
      const b = bbox(poly);
      const color = `var(--cat-${t.color})`;
      const dim = opts.dim && opts.dim(p) ? ' opacity="0.28"' : "";
      const bad = invalid.has(p.id);
      if (t.cls === "zone") {
        const zl = mode === "facilities" ? "hit" : "";
        zones += `<polygon class="el el-zone ${zl}" data-id="${p.id}" points="${pts(poly)}" stroke="${color}" fill="${color}" fill-opacity="${t.color === "walk" ? 0.05 : 0.045}"${mode === "workplace" ? ' pointer-events="none"' : ""}/>`;
        labels += `<text class="zone-label" x="${b.minX + 4}" y="${b.minY + 9}" fill="${color}" font-size="7" style="font-size:7px">${esc(p.label)}</text>`;
        continue;
      }
      if (t.cls === "obstacle") {
        obst += `<polygon class="el el-obstacle ${mode === "facilities" ? "hit" : ""}" data-id="${p.id}" points="${pts(poly)}" stroke="${color}"${mode === "workplace" ? ' pointer-events="none"' : ""}/>`;
        continue;
      }
      const st = mode === "workplace" && t.assignable && opts.status ? opts.status(p) : null;
      const hitCls = mode === "facilities" || t.assignable ? "hit" : "";
      const stroke = bad ? "var(--crit)" : color;
      const fill = bad ? "var(--crit-soft)" : st && st.state === "inactive" ? "url(#hatch-warn)" : highlight.has(p.id) ? "var(--accent-soft)" : "var(--el-fill)";
      els += `<polygon class="el ${hitCls}" data-id="${p.id}" points="${pts(poly)}" stroke="${stroke}" fill="${fill}"${dim}${mode === "workplace" && !t.assignable ? ' pointer-events="none"' : ""}/>`;

      // Labels and status glyphs
      if (p.tpl === "office") {
        labels += `<text class="el-label" x="${b.cx}" y="${b.minY + 7}" text-anchor="middle" style="font-size:4.2px"${dim}>${esc(p.label)}</text>`;
        if (st && st.emp) labels += `<text class="el-label occ-text" x="${b.cx}" y="${b.cy + 6}" text-anchor="middle" style="font-size:2.8px;fill:var(--ink)"${dim}>${esc(st.emp.name)}</text>`;
      } else if (t.assignable) {
        const wide = b.w >= b.h;
        if (p.label) {
          const lx = wide ? b.minX + 1.3 : b.cx;
          const ly = wide ? b.cy + 1 : b.minY + 3.4;
          labels += `<text class="el-label" x="${lx}" y="${ly}" text-anchor="${wide ? "start" : "middle"}" style="font-size:2.7px"${dim}>${esc(p.label)}</text>`;
        }
      }
      if (st) {
        const gx = p.tpl === "office" ? b.cx : b.w >= b.h ? b.maxX - 3 : b.cx;
        const gy = p.tpl === "office" ? b.cy - 1 : b.w >= b.h ? b.cy : b.maxY - 3;
        const r = p.tpl === "office" ? 3.6 : 2.3;
        const ini = st.emp ? initials(st.emp.name) : "";
        if (st.state === "occupied") {
          status += `<g${dim}><circle cx="${gx}" cy="${gy}" r="${r}" fill="var(--ink-2)"/><text class="el-label occ-text" x="${gx}" y="${gy + r * 0.32}" text-anchor="middle" style="font-size:${r * 0.85}px;fill:var(--el-fill);font-weight:600">${ini}</text></g>`;
        } else if (st.state === "future") {
          status += `<g${dim}><circle cx="${gx}" cy="${gy}" r="${r}" fill="var(--el-fill)" stroke="var(--info)" stroke-width="0.55" stroke-dasharray="0.9 0.6"/><path d="M${gx} ${gy - r * 0.55}V${gy}l${r * 0.45} ${r * 0.3}" stroke="var(--info)" stroke-width="0.45" fill="none"/></g>`;
        } else if (st.state === "inactive") {
          status += `<g${dim}><path d="M${gx} ${gy - r}L${gx + r} ${gy + r * 0.8}H${gx - r}Z" fill="var(--warn)"/><text x="${gx}" y="${gy + r * 0.55}" text-anchor="middle" style="font:700 ${r}px var(--f-sans);fill:var(--el-fill)">!</text></g>`;
        }
      }
      if (bad) status += `<circle class="issue-pin" cx="${b.maxX}" cy="${b.minY}" r="1.8"/>`;
    }
    for (const p of placements) {
      if (!selected.has(p.id)) continue;
      const poly = worldPoly(p);
      sel += `<polygon class="sel sel-fill" points="${pts(poly)}"/>`;
      if (mode === "facilities" && selected.size === 1) {
        const b = bbox(poly);
        for (const [hx, hy] of [[b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY]])
          sel += `<rect class="handle" x="${hx - 0.9}" y="${hy - 0.9}" width="1.8" height="1.8"/>`;
      }
    }
    svg.querySelector(".layer-zones").innerHTML = zones;
    svg.querySelector(".layer-obstacles").innerHTML = obst;
    svg.querySelector(".layer-elements").innerHTML = els;
    svg.querySelector(".layer-labels").innerHTML = labels;
    svg.querySelector(".layer-status").innerHTML = status;
    svg.querySelector(".layer-selection").innerHTML = sel;
  }

  // Small static thumbnail of a template polygon for catalogs.
  function templateThumb(key, size = 56) {
    const t = TEMPLATES[key];
    const b = bbox(t.poly);
    const pad = Math.max(b.w, b.h) * 0.12;
    const fill = t.cls === "obstacle" ? "url(#thumb-hatch)" : t.cls === "zone" ? `var(--cat-${t.color})` : "var(--el-fill)";
    return `<svg viewBox="${-pad} ${-pad} ${b.w + pad * 2} ${b.h + pad * 2}" width="${size}" height="${size}" aria-hidden="true">
      <defs><pattern id="thumb-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="var(--el-fill)"/><line x1="0" y1="0" x2="0" y2="3" stroke="var(--cat-obstacle)" stroke-width="1"/></pattern></defs>
      <polygon points="${pts(t.poly)}" fill="${fill}" fill-opacity="${t.cls === "zone" ? 0.08 : 1}" stroke="var(--cat-${t.color})" stroke-width="1.6" vector-effect="non-scaling-stroke" ${t.cls === "zone" ? 'stroke-dasharray="4 3"' : ""}/></svg>`;
  }

  window.DSKT = {
    icon, toast, rng, esc,
    TEMPLATES, TEMPLATE_USAGE, BOUNDARY, PLACEMENTS, PEOPLE, PEOPLE_BY_ID, ASSIGNMENTS, TEAMS,
    worldPoly, bbox, translationFor, rotatePoint, insideBoundary, overlaps, spaceStatus, initials,
    MapView, setupMap, renderGrid, renderFloor, templateThumb, buildFloor,
  };

  injectIcons();
  bindThemeToggle();
})();
