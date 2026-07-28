/* Fixture store for create-and-list notes mockup. Throwaway. */

export const STATES = ["success", "loading", "empty", "error", "forbidden"];

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

  const res = await fetch("./data/seed.json");
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
