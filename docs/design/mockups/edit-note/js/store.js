/* Fixture store for delete-note mockup. Throwaway — do not copy into the app. */

export const STATES = [
  "success",
  "loading",
  "empty",
  "error",
  "forbidden",
  "delete-error",
  "delete-missing",
];

export function requestedState() {
  const value = new URLSearchParams(location.search).get("state");
  return STATES.includes(value) ? value : "success";
}

const listeners = new Set();
let pristine = null;
let data = null;

export function subscribe(fn) {
  listeners.add(fn);
  if (data) fn(data);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn(data);
}

const LATENCY_MS = 600;

export async function load() {
  const state = requestedState();

  if (state === "loading") {
    return new Promise(() => {});
  }
  if (state === "error") {
    await sleep(LATENCY_MS);
    throw new Error("fixture-error");
  }
  if (state === "forbidden") {
    await sleep(LATENCY_MS);
    const err = new Error("fixture-forbidden");
    err.code = 403;
    throw err;
  }

  const res = await fetch("./data/seed.json?v=f2");
  if (!res.ok) throw new Error(`seed.json: ${res.status}`);
  pristine = await res.json();
  data = structuredClone(pristine);
  if (state === "empty") data.notes = [];

  await sleep(LATENCY_MS);
  emit();
  return data;
}

export function reset() {
  data = structuredClone(pristine);
  if (requestedState() === "empty") data.notes = [];
  emit();
}

export function notes() {
  return data ? data.notes : [];
}

export function noteById(id) {
  return notes().find((n) => n.id === id);
}

export function addNote({ title, body }) {
  const id = `note_${String(notes().length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  data.notes.unshift({
    id,
    title,
    body: body || "",
    created_at: now,
    updated_at: now,
  });
  emit();
  return id;
}

/**
 * Simulated DELETE. Returns a promise that resolves on success or rejects with
 * { code: 404 | 500, message } so the UI can show delete-error / not-found.
 */
export async function deleteNote(id) {
  const state = requestedState();
  await sleep(LATENCY_MS);

  if (state === "delete-error") {
    const err = new Error("fixture-delete-error");
    err.code = 500;
    err.message = "Could not delete the note. Nothing was removed. Try again.";
    throw err;
  }
  if (state === "delete-missing") {
    const err = new Error("fixture-delete-missing");
    err.code = 404;
    err.message = "That note was not found. It may already have been deleted.";
    throw err;
  }

  const before = data.notes.length;
  data.notes = data.notes.filter((n) => n.id !== id);
  if (data.notes.length === before) {
    const err = new Error("fixture-delete-missing");
    err.code = 404;
    err.message = "That note was not found. It may already have been deleted.";
    throw err;
  }
  emit();
}

/**
 * Simulated PATCH. Returns a promise that resolves on success or rejects with
 * { code: 400 | 404 | 500, message } so the UI can show validation / not-found / save-error.
 */
export async function updateNote(id, { title, body }) {
  const state = requestedState();
  await sleep(LATENCY_MS);

  if (state === "not-found") {
    const err = new Error("fixture-not-found");
    err.code = 404;
    err.message = "Note not found. It may have been deleted.";
    throw err;
  }
  if (state === "save-error") {
    const err = new Error("fixture-save-error");
    err.code = 500;
    err.message = "Could not save the note. Try again.";
    throw err;
  }

  const note = data.notes.find((n) => n.id === id);
  if (!note) {
    const err = new Error("fixture-not-found");
    err.code = 404;
    err.message = "Note not found. It may have been deleted.";
    throw err;
  }

  note.title = title;
  note.body = body || "";
  note.updated_at = new Date().toISOString();
  emit();
}

export const fmt = {
  dateTime(iso) {
    return new Date(iso).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },
  empty: "—",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
