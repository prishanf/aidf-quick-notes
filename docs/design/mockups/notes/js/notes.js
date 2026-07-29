/* Notes screen with inline edit + delete. Throwaway mockup — do not copy into the app. */

import {
  addNote,
  deleteNote,
  updateNote,
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
let createFieldErrors = {};
let createDraft = { title: "", body: "" };
let createPreview = false;
let deleteError = "";
let editError = "";
let pendingDeleteId = null;
let deleting = false;
let editingId = null;
let editFormData = { title: "", body: "" };
let editFieldErrors = {};
let editPreview = false;
let saving = false;

// Safe CommonMark subset renderer: raw HTML in the body is escaped, not
// executed (html: false). Mirrors the dependency choice in
// docs/specs/004-markdown-note-body.md so this mockup previews real behavior.
const md = window.markdownit({ html: false, linkify: true, breaks: true });
function renderMarkdown(text) {
  return text ? md.render(text) : "";
}

// Mock state for testing different UI states
const urlParams = new URLSearchParams(window.location.search);
const mockState = urlParams.get("state");

start();

async function start() {
  renderLoading(host, { rows: 6 });
  try {
    await load();
  } catch (err) {
    if (mockState !== "loading") {
      renderFailure(host, err);
      return;
    }
  }

  // Simulate different states for design review
  if (mockState === "edit") {
    editingId = notes()[0]?.id || null;
    if (editingId) {
      const note = noteById(editingId);
      editFormData = { title: note.title, body: note.body };
    }
  } else if (mockState === "saving") {
    editingId = notes()[0]?.id || null;
    if (editingId) {
      const note = noteById(editingId);
      editFormData = { title: note.title, body: note.body };
    }
    saving = true;
  } else if (mockState === "validation-error") {
    editingId = notes()[0]?.id || null;
    if (editingId) {
      const note = noteById(editingId);
      editFormData = { title: "", body: note.body };
      editFieldErrors.title = "Enter a title between 1 and 120 characters.";
    }
  } else if (mockState === "save-error") {
    editError = "Could not save the note. Try again.";
  } else if (mockState === "not-found") {
    editError = "Note not found. It may have been deleted.";
  } else if (mockState === "empty") {
    // Clear notes for empty state demo
    notes().length = 0;
  }

  subscribe(render);
  render();
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
          Add a short note, then find it in the list newest first. Edit notes to fix typos or update content. Delete removes permanently.
        </p>
      </header>

      <section aria-labelledby="create-heading" class="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <h2 id="create-heading" class="text-lg font-semibold">New note</h2>
        <form id="create-form" class="mt-4 space-y-4" novalidate>
          <div>
            <label for="title" class="block text-sm font-medium">Title</label>
            <input id="title" name="title" type="text" maxlength="120" required
              value="${escapeHtml(createDraft.title)}"
              aria-describedby="${createFieldErrors.title ? "title-error" : "title-hint"}"
              aria-invalid="${createFieldErrors.title ? "true" : "false"}"
              class="mt-1 w-full rounded-md border ${createFieldErrors.title ? "border-danger" : "border-border"} bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
            <p id="title-hint" class="mt-1 text-xs text-text-muted">1–120 characters. Required.</p>
            ${
              createFieldErrors.title
                ? `<p id="title-error" class="mt-1 text-sm text-danger" role="alert">${createFieldErrors.title}</p>`
                : ""
            }
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label for="body" class="block text-sm font-medium">Body</label>
              <div class="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label="Body editing mode">
                <button type="button" id="create-write-tab" aria-pressed="${!createPreview}"
                  class="px-2.5 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${!createPreview ? "bg-surface-sunken text-text" : "text-text-muted hover:text-text"}">
                  Write
                </button>
                <button type="button" id="create-preview-tab" aria-pressed="${createPreview}"
                  class="border-l border-border px-2.5 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${createPreview ? "bg-surface-sunken text-text" : "text-text-muted hover:text-text"}">
                  Preview
                </button>
              </div>
            </div>
            ${
              createPreview
                ? `<div class="mt-1 min-h-[6.5rem] w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text">
                    ${
                      createDraft.body
                        ? `<div class="rendered-md">${renderMarkdown(createDraft.body)}</div>`
                        : `<p class="text-sm text-text-muted italic">Nothing to preview yet — write some Markdown first.</p>`
                    }
                   </div>`
                : `<textarea id="body" name="body" rows="4" maxlength="5000"
                    aria-describedby="body-hint"
                    class="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">${escapeHtml(createDraft.body)}</textarea>`
            }
            <p id="body-hint" class="mt-1 text-xs text-text-muted">Optional. Up to 5000 characters. Markdown supported: headings, bold/italic, links, lists, code, blockquotes.</p>
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
        ${
          editError
            ? `<div role="alert" class="mt-3 rounded-lg border border-border bg-surface p-4">
                <p class="font-semibold text-text">Could not save</p>
                <p class="mt-1 text-sm text-text-muted">${escapeHtml(editError)}</p>
                <button type="button" id="dismiss-edit-error"
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
                "${escapeHtml(pending.title)}" will be removed permanently. This cannot be undone.
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
          .map((n) => renderNote(n))
          .join("")}
      </ul>
    `;

    // Attach event listeners to all row controls
    rows.forEach((n) => {
      if (editingId === n.id) {
        setupEditForm(n);
      } else {
        const editBtn = listPanel.querySelector(`[data-edit-id="${n.id}"]`);
        const deleteBtn = listPanel.querySelector(`[data-delete-id="${n.id}"]`);

        editBtn?.addEventListener("click", () => {
          editError = "";
          editingId = n.id;
          editFormData = { title: n.title, body: n.body };
          editFieldErrors = {};
          editPreview = false;
          render();
          setTimeout(() => {
            host.querySelector(`#edit-title-${n.id}`)?.focus();
          }, 0);
        });

        deleteBtn?.addEventListener("click", () => {
          deleteError = "";
          pendingDeleteId = n.id;
          deleting = false;
          render();
          host.querySelector("#confirm-cancel")?.focus();
        });
      }
    });
  }

  host.querySelector("#create-form")?.addEventListener("submit", onCreateSubmit);
  host.querySelector("#title")?.addEventListener("input", (e) => {
    createDraft.title = e.target.value;
  });
  host.querySelector("#body")?.addEventListener("input", (e) => {
    createDraft.body = e.target.value;
  });
  host.querySelector("#create-write-tab")?.addEventListener("click", () => {
    createPreview = false;
    render();
  });
  host.querySelector("#create-preview-tab")?.addEventListener("click", () => {
    createPreview = true;
    render();
  });
  host.querySelector("#dismiss-delete-error")?.addEventListener("click", () => {
    deleteError = "";
    render();
  });
  host.querySelector("#dismiss-edit-error")?.addEventListener("click", () => {
    editError = "";
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

function renderNote(n) {
  if (editingId === n.id) {
    return `
      <li class="px-4 py-3">
        <form class="space-y-4" id="edit-form-${n.id}" novalidate>
          <div>
            <label for="edit-title-${n.id}" class="block text-sm font-medium">Title</label>
            <input id="edit-title-${n.id}" name="title" type="text" maxlength="120" required
              value="${escapeHtml(editFormData.title)}"
              aria-describedby="${editFieldErrors.title ? `edit-title-error-${n.id}` : `edit-title-hint-${n.id}`}"
              aria-invalid="${editFieldErrors.title ? "true" : "false"}"
              ${saving ? "disabled" : ""}
              class="w-full rounded-md border ${editFieldErrors.title ? "border-danger" : "border-border"} bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
            <p id="edit-title-hint-${n.id}" class="mt-1 text-xs text-text-muted">1–120 characters. Required.</p>
            ${
              editFieldErrors.title
                ? `<p id="edit-title-error-${n.id}" class="mt-1 text-sm text-danger" role="alert">${editFieldErrors.title}</p>`
                : ""
            }
          </div>
          <div>
            <div class="flex items-center justify-between">
              <label for="edit-body-${n.id}" class="block text-sm font-medium">Body</label>
              <div class="inline-flex overflow-hidden rounded-md border border-border" role="group" aria-label="Body editing mode">
                <button type="button" id="edit-write-tab-${n.id}" aria-pressed="${!editPreview}"
                  ${saving ? "disabled" : ""}
                  class="px-2.5 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${!editPreview ? "bg-surface-sunken text-text" : "text-text-muted hover:text-text"}">
                  Write
                </button>
                <button type="button" id="edit-preview-tab-${n.id}" aria-pressed="${editPreview}"
                  ${saving ? "disabled" : ""}
                  class="border-l border-border px-2.5 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${editPreview ? "bg-surface-sunken text-text" : "text-text-muted hover:text-text"}">
                  Preview
                </button>
              </div>
            </div>
            ${
              editPreview
                ? `<div class="mt-1 min-h-[5.5rem] w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text">
                    ${
                      editFormData.body
                        ? `<div class="rendered-md">${renderMarkdown(editFormData.body)}</div>`
                        : `<p class="text-sm text-text-muted italic">Nothing to preview yet — write some Markdown first.</p>`
                    }
                   </div>`
                : `<textarea id="edit-body-${n.id}" name="body" rows="4" maxlength="5000"
                    ${saving ? "disabled" : ""}
                    class="w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">${escapeHtml(editFormData.body)}</textarea>`
            }
            <p class="mt-1 text-xs text-text-muted">Optional. Up to 5000 characters. Markdown supported.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="submit" id="save-btn-${n.id}"
              ${saving ? "disabled" : ""}
              class="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60">
              ${saving ? "Saving…" : "Save"}
            </button>
            <button type="button" id="cancel-btn-${n.id}"
              ${saving ? "disabled" : ""}
              class="rounded-md border border-border-strong px-3.5 py-2 text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              Cancel
            </button>
          </div>
        </form>
      </li>
    `;
  }

  return `
    <li class="px-4 py-3">
      <article class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-text">${escapeHtml(n.title)}</h3>
          <div class="mt-1 text-sm text-text-muted">${
            n.body ? `<div class="rendered-md">${renderMarkdown(n.body)}</div>` : `<span>${fmt.empty}</span>`
          }</div>
          <p class="mt-2 text-xs text-text-muted">
            <time datetime="${n.updated_at}">${fmt.dateTime(n.updated_at)}</time>
          </p>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          <button type="button"
            data-edit-id="${escapeHtml(n.id)}"
            class="rounded-md border border-border px-2.5 py-1.5 text-sm text-primary hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            aria-label="Edit note ${escapeHtml(n.title)}">
            Edit
          </button>
          <button type="button"
            data-delete-id="${escapeHtml(n.id)}"
            class="rounded-md border border-border px-2.5 py-1.5 text-sm text-danger hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            aria-label="Delete note ${escapeHtml(n.title)}">
            Delete
          </button>
        </div>
      </article>
    </li>
  `;
}

function setupEditForm(n) {
  const form = host.querySelector(`#edit-form-${n.id}`);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await onEditSubmit(n.id);
  });

  host.querySelector(`#edit-title-${n.id}`)?.addEventListener("input", (e) => {
    editFormData.title = e.target.value;
  });
  host.querySelector(`#edit-body-${n.id}`)?.addEventListener("input", (e) => {
    editFormData.body = e.target.value;
  });
  host.querySelector(`#edit-write-tab-${n.id}`)?.addEventListener("click", () => {
    editPreview = false;
    render();
  });
  host.querySelector(`#edit-preview-tab-${n.id}`)?.addEventListener("click", () => {
    editPreview = true;
    render();
  });

  host.querySelector(`#cancel-btn-${n.id}`)?.addEventListener("click", () => {
    editingId = null;
    editFormData = { title: "", body: "" };
    editFieldErrors = {};
    editPreview = false;
    render();
  });
}

async function onEditSubmit(noteId) {
  if (saving) return;

  // Read from editFormData, not the DOM: the body textarea does not exist
  // while the Preview tab is showing rendered output instead.
  const title = editFormData.title.trim();
  const body = editFormData.body;

  editFieldErrors = {};

  if (!title) {
    editFieldErrors.title = "Enter a title between 1 and 120 characters.";
    render();
    return;
  }
  if (title.length > 120) {
    editFieldErrors.title = "Title must be 120 characters or fewer.";
    render();
    return;
  }
  if (body.length > 5000) {
    editFieldErrors.body = "Body must be 5000 characters or fewer.";
    render();
    return;
  }

  saving = true;
  editFormData = { title, body };
  render();

  try {
    // Simulate API call with mock error states
    if (mockState === "not-found") {
      throw new Error("Note not found. It may have been deleted.");
    }
    if (mockState === "save-error" && !mockState.includes("validation")) {
      throw new Error("Could not save the note. Try again.");
    }

    await updateNote(noteId, { title, body });
    editingId = null;
    editFormData = { title: "", body: "" };
    editFieldErrors = {};
    editPreview = false;
    saving = false;
    editError = "";
    announce("Note saved");
    render();
    const status = host.querySelector("#form-status");
    if (status) status.textContent = "Note updated.";
  } catch (err) {
    saving = false;
    editError = err.message || "Could not save the note. Try again.";
    announce("Could not save the note");
    render();
  }
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

function onCreateSubmit(event) {
  event.preventDefault();
  const title = createDraft.title.trim();
  const body = createDraft.body;

  createFieldErrors = {};
  if (!title) {
    createFieldErrors.title = "Enter a title between 1 and 120 characters.";
    render();
    host.querySelector("#title")?.focus();
    return;
  }
  if (title.length > 120) {
    createFieldErrors.title = "Title must be 120 characters or fewer.";
    render();
    host.querySelector("#title")?.focus();
    return;
  }
  if (body.length > 5000) {
    createFieldErrors.title = "Body must be 5000 characters or fewer.";
    render();
    return;
  }

  addNote({ title, body });
  createFieldErrors = {};
  createDraft = { title: "", body: "" };
  createPreview = false;
  render();
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
