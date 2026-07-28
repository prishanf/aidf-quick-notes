/* Notes screen with delete + confirm. Throwaway mockup — do not copy into the app. */

import {
  addNote,
  deleteNote,
  fmt,
  load,
  noteById,
  notes,
  subscribe,
} from "./store.js?v=f2";
import {
  announce,
  mountShell,
  renderEmpty,
  renderFailure,
  renderLoading,
} from "./shell.js?v=f2";

mountShell({ screen: "notes" });

const host = document.getElementById("content");
let fieldErrors = {};
let deleteError = "";
let pendingDeleteId = null;
let deleting = false;

start();

async function start() {
  renderLoading(host, { rows: 6 });
  try {
    await load();
  } catch (err) {
    renderFailure(host, err);
    return;
  }
  subscribe(render);
}

function render() {
  const rows = notes();
  const pending = pendingDeleteId ? noteById(pendingDeleteId) : null;

  host.innerHTML = `
    <div class="space-y-8">
      <header>
        <p class="text-sm font-medium uppercase tracking-wide text-text-muted">AIDF Quick Notes</p>
        <h1 class="mt-1 text-2xl font-semibold text-text">Your notes</h1>
        <p class="mt-2 text-sm text-text-muted">
          Add a short note, then find it in the list newest first. Delete removes it for good.
        </p>
      </header>

      <section aria-labelledby="create-heading" class="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <h2 id="create-heading" class="text-lg font-semibold">New note</h2>
        <form id="create-form" class="mt-4 space-y-4" novalidate>
          <div>
            <label for="title" class="block text-sm font-medium">Title</label>
            <input id="title" name="title" type="text" maxlength="120" required
              aria-describedby="${fieldErrors.title ? "title-error" : "title-hint"}"
              aria-invalid="${fieldErrors.title ? "true" : "false"}"
              class="mt-1 w-full rounded-md border ${fieldErrors.title ? "border-danger" : "border-border"} bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
            <p id="title-hint" class="mt-1 text-xs text-text-muted">1–120 characters. Required.</p>
            ${
              fieldErrors.title
                ? `<p id="title-error" class="mt-1 text-sm text-danger" role="alert">${fieldErrors.title}</p>`
                : ""
            }
          </div>
          <div>
            <label for="body" class="block text-sm font-medium">Body</label>
            <textarea id="body" name="body" rows="4" maxlength="5000"
              aria-describedby="body-hint"
              class="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"></textarea>
            <p id="body-hint" class="mt-1 text-xs text-text-muted">Optional. Up to 5000 characters.</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="submit"
              class="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              Save note
            </button>
            <p id="form-status" class="text-sm text-text-muted" aria-live="polite"></p>
          </div>
        </form>
      </section>

      <section aria-labelledby="list-heading">
        <div class="flex items-baseline justify-between gap-3">
          <h2 id="list-heading" class="text-lg font-semibold">All notes</h2>
          <p class="text-sm text-text-muted">${rows.length} ${rows.length === 1 ? "note" : "notes"}</p>
        </div>
        ${
          deleteError
            ? `<div role="alert" class="mt-3 rounded-lg border border-border bg-surface p-4">
                <p class="font-semibold text-text">Could not delete</p>
                <p class="mt-1 text-sm text-text-muted">${escapeHtml(deleteError)}</p>
                <button type="button" id="dismiss-delete-error"
                  class="mt-3 rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-surface-sunken">
                  Dismiss
                </button>
              </div>`
            : ""
        }
        <div id="list-panel" class="mt-3"></div>
      </section>
    </div>

    ${
      pending
        ? `<div class="proto-overlay" role="presentation" id="confirm-backdrop">
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-title"
              class="w-full max-w-md rounded-lg border border-border bg-surface-raised p-5 shadow-lg">
              <h2 id="confirm-title" class="text-lg font-semibold text-text">Delete this note?</h2>
              <p class="mt-2 text-sm text-text-muted">
                “${escapeHtml(pending.title)}” will be removed permanently. This cannot be undone.
              </p>
              <div class="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" id="confirm-cancel"
                  class="rounded-md border border-border-strong px-3.5 py-2 text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  ${deleting ? "disabled" : ""}>
                  Cancel
                </button>
                <button type="button" id="confirm-delete"
                  class="rounded-md bg-danger px-3.5 py-2 text-sm font-medium text-danger-fg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
                  ${deleting ? "disabled" : ""}>
                  ${deleting ? "Deleting…" : "Delete note"}
                </button>
              </div>
            </div>
          </div>`
        : ""
    }
  `;

  const listPanel = host.querySelector("#list-panel");
  if (rows.length === 0) {
    renderEmpty(listPanel, {
      title: "No notes yet",
      body: "Save your first note with the form above. It will show up here newest first.",
      action: null,
    });
  } else {
    listPanel.innerHTML = `
      <ul class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        ${rows
          .map(
            (n) => `
          <li class="px-4 py-3">
            <article class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-text">${escapeHtml(n.title)}</h3>
                <p class="mt-1 text-sm text-text-muted whitespace-pre-wrap">${
                  n.body ? escapeHtml(n.body) : `<span>${fmt.empty}</span>`
                }</p>
                <p class="mt-2 text-xs text-text-muted">
                  <time datetime="${n.created_at}">${fmt.dateTime(n.created_at)}</time>
                </p>
              </div>
              <button type="button"
                data-delete-id="${escapeHtml(n.id)}"
                class="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-sm text-danger hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                aria-label="Delete note ${escapeHtml(n.title)}">
                Delete
              </button>
            </article>
          </li>`,
          )
          .join("")}
      </ul>
    `;

    listPanel.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteError = "";
        pendingDeleteId = btn.getAttribute("data-delete-id");
        deleting = false;
        render();
        host.querySelector("#confirm-cancel")?.focus();
      });
    });
  }

  host.querySelector("#create-form")?.addEventListener("submit", onSubmit);
  host.querySelector("#dismiss-delete-error")?.addEventListener("click", () => {
    deleteError = "";
    render();
  });
  host.querySelector("#confirm-cancel")?.addEventListener("click", () => {
    if (deleting) return;
    pendingDeleteId = null;
    render();
  });
  host.querySelector("#confirm-backdrop")?.addEventListener("click", (e) => {
    if (deleting) return;
    if (e.target.id === "confirm-backdrop") {
      pendingDeleteId = null;
      render();
    }
  });
  host.querySelector("#confirm-delete")?.addEventListener("click", onConfirmDelete);
}

async function onConfirmDelete() {
  if (!pendingDeleteId || deleting) return;
  deleting = true;
  render();
  try {
    await deleteNote(pendingDeleteId);
    pendingDeleteId = null;
    deleting = false;
    deleteError = "";
    announce("Note deleted");
    render();
    const status = host.querySelector("#form-status");
    if (status) status.textContent = "Note deleted.";
  } catch (err) {
    deleting = false;
    pendingDeleteId = null;
    deleteError = err.message || "Could not delete the note. Try again.";
    announce("Could not delete the note");
    render();
  }
}

function onSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value.trim();
  const body = form.body.value;

  fieldErrors = {};
  if (!title) {
    fieldErrors.title = "Enter a title between 1 and 120 characters.";
    render();
    host.querySelector("#title")?.focus();
    return;
  }
  if (title.length > 120) {
    fieldErrors.title = "Title must be 120 characters or fewer.";
    render();
    host.querySelector("#title")?.focus();
    return;
  }
  if (body.length > 5000) {
    fieldErrors.title = "Body must be 5000 characters or fewer.";
    render();
    return;
  }

  addNote({ title, body });
  fieldErrors = {};
  form.reset();
  announce("Note saved");
  const status = host.querySelector("#form-status");
  if (status) status.textContent = "Note saved.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
