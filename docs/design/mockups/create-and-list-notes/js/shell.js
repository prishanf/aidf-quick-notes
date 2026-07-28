/* ---------------------------------------------------------------------------
 * Prototype shell: banner, screen nav, state switcher, theme toggle, reset.
 *
 * This is scaffolding for the REVIEWER, not product chrome. It exists so the
 * reviewer never has to edit a file, guess a URL, or ask which states are
 * implemented — every state named in the design doc is one click away.
 *
 * Nothing in this file ships.
 * ------------------------------------------------------------------------- */

import { STATES, requestedState, reset, subscribe } from "./store.js";

const SCREENS = [
  { href: "index.html", label: "Overview" },
  { href: "notes.html", label: "Notes" },
];

const THEME_KEY = "aidf-mockup-theme";

export function mountShell({ screen }) {
  applyStoredTheme();

  const state = requestedState();
  const host = document.getElementById("shell");
  if (!host) return;

  host.innerHTML = `
    <div class="proto-banner text-xs">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        <span class="font-semibold tracking-wide uppercase">Prototype</span>
        <span class="text-text-muted">Throwaway mockup for design approval &mdash; not the implementation, fabricated data</span>
        <span class="ml-auto flex items-center gap-2">
          <button type="button" data-act="theme"
            class="rounded-sm border border-border bg-surface px-2 py-1 hover:border-border-strong">
            Theme
          </button>
          <button type="button" data-act="reset"
            class="rounded-sm border border-border bg-surface px-2 py-1 hover:border-border-strong">
            Reset fixtures
          </button>
        </span>
      </div>
    </div>

    <header class="border-b border-border bg-surface">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
        <nav aria-label="Screens" class="flex items-center gap-1">
          ${SCREENS.map(
            (s) => `
            <a href="./${s.href}${state === "success" ? "" : `?state=${state}`}"
               class="rounded-sm px-2.5 py-1.5 text-sm ${
                 s.href.startsWith(screen)
                   ? "bg-surface-sunken font-semibold text-text"
                   : "text-text-muted hover:text-text"
               }">${s.label}</a>`,
          ).join("")}
        </nav>

        <div class="flex items-center gap-2 md:ml-auto">
          <label for="state-switch" class="text-xs text-text-muted">State</label>
          <select id="state-switch"
            class="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm">
            ${STATES.map(
              (s) =>
                `<option value="${s}"${s === state ? " selected" : ""}>${s}</option>`,
            ).join("")}
          </select>
        </div>
      </div>
    </header>
  `;

  host.querySelector('[data-act="reset"]').addEventListener("click", () => {
    reset();
    announce("Fixtures reset");
  });

  host.querySelector('[data-act="theme"]').addEventListener("click", toggleTheme);

  host.querySelector("#state-switch").addEventListener("change", (e) => {
    const url = new URL(location.href);
    if (e.target.value === "success") url.searchParams.delete("state");
    else url.searchParams.set("state", e.target.value);
    location.assign(url);
  });
}

/* -- state renderers, shared by every screen --------------------------------
 * Empty, loading, and error are the states agents skip, so the scaffold hands
 * them over pre-built. A design review that never sees them is not a review of
 * the design. */

export function renderLoading(host, { rows = 8 } = {}) {
  host.innerHTML = `
    <div aria-busy="true" aria-live="polite" class="space-y-2">
      <span class="sr-only">Loading</span>
      ${Array.from({ length: rows })
        .map(
          (_, i) =>
            `<div class="skeleton h-11" style="opacity:${1 - i * 0.07}"></div>`,
        )
        .join("")}
    </div>`;
}

export function renderEmpty(host, { title, body, action }) {
  host.innerHTML = `
    <div class="rounded-lg border border-dashed border-border bg-surface px-6 py-14 text-center">
      <h2 class="text-lg font-semibold">${title}</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-text-muted">${body}</p>
      ${
        action
          ? `<button type="button" data-act="${action.act}"
               class="mt-5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover">
               ${action.label}
             </button>`
          : ""
      }
    </div>`;
}

export function renderError(host, { code, title, body, retry = true }) {
  host.innerHTML = `
    <div role="alert" class="rounded-lg border border-border bg-surface p-6">
      <div class="flex items-start gap-3">
        <span aria-hidden="true"
          class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-danger text-xs font-bold text-danger-fg">!</span>
        <div>
          <h2 class="font-semibold">${title}</h2>
          <p class="mt-1 text-sm text-text-muted">${body}</p>
          ${code ? `<p class="mt-2 text-xs text-text-muted">Reference: ${code}</p>` : ""}
          ${
            retry
              ? `<button type="button" onclick="location.reload()"
                   class="mt-4 rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-surface-sunken">
                   Try again
                 </button>`
              : ""
          }
        </div>
      </div>
    </div>`;
}

/* An error message names what went wrong and what to do next. Never a raw code
   on its own — see the content conventions in ui-foundation.md. */
export function renderFailure(host, err) {
  if (err && err.code === 403) {
    renderError(host, {
      title: "You do not have access to these notes",
      body: "This example has no real auth. This state shows how a permission failure would look if one is added later.",
      code: "403",
      retry: false,
    });
    return;
  }
  renderError(host, {
    title: "We could not load your notes",
    body: "The request did not complete. Nothing was changed. Try again.",
    code: "ERR-FIXTURE",
  });
}

export function announce(message) {
  let live = document.getElementById("live-region");
  if (!live) {
    live = document.createElement("div");
    live.id = "live-region";
    live.setAttribute("aria-live", "polite");
    live.className = "sr-only";
    document.body.append(live);
  }
  live.textContent = "";
  setTimeout(() => (live.textContent = message), 30);
}

export { subscribe };

function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const dark =
    stored === "dark" ||
    (stored === null && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}
