/* ---------------------------------------------------------------------------
 * Records screen — the data-dense one.
 *
 * This is the screen the mockup exists for. A table is where layout judgement
 * actually lives: column order, alignment, how negative figures read, what
 * happens at a narrow width, whether thirty rows are scannable. None of that
 * can be reviewed from prose, and none of it can be reviewed from three
 * placeholder rows.
 *
 * Throwaway.
 * ------------------------------------------------------------------------- */

import {
  addRecord,
  categories,
  categoryById,
  fmt,
  load,
  records,
  removeRecord,
  requestedState,
  subscribe,
} from "./store.js";
import {
  announce,
  mountShell,
  renderEmpty,
  renderFailure,
  renderLoading,
} from "./shell.js";

mountShell({ screen: "list" });

const host = document.getElementById("content");
const filters = { category: "all", status: "all", q: "" };

start();

async function start() {
  renderLoading(host, { rows: 9 });
  try {
    await load();
  } catch (err) {
    renderFailure(host, err);
    return;
  }
  subscribe(render);
}

function visible() {
  return records().filter((r) => {
    if (filters.category !== "all" && r.categoryId !== filters.category) return false;
    if (filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!`${r.ref} ${r.label} ${r.owner}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function render() {
  if (records().length === 0) {
    renderEmpty(host, {
      title: "No records yet",
      body: "Records appear here once an invoice or sales order is posted. You can add one manually while you wait.",
      action: { act: "create", label: "Add a record" },
    });
    host.querySelector('[data-act="create"]')?.addEventListener("click", openCreate);
    return;
  }

  const rows = visible();
  const total = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const inflow = rows.filter((r) => r.amountCents > 0).reduce((s, r) => s + r.amountCents, 0);
  const outflow = rows.filter((r) => r.amountCents < 0).reduce((s, r) => s + r.amountCents, 0);

  host.innerHTML = `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold">Records</h1>
        <p class="mt-1 text-sm text-text-muted">January 2026 &middot; ${records().length} posted</p>
      </div>
      <button type="button" data-act="create"
        class="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover">
        Add record
      </button>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      ${stat("Net", total, true)}
      ${stat("Inflow", inflow)}
      ${stat("Outflow", outflow)}
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <label class="sr-only" for="q">Search records</label>
      <input id="q" type="search" placeholder="Search reference, label, or owner"
        value="${escapeAttr(filters.q)}"
        class="min-w-56 flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm" />

      <label class="sr-only" for="f-cat">Category</label>
      <select id="f-cat" class="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm">
        <option value="all">All categories</option>
        ${categories()
          .map(
            (c) =>
              `<option value="${c.id}"${filters.category === c.id ? " selected" : ""}>${c.name}</option>`,
          )
          .join("")}
      </select>

      <label class="sr-only" for="f-status">Status</label>
      <select id="f-status" class="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm">
        ${["all", "settled", "pending", "disputed"]
          .map(
            (s) =>
              `<option value="${s}"${filters.status === s ? " selected" : ""}>${
                s === "all" ? "All statuses" : s
              }</option>`,
          )
          .join("")}
      </select>
    </div>

    ${
      rows.length === 0
        ? `<div class="mt-4 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
             <h2 class="font-semibold">No records match these filters</h2>
             <p class="mt-1 text-sm text-text-muted">Nothing is wrong &mdash; the filters are just too narrow.</p>
             <button type="button" data-act="clear"
               class="mt-4 rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-surface-sunken">
               Clear filters
             </button>
           </div>`
        : table(rows)
    }
  `;

  // "Filtered to nothing" and "nothing exists yet" are different states with
  // different recovery. Collapsing them into one empty state is a real UX bug
  // that a mockup catches for free.

  host.querySelector('[data-act="create"]')?.addEventListener("click", openCreate);
  host.querySelector('[data-act="clear"]')?.addEventListener("click", () => {
    filters.category = filters.status = "all";
    filters.q = "";
    render();
  });

  const q = host.querySelector("#q");
  q?.addEventListener("input", (e) => {
    filters.q = e.target.value;
    render();
    host.querySelector("#q")?.focus();
  });
  host.querySelector("#f-cat")?.addEventListener("change", (e) => {
    filters.category = e.target.value;
    render();
  });
  host.querySelector("#f-status")?.addEventListener("change", (e) => {
    filters.status = e.target.value;
    render();
  });

  host.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const row = records().find((r) => r.id === btn.dataset.remove);
      removeRecord(btn.dataset.remove);
      announce(`Removed ${row.ref}`);
    }),
  );
}

function stat(label, cents, emphasise = false) {
  const tone =
    cents > 0 ? "text-positive" : cents < 0 ? "text-negative" : "text-text-muted";
  return `
    <div class="rounded-lg border border-border bg-surface p-4">
      <p class="text-xs font-medium tracking-wide text-text-muted uppercase">${label}</p>
      <p class="tabular mt-1 ${emphasise ? "text-2xl" : "text-xl"} font-semibold ${tone}">
        ${fmt.money(cents)}
      </p>
    </div>`;
}

function table(rows) {
  return `
    <!-- Wide content scrolls in its own container. The page body must never
         scroll horizontally -- that is the single most common responsive defect
         in a data-dense layout. -->
    <div class="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
      <table class="w-full min-w-3xl border-collapse text-sm">
        <caption class="sr-only">Posted records for January 2026</caption>
        <thead>
          <tr class="border-b border-border text-left text-xs tracking-wide text-text-muted uppercase">
            <th scope="col" class="px-4 py-2.5 font-medium">Reference</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Label</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Category</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Owner</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Status</th>
            <th scope="col" class="px-4 py-2.5 text-right font-medium">Amount</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Updated</th>
            <th scope="col" class="px-4 py-2.5"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr class="border-b border-border last:border-0 hover:bg-surface-sunken">
              <td class="px-4 py-2.5 font-mono text-xs">${r.ref}</td>
              <td class="px-4 py-2.5">
                <a href="./detail.html?id=${r.id}" class="text-primary hover:underline">${escapeHtml(r.label)}</a>
              </td>
              <td class="px-4 py-2.5 text-text-muted">${categoryById(r.categoryId)?.name ?? fmt.empty}</td>
              <td class="px-4 py-2.5 text-text-muted">${escapeHtml(r.owner)}</td>
              <td class="px-4 py-2.5">${badge(r.status)}</td>
              <!-- Figures right-aligned and tabular, or a column of numbers
                   cannot be compared at a glance. -->
              <td class="tabular px-4 py-2.5 text-right font-medium ${
                r.amountCents < 0 ? "text-negative" : "text-positive"
              }">${fmt.money(r.amountCents)}</td>
              <td class="px-4 py-2.5 text-xs text-text-muted">${fmt.dateTime(r.updated)}</td>
              <td class="px-4 py-2.5 text-right">
                <button type="button" data-remove="${r.id}"
                  class="rounded-sm px-2 py-1 text-xs text-text-muted hover:bg-surface hover:text-danger">
                  Remove<span class="sr-only"> ${r.ref}</span>
                </button>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-xs text-text-muted">Showing ${rows.length} of ${records().length} records</p>
  `;
}

function badge(status) {
  // Status carries a word as well as a colour. Colour alone fails for a
  // meaningful share of readers -- see the accessibility baseline.
  const tone = {
    settled: "border-border bg-surface-sunken text-text-muted",
    pending: "border-warning/40 bg-warning/10 text-warning",
    disputed: "border-danger/40 bg-danger/10 text-danger",
  }[status];
  return `<span class="inline-flex items-center rounded-full border ${tone} px-2 py-0.5 text-xs capitalize">${status}</span>`;
}

/* -- create dialog --------------------------------------------------------- */

function openCreate() {
  const dialog = document.createElement("dialog");
  dialog.className =
    "w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface-raised p-0 text-text shadow-lg backdrop:bg-black/40";
  dialog.innerHTML = `
    <form method="dialog" class="p-5">
      <h2 class="text-lg font-semibold">Add record</h2>
      <p class="mt-1 text-sm text-text-muted">Fabricated data. Nothing is saved anywhere.</p>

      <div class="mt-4 space-y-3">
        ${field("ref", "Reference", '<input name="ref" required placeholder="INV-2026-0200" class="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm" />')}
        ${field("label", "Label", '<input name="label" required class="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm" />')}
        ${field(
          "categoryId",
          "Category",
          `<select name="categoryId" class="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm">
             ${categories().map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
           </select>`,
        )}
        ${field(
          "amount",
          "Amount",
          '<input name="amount" required inputmode="decimal" placeholder="-1250.00" class="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm tabular" />',
          "Negative for money out.",
        )}
      </div>

      <p data-err class="mt-3 hidden rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"></p>

      <div class="mt-5 flex justify-end gap-2">
        <button value="cancel" class="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-sunken">Cancel</button>
        <button value="save" class="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover">Add record</button>
      </div>
    </form>`;

  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector("input")?.focus();

  dialog.querySelector("form").addEventListener("submit", (e) => {
    if (e.submitter?.value !== "save") return;
    const form = new FormData(e.target);
    const amount = Number(String(form.get("amount")).replace(/[$,]/g, ""));

    // The validation-error state is a state the design gate must see, so the
    // mockup fakes it rather than skipping it.
    if (!Number.isFinite(amount) || amount === 0) {
      e.preventDefault();
      const err = dialog.querySelector("[data-err]");
      err.textContent = "Enter an amount as a number, using a minus sign for money out.";
      err.classList.remove("hidden");
      dialog.querySelector('[name="amount"]').focus();
      return;
    }

    addRecord({
      ref: String(form.get("ref")),
      label: String(form.get("label")),
      categoryId: String(form.get("categoryId")),
      amountCents: Math.round(amount * 100),
    });
    announce("Record added");
  });

  dialog.addEventListener("close", () => dialog.remove());
}

function field(id, label, control, hint) {
  return `
    <div>
      <label for="${id}" class="mb-1 block text-sm font-medium">${label}</label>
      ${control.replace("<input", `<input id="${id}"`).replace("<select", `<select id="${id}"`)}
      ${hint ? `<p class="mt-1 text-xs text-text-muted">${hint}</p>` : ""}
    </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

// Keep the state switcher honest: if the URL asked for a state, say so.
if (requestedState() !== "success") {
  console.info(`mockup: rendering "${requestedState()}" state`);
}
