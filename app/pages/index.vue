<script setup lang="ts">
type Note = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

type LoadState = 'loading' | 'success' | 'error'

const notes = ref<Note[]>([])
const loadState = ref<LoadState>('loading')
const loadError = ref('')
const title = ref('')
const body = ref('')
const titleError = ref('')
const formStatus = ref('')
const saving = ref(false)

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadNotes() {
  loadState.value = 'loading'
  loadError.value = ''
  try {
    const response = await $fetch<{ notes: Note[] }>('/api/notes')
    notes.value = response.notes
    loadState.value = 'success'
  }
  catch {
    loadError.value = 'The request did not complete. Nothing was changed. Try again.'
    loadState.value = 'error'
  }
}

async function onSubmit() {
  titleError.value = ''
  formStatus.value = ''
  const trimmed = title.value.trim()
  if (!trimmed || trimmed.length > 120) {
    titleError.value = 'Enter a title between 1 and 120 characters.'
    return
  }
  if (body.value.length > 5000) {
    titleError.value = 'Body must be 5000 characters or fewer.'
    return
  }

  saving.value = true
  try {
    const created = await $fetch<Note>('/api/notes', {
      method: 'POST',
      body: {
        title: trimmed,
        body: body.value,
      },
    })
    notes.value = [created, ...notes.value]
    title.value = ''
    body.value = ''
    formStatus.value = 'Note saved.'
  }
  catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string }; statusMessage?: string }
    titleError.value = err?.data?.statusMessage || err?.statusMessage || 'Could not save the note. Try again.'
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  loadNotes()
})
</script>

<template>
  <div class="min-h-screen px-4 py-6">
    <main class="mx-auto max-w-2xl space-y-8">
      <header>
        <p class="text-sm font-medium uppercase tracking-wide text-text-muted">
          AIDF Quick Notes
        </p>
        <h1 class="mt-1 text-2xl font-semibold text-text">
          Your notes
        </h1>
        <p class="mt-2 text-sm text-text-muted">
          Add a short note, then find it in the list newest first.
        </p>
      </header>

      <section
        aria-labelledby="create-heading"
        class="rounded-lg border border-border bg-surface p-4 shadow-sm"
      >
        <h2
          id="create-heading"
          class="text-lg font-semibold"
        >
          New note
        </h2>
        <form
          class="mt-4 space-y-4"
          novalidate
          @submit.prevent="onSubmit"
        >
          <div>
            <label
              for="title"
              class="block text-sm font-medium"
            >Title</label>
            <input
              id="title"
              v-model="title"
              type="text"
              maxlength="120"
              required
              :aria-invalid="titleError ? 'true' : 'false'"
              :aria-describedby="titleError ? 'title-error' : 'title-hint'"
              class="mt-1 w-full rounded-md border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              :class="titleError ? 'border-danger' : 'border-border'"
            >
            <p
              id="title-hint"
              class="mt-1 text-xs text-text-muted"
            >
              1–120 characters. Required.
            </p>
            <p
              v-if="titleError"
              id="title-error"
              class="mt-1 text-sm text-danger"
              role="alert"
            >
              {{ titleError }}
            </p>
          </div>

          <div>
            <label
              for="body"
              class="block text-sm font-medium"
            >Body</label>
            <textarea
              id="body"
              v-model="body"
              rows="4"
              maxlength="5000"
              aria-describedby="body-hint"
              class="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
            <p
              id="body-hint"
              class="mt-1 text-xs text-text-muted"
            >
              Optional. Up to 5000 characters.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="submit"
              class="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
              :disabled="saving"
            >
              {{ saving ? 'Saving…' : 'Save note' }}
            </button>
            <p
              class="text-sm text-text-muted"
              aria-live="polite"
            >
              {{ formStatus }}
            </p>
          </div>
        </form>
      </section>

      <section aria-labelledby="list-heading">
        <div class="flex items-baseline justify-between gap-3">
          <h2
            id="list-heading"
            class="text-lg font-semibold"
          >
            All notes
          </h2>
          <p
            v-if="loadState === 'success'"
            class="text-sm text-text-muted"
          >
            {{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }}
          </p>
        </div>

        <div
          v-if="loadState === 'loading'"
          class="mt-3 space-y-2"
          aria-busy="true"
          aria-live="polite"
        >
          <span class="sr-only">Loading</span>
          <div
            v-for="n in 5"
            :key="n"
            class="h-11 animate-pulse rounded-md bg-surface-sunken"
          />
        </div>

        <div
          v-else-if="loadState === 'error'"
          class="mt-3 rounded-lg border border-border bg-surface p-6"
          role="alert"
        >
          <h3 class="font-semibold">
            We could not load your notes
          </h3>
          <p class="mt-1 text-sm text-text-muted">
            {{ loadError }}
          </p>
          <button
            type="button"
            class="mt-4 rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-surface-sunken"
            @click="loadNotes"
          >
            Try again
          </button>
        </div>

        <div
          v-else-if="notes.length === 0"
          class="mt-3 rounded-lg border border-dashed border-border bg-surface px-6 py-14 text-center"
        >
          <h3 class="text-lg font-semibold">
            No notes yet
          </h3>
          <p class="mx-auto mt-2 max-w-md text-sm text-text-muted">
            Save your first note with the form above. It will show up here newest first.
          </p>
        </div>

        <ul
          v-else
          class="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface"
        >
          <li
            v-for="note in notes"
            :key="note.id"
            class="px-4 py-3"
          >
            <article>
              <h3 class="font-semibold text-text">
                {{ note.title }}
              </h3>
              <p class="mt-1 whitespace-pre-wrap text-sm text-text-muted">
                <template v-if="note.body">
                  {{ note.body }}
                </template>
                <span v-else>—</span>
              </p>
              <p class="mt-2 text-xs text-text-muted">
                <time :datetime="note.createdAt">{{ formatDateTime(note.createdAt) }}</time>
              </p>
            </article>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
