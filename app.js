/* OM Tools Dashboard — the whole application.
 *
 * No build step and no dependencies: edit this file, push, and GitHub Pages
 * serves it. TOOLS below is the single source of truth for what the page
 * lists; index.html carries only a <noscript> copy of the plain links. */

/** Tool marks. 64x64 viewBox, currentColor strokes, so the card tints the
 *  whole glyph with one CSS colour. */
const ICONS = {
  convert: `<path d="M16 30V10h18l12 12v8"/><path d="M34 10v12h12"/>
            <path d="M14 40h14m-4-5-5 5 5 5"/><path d="M50 52H36m4-5 5 5-5 5"/>`,
  dental: `<path d="M32 12c-6-4-14-3-16 4-2 6 1 12 2 18 1 5 1 12 4 12s3-8 6-8"/>
           <path d="M32 12c6-4 14-3 16 4 2 6-1 12-2 18-1 5-1 12-4 12s-3-8-6-8"/>
           <path d="M22 38h6l4-8 4 12 4-6h4"/>`,
  deploys: `<path d="M32 10c7 7 10 15 10 23l-10 8-10-8c0-8 3-16 10-23Z"/>
            <circle cx="32" cy="26" r="4"/><path d="M22 36l-6 8 8-2M42 36l6 8-8-2"/>
            <path d="M28 48c2 4 2 7 4 10 2-3 2-6 4-10"/>`,
  command: `<path d="M32 8l18 7v16c0 11-7 20-18 25-11-5-18-14-18-25V15l18-7Z"/>
            <path d="M25 27l5 5-5 5"/><path d="M35 37h6"/>`,
};

const ARROW = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/>
  <path d="M8 7h9v9"/></svg>`;

const WRENCH = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true"><path d="M15.5 3a5.5 5.5 0 0 0-4.9
  8L3 18.6 5.4 21l7.6-7.6a5.5 5.5 0 0 0 6.5-8.1l-3.1 3.1-2.8-2.8L16.7 3a5.6 5.6
  0 0 0-1.2 0Z"/></svg>`;

const SUN = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2
  12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>`;

const MOON = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round" aria-hidden="true"><path d="M20 13.5A8.5 8.5 0 1 1
  10.5 4a6.6 6.6 0 0 0 9.5 9.5Z"/></svg>`;

/* ---- Data ------------------------------------------------------------ *
 * Array order is the "Featured" sort and decides which tool gets the
 * large bento tile. `tone` picks the mark colour: coral, blue, purple,
 * or green (see styles.css). */
const TOOLS = [
  {
    name: "Convert & Compress",
    description: "File conversion and compression utility.",
    department: "Creative",
    author: "OM DevTeam",
    url: "https://convert-n-compress.om-devteam.workers.dev/",
    tone: "coral",
    icon: "convert",
  },
  {
    name: "Dental Website Tracker",
    description: "Track and monitor dental practice websites.",
    department: "Client Success",
    author: "OM DevTeam",
    url: "https://dental-website-tracker.om-devteam.workers.dev/",
    tone: "blue",
    icon: "dental",
  },
  {
    name: "Deploys",
    description: "Deployment dashboard and status overview.",
    department: "Development",
    author: "OM DevTeam",
    url: "https://deploys.omdigitalagency.com/",
    tone: "purple",
    icon: "deploys",
  },
  {
    name: "OM Tools / Command Center",
    description:
      "Internal tools login / OM Performance Marketing Command Center.",
    department: "Agency-wide",
    author: "OM DevTeam",
    url: "https://tools.omdigitalagency.com/login",
    tone: "green",
    icon: "command",
  },
];

/* ---- Helpers --------------------------------------------------------- */

/** Tool copy is authored in this file, but escaping keeps the markup safe
 *  if an entry ever picks up an ampersand or angle bracket. */
function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function host(url) {
  return new URL(url).host;
}

function mark(tool) {
  return `<span class="tool-mark ${tool.tone}" aria-hidden="true">
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round">${ICONS[tool.icon]}</svg>
  </span>`;
}

function meta(tool) {
  return `<dl class="tool-meta">
    <div><dt>Author</dt><dd>${esc(tool.author)}</dd></div>
    <div><dt>Department</dt><dd>${esc(tool.department)}</dd></div>
    <div><dt>Host</dt><dd>${esc(host(tool.url))}</dd></div>
  </dl>`;
}

function card(tool, rank, view) {
  return `<a class="tool-card tool-card-link tool-rank-${Math.min(rank, 5)}
    ${view === "grid" ? "bento-card" : "uniform-card"}"
    href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer">
    <div class="tool-card-top">
      ${mark(tool)}
      <span class="department-pill">${esc(tool.department)}</span>
    </div>
    <div class="tool-card-copy">
      <h2>${esc(tool.name)}</h2>
      <p>${esc(tool.description)}</p>
    </div>
    <div class="tool-card-bottom">
      ${meta(tool)}
      <span class="tool-hover-tip" aria-hidden="true">Open tool ${ARROW}</span>
    </div>
  </a>`;
}

function row(tool) {
  return `<article>
    <div>${mark(tool)}<span><b>${esc(tool.name)}</b>
      <small>${esc(tool.description)}</small></span></div>
    <span>${esc(tool.department)}</span>
    <span>${esc(tool.author)}</span>
    <span>${esc(host(tool.url))}</span>
    <a href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer"
      aria-label="Open ${esc(tool.name)}">${ARROW}</a>
  </article>`;
}

/* ---- Theme ----------------------------------------------------------- *
 * The applied theme lives on <html>, put there by the bootstrap in
 * index.html. It follows the OS until someone picks a side. */

function readTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function paintThemeToggle(button) {
  const dark = readTheme() === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  button.innerHTML = dark ? SUN : MOON;
  button.setAttribute("aria-label", label);
  button.title = label;
}

/* ---- State and rendering --------------------------------------------- */

const state = { query: "", department: "All departments", sort: "featured", view: "grid" };

function visibleTools() {
  const needle = state.query.trim().toLowerCase();
  return TOOLS.filter(
    (tool) =>
      (state.department === "All departments" ||
        tool.department === state.department) &&
      `${tool.name} ${tool.description} ${tool.department} ${tool.author}`
        .toLowerCase()
        .includes(needle),
  ).sort((a, b) =>
    state.sort === "name"
      ? a.name.localeCompare(b.name)
      : state.sort === "department"
        ? a.department.localeCompare(b.department) || a.name.localeCompare(b.name)
        : TOOLS.indexOf(a) - TOOLS.indexOf(b),
  );
}

function render() {
  const tools = visibleTools();
  const collection = document.getElementById("collection");

  document.getElementById("result-count").textContent =
    `${tools.length} ${tools.length === 1 ? "tool" : "tools"}`;
  document.getElementById("result-note").textContent =
    state.view === "grid" && state.sort === "featured" && tools.length > 1
      ? "Largest card is the featured tool"
      : "Every tool opens in a new tab";

  if (tools.length === 0) {
    collection.innerHTML = `<section class="tools-empty">${WRENCH}
      <h2>No tools found</h2>
      <p>Try another department or search term.</p></section>`;
    return;
  }

  if (state.view === "list") {
    collection.innerHTML = `<section class="tool-list" aria-label="Tool list">
      <header><span>Tool</span><span>Department</span><span>Author</span>
        <span>Host</span><span></span></header>
      ${tools.map(row).join("")}
    </section>`;
    return;
  }

  // data-count lets the bento reflow so a filtered result never leaves a hole.
  collection.innerHTML = `<section
    class="tools-collection ${state.view === "grid" ? "bento-grid" : "card-grid"}"
    data-count="${Math.min(tools.length, 5)}">
    ${tools.map((tool, index) => card(tool, index, state.view)).join("")}
  </section>`;
}

/* ---- Wiring ---------------------------------------------------------- */

function init() {
  document.getElementById("tool-total").textContent = String(TOOLS.length);

  const department = document.getElementById("department");
  const options = ["All departments", ...new Set(TOOLS.map((t) => t.department))];
  department.innerHTML = options
    .map((item) => `<option>${esc(item)}</option>`)
    .join("");
  department.addEventListener("change", (event) => {
    state.department = event.target.value;
    render();
  });

  document.getElementById("search").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  document.getElementById("sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  const switcher = document.getElementById("view-switcher");
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-view]");
    if (!button) return;
    state.view = button.dataset.view;
    for (const item of switcher.querySelectorAll("button[data-view]")) {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    }
    render();
  });

  const toggle = document.getElementById("theme-toggle");
  paintThemeToggle(toggle);
  toggle.addEventListener("click", () => {
    const next = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("om-theme", next);
    } catch (error) {
      // Private-mode storage denial is not worth failing the toggle over.
    }
    paintThemeToggle(toggle);
  });

  render();
}

init();
