/* ---------------------------------------------------------------------------
 * Edit record screen — the form one.
 *
 * Here to make the validation-error and permission-error states clickable.
 * Those two are the states prose descriptions always gloss ("shows an error")
 * and the ones reviewers have the most opinions about once they can see them.
 *
 * Throwaway.
 * ------------------------------------------------------------------------- */

import {
  categories,
  fmt,
  load,
  recordById,
  records,
  updateRecord,
} from "./store.js";
import {
  announce,
  mountShell,
  renderEmpty,
  renderFailure,
  renderLoading,
} from "./shell.js";

mountShell({ screen: "detail" });

const host = document.getElementById("content");
let current = null;

start();

async function start() {
  renderLoading(host, { rows: 5 });
  try {
    await load();
  } catch (err) {
    renderFailure(host, err);
    return;
  }

  const id = new URLSearchParams(location.search).get("id");
  current = (id && recordById(id)) || records()[0];

  if (!current) {
    renderEmpty(host, {
      title: "Nothing to edit",
      body: "This screen opens a record from the Records list. Add a record first, then choose it.",
    });
    return;
  }
  render();
}

function render(errors = {}) {
  const amount = (current.amountCents / 100).toFixed(2);

  host.innerHTML = `
    <a href="./list.html" class="text-sm text-primary hover:underline">&larr; Records</a>

    <h1 class="mt-3 text-xl font-semibold">${escapeHtml(current.label)}</h1>
    <p class="mt-1 font-mono text-xs text-text-muted">${current.ref} &middot; updated ${fmt.dateTime(current.updated)}</p>

    <form id="edit" novalidate class="mt-6 max-w-xl space-y-4 rounded-lg border border-border bg-surface p-5">
      ${text("label", "Label", escapeAttr(current.label), errors.label)}
      ${select("categoryId", "Category", current.categoryId, errors.categoryId)}
      ${text("amount", "Amount", amount, errors.amount, "Negative for money out. Two decimal places.", "tabular")}
      ${select("status", "Status", current.status, errors.status, ["settled", "pending", "disputed"])}

      <div class="flex items-center gap-2 pt-2">
        <button type="submit"
          class="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover">
          Save changes
        </button>
        <a href="./list.html"
          class="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-sunken">Cancel</a>
        <span data-saved class="ml-2 hidden text-sm text-success">Saved</span>
      </div>
    </form>

    <p class="mt-4 max-w-xl text-xs text-text-muted">
      Try saving with an empty label, or an amount of <code class="font-mono">0</code>, to see the
      validation state. Switch the state selector above to <code class="font-mono">forbidden</code>
      for the permission-error state.
    </p>
  `;

  host.querySelector("#edit").addEventListener("submit", onSubmit);
}

function onSubmit(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const label = String(form.get("label")).trim();
  const raw = String(form.get("amount")).replace(/[$,]/g, "").trim();
  const amount = Number(raw);

  // Per-field messages, associated with the field. A single "invalid input"
  // banner is the version that gets built when nobody looked at this state.
  const errors = {};
  if (!label) errors.label = "Enter a label so this record can be found later.";
  else if (label.length > 80) errors.label = "Keep the label under 80 characters.";
  if (!raw) errors.amount = "Enter an amount.";
  else if (!Number.isFinite(amount)) errors.amount = "Amounts are numbers, like -1250.00.";
  else if (amount === 0) errors.amount = "An amount of zero cannot be posted.";

  if (Object.keys(errors).length) {
    render(errors);
    host.querySelector("[aria-invalid='true']")?.focus();
    announce(`${Object.keys(errors).length} field needs attention`);
    return;
  }

  updateRecord(current.id, {
    label,
    amountCents: Math.round(amount * 100),
    categoryId: String(form.get("categoryId")),
    status: String(form.get("status")),
  });
  current = recordById(current.id);
  render();
  const saved = host.querySelector("[data-saved]");
  saved.classList.remove("hidden");
  announce("Changes saved");
  setTimeout(() => saved.classList.add("hidden"), 2500);
}

/* -- field helpers ----------------------------------------------------------
 * Every field: a real <label for>, an error associated via aria-describedby,
 * aria-invalid, and a message that is not only a red border. */

function text(name, label, value, error, hint, extra = "") {
  return `
    <div>
      <label for="${name}" class="mb-1 block text-sm font-medium">${label}</label>
      <input id="${name}" name="${name}" value="${value}"
        ${error ? 'aria-invalid="true"' : ""}
        aria-describedby="${error ? `${name}-error` : hint ? `${name}-hint` : ""}"
        class="${extra} w-full rounded-md border ${
          error ? "border-danger" : "border-border"
        } bg-surface px-3 py-1.5 text-sm" />
      ${hint && !error ? `<p id="${name}-hint" class="mt-1 text-xs text-text-muted">${hint}</p>` : ""}
      ${error ? errorLine(name, error) : ""}
    </div>`;
}

function select(name, label, value, error, options) {
  const opts = options
    ? options.map((o) => ({ id: o, name: o }))
    : categories().map((c) => ({ id: c.id, name: c.name }));
  return `
    <div>
      <label for="${name}" class="mb-1 block text-sm font-medium">${label}</label>
      <select id="${name}" name="${name}"
        ${error ? 'aria-invalid="true" aria-describedby="' + name + '-error"' : ""}
        class="w-full rounded-md border ${
          error ? "border-danger" : "border-border"
        } bg-surface px-3 py-1.5 text-sm capitalize">
        ${opts
          .map((o) => `<option value="${o.id}"${o.id === value ? " selected" : ""}>${o.name}</option>`)
          .join("")}
      </select>
      ${error ? errorLine(name, error) : ""}
    </div>`;
}

function errorLine(name, message) {
  return `
    <p id="${name}-error" class="mt-1 flex items-start gap-1.5 text-xs text-danger">
      <span aria-hidden="true" class="font-bold">!</span>${message}
    </p>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
