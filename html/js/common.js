/* Shared helpers for every topic page:
   DOM shortcuts, code highlighting, the sidebar, and the second-tab preview. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const TOPIC_ID = document.body.dataset.topic || "";
const PREVIEW_MODE =
  new URLSearchParams(location.search).get("view") === "preview";

/* ------------------------------------------------------------ code + output */

/* Write the current value of a variable everywhere it appears in the code
   listing, e.g. <i class="v" data-var="marks">45</i> */
function setVar(name, value) {
  $$(`[data-var="${name}"]`).forEach((el) => {
    el.textContent = value;
  });
}

/* Apply highlight states to the code listing.
   states = { lineId: "on" | "on-warn" | "on-amber" | "off" | "skip" | null } */
function markCode(states) {
  $$("[data-line]").forEach((el) => {
    el.classList.remove("on", "on-warn", "on-amber", "off", "skip");
    const state = states[el.dataset.line];
    if (state) el.classList.add(state);
  });
}

/* Same idea for inline pieces such as the two halves of a ternary. */
function markParts(states) {
  $$("[data-part]").forEach((el) => {
    el.classList.remove("on", "on-warn", "on-amber", "off", "skip");
    const state = states[el.dataset.part];
    if (state) el.classList.add(state);
  });
}

/* Print lines into a .console block. Pass a string or an array of strings. */
function printOut(el, lines) {
  const list = Array.isArray(lines) ? lines : [lines];
  el.textContent = list.join("\n");
}

/* Two-button on/off control. Calls onChange(true|false). */
function segment(el, onChange) {
  $$("button", el).forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("button", el).forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)),
      );
      onChange(btn.dataset.value === "true");
    });
  });
}

/* Force a segment control into a given position without firing its handler. */
function setSegment(el, value) {
  $$("button", el).forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.value === String(value)));
  });
}

/* Give every slider a number box next to it so a value can be typed in.
   The box drives the slider by firing its "input" event, so page scripts
   need no changes. Scripts that set slider.value directly (resets, sync,
   the flexbox item picker) are caught by wrapping the value setter. */
const valueProp = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value",
);

function enhanceSlider(range) {
  if (range.dataset.enhanced) return;
  range.dataset.enhanced = "true";

  const box = document.createElement("input");
  box.type = "number";
  box.className = "range-box";
  box.min = range.min;
  box.max = range.max;
  box.step = range.step || "1";
  box.value = range.value;
  box.disabled = range.disabled;
  box.setAttribute("aria-label", `${range.id || "value"} (type a number)`);
  const digits = Math.max(range.min.length, range.max.length, 2);
  box.style.width = `calc(${digits}ch + 34px)`;

  const row = document.createElement("div");
  row.className = "range-row";
  range.parentNode.insertBefore(row, range);
  row.append(range, box);

  const showRange = () => {
    box.value = valueProp.get.call(range);
  };

  Object.defineProperty(range, "value", {
    configurable: true,
    get() {
      return valueProp.get.call(this);
    },
    set(v) {
      valueProp.set.call(this, v);
      if (document.activeElement !== box) showRange();
    },
  });

  range.addEventListener("input", () => {
    if (document.activeElement !== box) showRange();
  });

  // While typing, only apply values that are already in range, so partial
  // entries like "-" or "1" (on the way to "15") are left alone.
  box.addEventListener("input", () => {
    const n = box.valueAsNumber;
    if (Number.isNaN(n) || n < Number(range.min) || n > Number(range.max))
      return;
    valueProp.set.call(range, n);
    range.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // On Enter or leaving the box, clamp and snap to the slider's step.
  box.addEventListener("change", () => {
    const n = box.valueAsNumber;
    if (!Number.isNaN(n)) {
      valueProp.set.call(range, n);
      range.dispatchEvent(new Event("input", { bubbles: true }));
    }
    showRange();
  });
  box.addEventListener("blur", showRange);

  new MutationObserver(() => {
    box.disabled = range.disabled;
  }).observe(range, { attributes: true, attributeFilter: ["disabled"] });
}

function enhanceSliders() {
  $$('input[type="range"]').forEach(enhanceSlider);
}

/* ------------------------------------------------------------------ sidebar */

const TOPICS = [
  {
    group: "How Java runs",
    items: [
      {
        id: "internals",
        href: "java-internals.html",
        label: "Source to running program",
        file: "JDK, JRE, JVM",
      },
    ],
  },
  {
    group: "Conditionals",
    items: [
      {
        id: "ternary",
        href: "ternary.html",
        label: "Ternary operator",
        file: "Ternary.java",
      },
      {
        id: "if-else",
        href: "if-else.html",
        label: "if / else",
        file: "IsRaining.java",
      },
      {
        id: "else-if",
        href: "else-if.html",
        label: "else if chain",
        file: "GradeChecker.java",
      },
      {
        id: "switch",
        href: "switch.html",
        label: "switch",
        file: "Switch.java",
      },
      {
        id: "logical",
        href: "logical-operators.html",
        label: "&& and ||",
        file: "CombineConditions.java",
      },
    ],
  },
  {
    group: "Loops",
    items: [
      {
        id: "for",
        href: "for-loop.html",
        label: "for loop",
        file: "loops/For.java",
      },
    ],
  },
  {
    group: "Layout",
    items: [
      {
        id: "flexbox",
        href: "flexbox.html",
        label: "Flexbox playground",
        file: "CSS",
      },
    ],
  },
];

function buildSidebar() {
  const nav = $("#sidebar");
  if (!nav) return;

  const parts = [
    `<a class="side-home${TOPIC_ID === "index" ? " current" : ""}" href="index.html">`,
    '<span class="side-title">Java course</span>',
    '<span class="side-sub">interactive topics</span>',
    "</a>",
  ];

  TOPICS.forEach((section) => {
    parts.push(`<p class="side-group">${section.group}</p>`);
    parts.push('<ul class="side-list">');
    section.items.forEach((item) => {
      const current = item.id === TOPIC_ID;
      parts.push(
        `<li><a href="${item.href}"${current ? ' class="current" aria-current="page"' : ""}>` +
          `<span class="side-label">${item.label}</span>` +
          `<span class="side-file">${item.file}</span>` +
          "</a></li>",
      );
    });
    parts.push("</ul>");
  });

  nav.innerHTML = parts.join("");
}

/* ----------------------------------------------------------------- maximize */

/* Every panel gets a corner button that opens it full screen in this tab.
   Only a class is toggled, so ids, listeners and the diagram keep working. */

const MAX_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg>';
const MIN_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4"/></svg>';

function setMax(panel, on) {
  const button = $(".btn-max", panel);
  panel.classList.toggle("is-max", on);
  button.innerHTML = on ? MIN_ICON : MAX_ICON;
  button.setAttribute("aria-pressed", String(on));
  button.setAttribute("aria-label", on ? "Exit full screen" : "Maximize");
  button.title = on ? "Exit full screen (Esc)" : "Maximize";
  document.body.classList.toggle("has-max", Boolean($(".panel.is-max")));
}

function buildMaxButtons() {
  // the preview tab is already a full-screen view of the diagram and code,
  // so there only the syntax panel can be maximized
  $$(PREVIEW_MODE ? ".panel.syntax" : ".panel").forEach((panel) => {
    if ($(".btn-max", panel)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-max";
    panel.appendChild(button);
    setMax(panel, false);

    button.addEventListener("click", () => {
      const open = !panel.classList.contains("is-max");
      $$(".panel.is-max").forEach((other) => setMax(other, false));
      setMax(panel, open);
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  $$(".panel.is-max").forEach((panel) => setMax(panel, false));
});

/* ------------------------------------------------------- second-tab preview */

/* The preview tab is the same page opened with ?view=preview. It hides
   everything but the diagram and takes its values from the controlling tab
   over postMessage, which works on file:// where BroadcastChannel does not. */

let previewWindow = null;
let syncApi = null;

/* In the preview tab the interactive widgets are pointless, but what they are
   set to is exactly what the room needs to see. Hide the blocks that hold
   controls and show their current values as chips instead; everything else in
   the panel (the code listing, the generated CSS, the output) stays. */
function hideControlBlocks() {
  $$(".panel-controls > div").forEach((block) => {
    if ($(".controls, .grid2, .item-picker, .btn-row", block)) {
      block.classList.add("block-controls");
    }
  });
}

/* Preview tab: put the settings chips right under the facts, so the
   variables read together below the diagram. */
function layoutPreview() {
  $$(".panel-preview").forEach((preview) => {
    const strip = document.createElement("div");
    strip.className = "preview-settings";
    const facts = $(".facts", preview);
    if (facts) facts.after(strip);
    else preview.appendChild(strip);
  });
}

/* Read the current value of one .ctrl group, whatever kind of input it holds. */
function readControl(ctrl) {
  const labelEl = $("label", ctrl) || $(".ctrl-label", ctrl);
  if (!labelEl) return null;

  const valSpan = $(".val", labelEl);
  let name = labelEl.textContent;
  if (valSpan) name = name.replace(valSpan.textContent, "");
  name = name.replace(/\s+/g, " ").trim();

  const select = $("select", ctrl);
  const seg = $(".seg", ctrl);
  const range = $('input[type="range"]', ctrl);

  let value;
  if (select) value = select.value;
  else if (seg) {
    const pressed = $('button[aria-pressed="true"]', seg);
    value = pressed ? pressed.textContent.trim() : "";
  } else if (valSpan) value = valSpan.textContent;
  else if (range) value = range.value;
  else return null;

  const input = select || range;
  return { name, value, muted: Boolean(input && input.disabled) };
}

/* One chip strip per workbench, so a page with two demos keeps them apart. */
function renderPreviewSettings() {
  $$(".workbench").forEach((bench) => {
    const preview = $(".panel-preview", bench);
    const controls = $(".panel-controls", bench);
    if (!preview || !controls) return;

    let strip = $(".preview-settings", preview);
    if (!strip) {
      strip = document.createElement("div");
      strip.className = "preview-settings";
      preview.appendChild(strip);
    }

    /* Only the first control block becomes chips. On the flexbox page that is
       the container, and the per-item values are already in the CSS below. */
    const firstBlock = $(".block-controls", controls);
    if (!firstBlock) {
      strip.innerHTML = "";
      return;
    }

    strip.innerHTML = $$(".ctrl", firstBlock)
      .map(readControl)
      .filter(Boolean)
      .map(
        (item) =>
          `<span class="pset${item.muted ? " is-muted" : ""}">` +
          `<span class="pset-k">${item.name}</span>` +
          `<span class="pset-v">${item.value}</span></span>`,
      )
      .join("");
  });
}

function registerSync(api) {
  syncApi = api;

  if (PREVIEW_MODE) {
    document.body.classList.add("is-preview");
    hideControlBlocks();
    layoutPreview();
    window.addEventListener("message", (event) => {
      const msg = event.data;
      if (!msg || msg.type !== "state") return;
      syncApi.write(msg.state);
      syncApi.render();
    });
    // ask the controlling tab for the current values
    if (window.opener) {
      window.opener.postMessage({ type: "hello", topic: TOPIC_ID }, "*");
    } else {
      const badge = $("#preview-badge");
      if (badge)
        badge.textContent = "Open this from a topic page to control it";
    }
    return;
  }

  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg && msg.type === "hello" && msg.topic === TOPIC_ID) syncPush();
  });

  buildPopButton();
}

/* Called at the end of every render. On the controlling tab it ships the new
   state out; in the preview tab it refreshes the settings chips. */
function syncPush() {
  if (PREVIEW_MODE) {
    renderPreviewSettings();
    return;
  }
  if (!syncApi || !previewWindow || previewWindow.closed) return;
  previewWindow.postMessage({ type: "state", state: syncApi.read() }, "*");
}

function buildPopButton() {
  const slot = $("#pop-slot");
  if (!slot) return;

  const button = document.createElement("button");
  button.className = "btn btn-pop";
  button.type = "button";
  slot.appendChild(button);

  const label = () => {
    const open = previewWindow && !previewWindow.closed;
    button.textContent = open ? "Close preview tab" : "Preview";
    button.classList.toggle("is-live", Boolean(open));
  };

  button.addEventListener("click", () => {
    if (previewWindow && !previewWindow.closed) {
      previewWindow.close();
      previewWindow = null;
      label();
      return;
    }
    const url = location.pathname + "?view=preview";
    previewWindow = window.open(url, "java-course-preview");
    if (!previewWindow) {
      button.textContent = "Popup blocked — allow popups";
      return;
    }
    label();
    // the new tab says hello once it is ready, but push anyway in case it is
    // a tab that was already open
    setTimeout(syncPush, 600);
  });

  label();
  setInterval(label, 1500);
}

// common.js loads at the end of <body>, so the sliders already exist; set them
// up now, before the page script runs and starts writing their values.
enhanceSliders();
buildMaxButtons();
document.addEventListener("DOMContentLoaded", enhanceSliders);
document.addEventListener("DOMContentLoaded", buildSidebar);
if (document.readyState !== "loading") buildSidebar();
