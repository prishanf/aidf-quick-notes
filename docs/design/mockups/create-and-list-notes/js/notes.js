/* Notes screen: create form + list. Throwaway mockup — do not copy into the app. */

import { addNote, fmt, load, notes, requestedState, subscribe } from "./store.js";
import {
  announce,
  mountShell,
  renderEmpty,
  renderFailure,
  renderLoading,
} from "./shell.js";

mountShell({ screen: "notes" });

const host = document.getElementById("content");
let fieldErrors = {};

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

  host.innerHTML = `
    <div class="space-y-8">
      <header>
        <p class="text-sm font-medium uppercase tracking-wide text-text-muted">AIDF Quick Notes</p>
        <h1 class="mt-1 text-2xl font-semibold text-text">Your notes</h1>
        <p class="mt-2 text-sm text-text-muted">
          Add a short note, then find it in the list newest first.
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
        <div id="list-panel" class="mt-3"></div>
      </section>
    </div>
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
            <article>
              <h3 class="font-semibold text-text">${escapeHtml(n.title)}</h3>
              <p class="mt-1 text-sm text-text-muted whitespace-pre-wrap">${
                n.body ? escapeHtml(n.body) : `<span>${fmt.empty}</span>`
              }</p>
              <p class="mt-2 text-xs text-text-muted">
                <time datetime="${n.created_at}">${fmt.dateTime(n.created_at)}</time>
              </p>
            </article>
          </li>`,
          )
          .join("")}
      </ul>
    `;
  }

  host.querySelector("#create-form").addEventListener("submit", onSubmit);
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

// Keep requestedState imported for future state-specific form tweaks.
void requestedState;
