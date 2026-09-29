/* Flexbox playground — container properties, per-item properties, live CSS. */

const preview = $("#preview");
const cssOut = $("#fx-css");
const ITEM_COUNT = 5;

const DEFAULT_ITEM = { grow: 0, shrink: 1, basis: -1, order: 0, self: "auto" };
let items = Array.from({ length: ITEM_COUNT }, () => ({ ...DEFAULT_ITEM }));
let selected = 0;

const container = {
  display: $("#fx-display"),
  direction: $("#fx-direction"),
  wrap: $("#fx-wrap"),
  justify: $("#fx-justify"),
  align: $("#fx-align"),
  gap: $("#fx-gap"),
  height: $("#fx-height"),
};

const itemCtrl = {
  grow: $("#fx-grow"),
  shrink: $("#fx-shrink"),
  basis: $("#fx-basis"),
  order: $("#fx-order"),
  self: $("#fx-self"),
};

/* -1 on the basis slider means "leave it as auto". */
const basisLabel = (value) => (value < 0 ? "auto" : `${value}px`);

/* Which container properties actually do anything at each display value. */
const NOTE = {
  "inline-flex":
    "inline-flex behaves like flex, but the container itself sits inline — it shrinks to fit its content instead of filling the row.",
  block:
    "display: block turns flexbox off. The boxes fall back to normal flow, and flex-direction, justify-content, align-items and gap all stop applying.",
  grid: "display: grid is a different layout system. The flex properties below do nothing here — grid stacks the boxes in a single column by default.",
};

function applyContainer() {
  const display = container.display.value;
  const isFlex = display === "flex" || display === "inline-flex";

  preview.style.display = display;
  preview.style.flexDirection = container.direction.value;
  preview.style.flexWrap = container.wrap.value;
  preview.style.justifyContent = container.justify.value;
  preview.style.alignItems = container.align.value;
  preview.style.gap = `${container.gap.value}px`;
  preview.style.height = `${container.height.value}px`;

  $("#fx-gap-val").textContent = `${container.gap.value}px`;
  $("#fx-height-val").textContent = `${container.height.value}px`;

  const isRow = container.direction.value.startsWith("row");
  const reversed = container.direction.value.endsWith("reverse");
  $("#fx-main").textContent = isRow
    ? reversed
      ? "right to left"
      : "left to right"
    : reversed
      ? "bottom to top"
      : "top to bottom";
  $("#fx-cross").textContent = isRow ? "top to bottom" : "left to right";

  // the axis note only makes sense while flexbox is switched on
  $("#fx-axis").hidden = !isFlex;
  const warn = $("#fx-warn");
  warn.hidden = !NOTE[display];
  if (NOTE[display]) warn.textContent = NOTE[display];

  // grey out the controls that have no effect at this display value
  ["direction", "wrap", "justify", "align", "gap"].forEach((key) => {
    container[key].disabled = !isFlex;
    container[key].closest(".ctrl").style.opacity = isFlex ? "1" : "0.4";
  });
}

function applyItems() {
  $$(".item", preview).forEach((el, i) => {
    const item = items[i];
    el.style.flexGrow = item.grow;
    el.style.flexShrink = item.shrink;
    el.style.flexBasis = item.basis < 0 ? "auto" : `${item.basis}px`;
    el.style.order = item.order;
    el.style.alignSelf = item.self;
    el.classList.toggle("selected", i === selected);
  });
}

function syncItemControls() {
  const item = items[selected];
  itemCtrl.grow.value = item.grow;
  itemCtrl.shrink.value = item.shrink;
  itemCtrl.basis.value = item.basis;
  itemCtrl.order.value = item.order;
  itemCtrl.self.value = item.self;

  $("#fx-grow-val").textContent = item.grow;
  $("#fx-shrink-val").textContent = item.shrink;
  $("#fx-basis-val").textContent = basisLabel(item.basis);
  $("#fx-order-val").textContent = item.order;

  $$("#fx-picker button").forEach((btn) => {
    btn.setAttribute(
      "aria-pressed",
      String(Number(btn.dataset.index) === selected),
    );
  });
}

/* Only print the item rules that differ from the defaults, so the listing
   stays short enough to read from the back of the room. */
function writeCss() {
  const display = container.display.value;
  const isFlex = display === "flex" || display === "inline-flex";

  const lines = [".container {", `  display: ${display};`];
  if (isFlex) {
    lines.push(
      `  flex-direction: ${container.direction.value};`,
      `  flex-wrap: ${container.wrap.value};`,
      `  justify-content: ${container.justify.value};`,
      `  align-items: ${container.align.value};`,
      `  gap: ${container.gap.value}px;`,
    );
  }
  lines.push("}");

  items.forEach((item, i) => {
    const rules = [];
    if (item.grow !== DEFAULT_ITEM.grow)
      rules.push(`  flex-grow: ${item.grow};`);
    if (item.shrink !== DEFAULT_ITEM.shrink)
      rules.push(`  flex-shrink: ${item.shrink};`);
    if (item.basis !== DEFAULT_ITEM.basis)
      rules.push(`  flex-basis: ${item.basis}px;`);
    if (item.order !== DEFAULT_ITEM.order)
      rules.push(`  order: ${item.order};`);
    if (item.self !== DEFAULT_ITEM.self)
      rules.push(`  align-self: ${item.self};`);
    if (rules.length) {
      lines.push("");
      lines.push(`.item:nth-child(${i + 1}) {`);
      lines.push(...rules);
      lines.push("}");
    }
  });

  cssOut.textContent = lines.join("\n");
}

function render() {
  applyContainer();
  applyItems();
  syncItemControls();
  writeCss();
  syncPush();
}

/* ---------------------------------------------------------------- wiring */

Object.values(container).forEach((input) =>
  input.addEventListener("input", render),
);

itemCtrl.grow.addEventListener("input", (e) => {
  items[selected].grow = Number(e.target.value);
  render();
});
itemCtrl.shrink.addEventListener("input", (e) => {
  items[selected].shrink = Number(e.target.value);
  render();
});
itemCtrl.basis.addEventListener("input", (e) => {
  items[selected].basis = Number(e.target.value);
  render();
});
itemCtrl.order.addEventListener("input", (e) => {
  items[selected].order = Number(e.target.value);
  render();
});
itemCtrl.self.addEventListener("change", (e) => {
  items[selected].self = e.target.value;
  render();
});

$$("#fx-picker button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selected = Number(btn.dataset.index);
    render();
  });
});

$$(".item", preview).forEach((el) => {
  const pick = () => {
    selected = Number(el.dataset.index);
    render();
  };
  el.addEventListener("click", pick);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick();
    }
  });
});

$("#fx-reset").addEventListener("click", () => {
  items = Array.from({ length: ITEM_COUNT }, () => ({ ...DEFAULT_ITEM }));
  selected = 0;
  container.display.value = "flex";
  container.direction.value = "row";
  container.wrap.value = "nowrap";
  container.justify.value = "flex-start";
  container.align.value = "stretch";
  container.gap.value = 10;
  container.height.value = 260;
  render();
});

registerSync({
  read: () => ({
    container: Object.fromEntries(
      Object.entries(container).map(([key, el]) => [key, el.value]),
    ),
    items,
    selected,
  }),
  write: (s) => {
    Object.entries(s.container).forEach(([key, value]) => {
      if (container[key]) container[key].value = value;
    });
    items = s.items;
    selected = s.selected;
  },
  render,
});

render();
