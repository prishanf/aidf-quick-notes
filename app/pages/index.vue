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

const pendingDeleteId = ref<string | null>(null)
const deleting = ref(false)
const deleteError = ref('')

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editBody = ref('')
const editTitleError = ref('')
const editBodyError = ref('')
const editError = ref('')
const savingEdit = ref(false)

const pendingNote = computed(() =>
  pendingDeleteId.value
    ? notes.value.find(n => n.id === pendingDeleteId.value) ?? null
    : null,
)

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

function openDeleteConfirm(id: string) {
  if (editingId.value) cancelEdit()
  deleteError.value = ''
  editError.value = ''
  pendingDeleteId.value = id
  deleting.value = false
}

function cancelDelete() {
  if (deleting.value) return
  pendingDeleteId.value = null
}

function onConfirmBackdrop(event: MouseEvent) {
  if (event.target === event.currentTarget) cancelDelete()
}

async function confirmDelete() {
  const id = pendingDeleteId.value
  if (!id || deleting.value) return

  deleting.value = true
  try {
    await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
    notes.value = notes.value.filter(n => n.id !== id)
    pendingDeleteId.value = null
    deleteError.value = ''
    formStatus.value = 'Note deleted.'
  }
  catch (error: unknown) {
    const err = error as {
      statusCode?: number
      data?: { statusMessage?: string; statusCode?: number }
      statusMessage?: string
    }
    const status = err?.data?.statusCode ?? err?.statusCode
    deleteError.value = err?.data?.statusMessage
      || err?.statusMessage
      || (status === 404
        ? 'That note was not found. It may already have been deleted.'
        : 'Could not delete the note. Nothing was removed. Try again.')
    pendingDeleteId.value = null
  }
  finally {
    deleting.value = false
  }
}

function openEdit(note: Note) {
  if (pendingDeleteId.value) return
  editError.value = ''
  deleteError.value = ''
  editingId.value = note.id
  editTitle.value = note.title
  editBody.value = note.body
  editTitleError.value = ''
  editBodyError.value = ''
  nextTick(() => {
    document.getElementById(`edit-title-${note.id}`)?.focus()
  })
}

function cancelEdit() {
  if (savingEdit.value) return
  editingId.value = null
  editTitle.value = ''
  editBody.value = ''
  editTitleError.value = ''
  editBodyError.value = ''
}

async function saveEdit() {
  const id = editingId.value
  if (!id || savingEdit.value) return

  editTitleError.value = ''
  editBodyError.value = ''
  editError.value = ''

  const trimmed = editTitle.value.trim()
  if (!trimmed || trimmed.length > 120) {
    editTitleError.value = 'Enter a title between 1 and 120 characters.'
    return
  }
  if (editBody.value.length > 5000) {
    editBodyError.value = 'Body must be 5000 characters or fewer.'
    return
  }

  const existing = notes.value.find(n => n.id === id)
  if (!existing) {
    editError.value = 'That note was not found. It may already have been deleted.'
    editingId.value = null
    return
  }

  const patch: { title?: string; body?: string } = {}
  if (trimmed !== existing.title) patch.title = trimmed
  if (editBody.value !== existing.body) patch.body = editBody.value

  if (!patch.title && patch.body === undefined) {
    cancelEdit()
    return
  }

  savingEdit.value = true
  try {
    const updated = await $fetch<Note>(`/api/notes/${id}`, {
      method: 'PATCH',
      body: patch,
    })
    notes.value = notes.value.map(n => (n.id === id ? updated : n))
    editingId.value = null
    editTitle.value = ''
    editBody.value = ''
    formStatus.value = 'Note updated.'
  }
  catch (error: unknown) {
    const err = error as {
      statusCode?: number
      data?: { statusMessage?: string; statusCode?: number }
      statusMessage?: string
    }
    const status = err?.data?.statusCode ?? err?.statusCode
    const message = err?.data?.statusMessage
      || err?.statusMessage
      || (status === 404
        ? 'That note was not found. It may already have been deleted.'
        : 'Could not save the note. Nothing was changed. Try again.')

    if (status === 404) {
      editError.value = message
      notes.value = notes.value.filter(n => n.id !== id)
      editingId.value = null
      return
    }

    if (status === 400 && message.toLowerCase().includes('title')) {
      editTitleError.value = message
      return
    }
    if (status === 400 && message.toLowerCase().includes('body')) {
      editBodyError.value = message
      return
    }

    editError.value = message
  }
  finally {
    savingEdit.value = false
  }
}

onMounted(() => {
  loadNotes()
})

watch(pendingNote, (note) => {
  if (!note) return
  nextTick(() => {
    document.getElementById('confirm-cancel')?.focus()
  })
})

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (pendingDeleteId.value) {
    cancelDelete()
    return
  }
  if (editingId.value) cancelEdit()
}

watch([pendingDeleteId, editingId], ([deleteId, editId], _, onCleanup) => {
  if (!deleteId && !editId) return
  document.addEventListener('keydown', onDocumentKeydown)
  onCleanup(() => document.removeEventListener('keydown', onDocumentKeydown))
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
          Add a short note, then find it in the list newest first. Edit notes to fix typos or update content. Delete removes permanently.
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
          v-if="editError"
          class="mt-3 rounded-lg border border-border bg-surface p-4"
          role="alert"
        >
          <p class="font-semibold text-text">
            Could not update
          </p>
          <p class="mt-1 text-sm text-text-muted">
            {{ editError }}
          </p>
          <button
            type="button"
            class="mt-3 rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            @click="editError = ''"
          >
            Dismiss
          </button>
        </div>

        <div
          v-if="deleteError"
          class="mt-3 rounded-lg border border-border bg-surface p-4"
          role="alert"
        >
          <p class="font-semibold text-text">
            Could not delete
          </p>
          <p class="mt-1 text-sm text-text-muted">
            {{ deleteError }}
          </p>
          <button
            type="button"
            class="mt-3 rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            @click="deleteError = ''"
          >
            Dismiss
          </button>
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
            <form
              v-if="editingId === note.id"
              class="space-y-3"
              novalidate
              @submit.prevent="saveEdit"
            >
              <div>
                <label
                  :for="`edit-title-${note.id}`"
                  class="block text-sm font-medium"
                >Title</label>
                <input
                  :id="`edit-title-${note.id}`"
                  v-model="editTitle"
                  type="text"
                  maxlength="120"
                  required
                  :aria-invalid="editTitleError ? 'true' : 'false'"
                  :aria-describedby="editTitleError ? `edit-title-error-${note.id}` : undefined"
                  class="mt-1 w-full rounded-md border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  :class="editTitleError ? 'border-danger' : 'border-border'"
                >
                <p
                  v-if="editTitleError"
                  :id="`edit-title-error-${note.id}`"
                  class="mt-1 text-sm text-danger"
                  role="alert"
                >
                  {{ editTitleError }}
                </p>
              </div>
              <div>
                <label
                  :for="`edit-body-${note.id}`"
                  class="block text-sm font-medium"
                >Body</label>
                <textarea
                  :id="`edit-body-${note.id}`"
                  v-model="editBody"
                  rows="3"
                  maxlength="5000"
                  :aria-invalid="editBodyError ? 'true' : 'false'"
                  :aria-describedby="editBodyError ? `edit-body-error-${note.id}` : undefined"
                  class="mt-1 w-full rounded-md border bg-surface px-3 py-2 text-base text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  :class="editBodyError ? 'border-danger' : 'border-border'"
                />
                <p
                  v-if="editBodyError"
                  :id="`edit-body-error-${note.id}`"
                  class="mt-1 text-sm text-danger"
                  role="alert"
                >
                  {{ editBodyError }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="submit"
                  class="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
                  :disabled="savingEdit"
                >
                  {{ savingEdit ? 'Saving…' : 'Save' }}
                </button>
                <button
                  type="button"
                  class="rounded-md border border-border-strong px-3.5 py-2 text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
                  :disabled="savingEdit"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </div>
            </form>

            <article
              v-else
              class="flex items-start justify-between gap-3"
            >
              <div class="min-w-0 flex-1">
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
                  <time :datetime="note.updatedAt">{{ formatDateTime(note.updatedAt) }}</time>
                </p>
              </div>
              <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  class="rounded-md border border-border px-2.5 py-1.5 text-sm text-text hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  :aria-label="`Edit note ${note.title}`"
                  @click="openEdit(note)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded-md border border-border px-2.5 py-1.5 text-sm text-danger hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  :aria-label="`Delete note ${note.title}`"
                  @click="openDeleteConfirm(note.id)"
                >
                  Delete
                </button>
              </div>
            </article>
          </li>
        </ul>
      </section>
    </main>

    <div
      v-if="pendingNote"
      class="fixed inset-0 z-40 flex items-end justify-center bg-text/40 p-4 sm:items-center"
      role="presentation"
      @click="onConfirmBackdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        class="w-full max-w-md rounded-lg border border-border bg-surface-raised p-5 shadow-lg"
      >
        <h2
          id="confirm-title"
          class="text-lg font-semibold text-text"
        >
          Delete this note?
        </h2>
        <p class="mt-2 text-sm text-text-muted">
          “{{ pendingNote.title }}” will be removed permanently. This cannot be undone.
        </p>
        <div class="mt-5 flex flex-wrap justify-end gap-2">
          <button
            id="confirm-cancel"
            type="button"
            class="rounded-md border border-border-strong px-3.5 py-2 text-sm hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
            :disabled="deleting"
            @click="cancelDelete"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-md bg-danger px-3.5 py-2 text-sm font-medium text-danger-fg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60"
            :disabled="deleting"
            @click="confirmDelete"
          >
            {{ deleting ? 'Deleting…' : 'Delete note' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
