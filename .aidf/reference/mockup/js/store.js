/* ---------------------------------------------------------------------------
 * Fixture store — loads data/seed.json, holds edits in memory, resets on demand.
 *
 * Two things this exists for:
 *   1. Every screen reads the SAME fixture file, so screens cannot drift apart
 *      between the reviewer opening one and opening the next.
 *   2. The reviewer can mutate and then reset, so a scenario can be re-run.
 *
 * `fetch` of a relative path is why the mockup must be served over HTTP — under
 * file:// the browser refuses the request and the page renders empty. See
 * serve.sh. Do not "fix" that by inlining the fixture into the markup: shared,
 * realistically-sized data is the point.
 *
 * Throwaway. No error handling worth the name, no persistence, no types.
 * ------------------------------------------------------------------------- */

export const STATES = ["success", "loading", "empty", "error", "forbidden"];

/* The design doc lists states; the mockup must make each one reachable BY A
   CLICK, not by editing code. ?state=empty drives that. */
export function requestedState() {
  const value = new URLSearchParams(location.search).get("state");
  return STATES.includes(value) ? value : "success";
}

const listeners = new Set();
let pristine = null; // as loaded from disk
let data = null; // mutable working copy

export function subscribe(fn) {
  listeners.add(fn);
  if (data) fn(data);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn(data);
}

/* Deliberate latency so the loading state is visible for long enough to judge.
   Real applications are slower than localhost, and a skeleton nobody ever sees
   is a skeleton nobody reviewed. */
const LATENCY_MS = 600;

export async function load() {
  const state = requestedState();

  if (state === "loading") {
    // Never resolves: the loading state is a screen to be reviewed, not a
    // transition to be waited out.
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
  if (state === "empty") data.records = [];

  await sleep(LATENCY_MS);
  emit();
  return data;
}

export function reset() {
  data = structuredClone(pristine);
  if (requestedState() === "empty") data.records = [];
  emit();
}

export function records() {
  return data ? data.records : [];
}

export function categories() {
  return data ? data.categories : [];
}

export function categoryById(id) {
  return categories().find((c) => c.id === id);
}

export function recordById(id) {
  return records().find((r) => r.id === id);
}

export function addRecord(fields) {
  const id = `rec_${String(records().length + 1).padStart(3, "0")}`;
  data.records.unshift({
    id,
    ref: fields.ref,
    label: fields.label,
    categoryId: fields.categoryId,
    owner: fields.owner || "You",
    amountCents: fields.amountCents,
    status: "pending",
    updated: new Date().toISOString(),
  });
  emit();
  return id;
}

export function updateRecord(id, fields) {
  const row = recordById(id);
  if (!row) return;
  Object.assign(row, fields, { updated: new Date().toISOString() });
  emit();
}

export function removeRecord(id) {
  data.records = data.records.filter((r) => r.id !== id);
  emit();
}

/* -- shared formatting ------------------------------------------------------
 * The conventions table in ui-foundation.md decides these. Sharing one
 * implementation across screens is what stops the prototype from showing three
 * different date formats and inviting feedback about the wrong thing. */

export const fmt = {
  money(cents) {
    const sign = cents < 0 ? "-" : "";
    return `${sign}$${(Math.abs(cents) / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },
  date(iso) {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },
  dateTime(iso) {
    return new Date(iso).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  },
  empty: "—",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
