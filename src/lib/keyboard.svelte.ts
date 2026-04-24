export type KeyContext = 'list' | 'message' | 'composer'
export type KeyPanel = 'mailboxes' | 'list'

export const keyboard = $state({
  focusedIndex: 0, // focused row in the message list
  panel: 'list' as KeyPanel, // which visual panel has keyboard focus
  focusedMailboxIndex: 0, // focused row in the mailbox sidebar
  mailboxCount: 0, // total mailboxes (set by sidebar)
  onMailboxSelect: null as (() => void) | null
})

type Handler = () => void
type HandlerMap = Record<string, Handler>

// Handlers registered per context. The dispatcher picks the highest-priority
// context that currently has handlers, so registration order is irrelevant
// (cold load and SPA navigation differ in which onMount fires first).
const handlersByContext: Map<KeyContext, HandlerMap> = new Map()
const CONTEXT_PRIORITY: KeyContext[] = ['composer', 'message', 'list']

function activeContext(): KeyContext | null {
  for (const ctx of CONTEXT_PRIORITY) {
    if (handlersByContext.has(ctx)) return ctx
  }
  return null
}

let chordPending = false
let chordTimer: ReturnType<typeof setTimeout> | null = null

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    el.isContentEditable ||
    el.closest('[contenteditable="true"]') !== null ||
    el.closest('.ProseMirror') !== null
  )
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (isEditableTarget(e.target)) return

  const ctx = activeContext()
  const handlers = ctx ? (handlersByContext.get(ctx) ?? {}) : {}

  // Composer context: only allow Escape
  if (ctx === 'composer') {
    if (e.key === 'Escape') handlers['Escape']?.()
    return
  }

  // ── Panel switching with ArrowLeft / ArrowRight ──────────────────────────
  if (e.key === 'ArrowLeft') {
    if (handlers['ArrowLeft']) {
      e.preventDefault()
      handlers['ArrowLeft']()
      return
    }
    if (keyboard.panel === 'list') {
      keyboard.panel = 'mailboxes'
      e.preventDefault()
      return
    }
    return
  }

  if (e.key === 'ArrowRight') {
    if (keyboard.panel === 'mailboxes') {
      keyboard.onMailboxSelect?.()
      keyboard.panel = 'list'
      e.preventDefault()
      return
    }
    if (keyboard.panel === 'list') {
      handlers['Enter']?.()
      e.preventDefault()
      return
    }
    return
  }

  // ── Mailboxes panel: Up/Down navigate items, Enter selects ───────────────
  if (keyboard.panel === 'mailboxes') {
    if (e.key === 'ArrowUp') {
      keyboard.focusedMailboxIndex = Math.max(0, keyboard.focusedMailboxIndex - 1)
      e.preventDefault()
      return
    }
    if (e.key === 'ArrowDown') {
      keyboard.focusedMailboxIndex = Math.min(
        keyboard.mailboxCount - 1,
        keyboard.focusedMailboxIndex + 1
      )
      e.preventDefault()
      return
    }
    if (e.key === 'Enter') {
      keyboard.onMailboxSelect?.()
      e.preventDefault()
      return
    }
    // Swallow all other keys while mailboxes panel is focused
    return
  }

  // ── Chord: * then a/n ────────────────────────────────────────────────────
  if (chordPending) {
    clearTimeout(chordTimer!)
    chordPending = false
    const chord = `*${e.key}`
    if (handlers[chord]) {
      e.preventDefault()
      handlers[chord]()
      return
    }
  }

  if (e.key === '*') {
    chordPending = true
    chordTimer = setTimeout(() => {
      chordPending = false
    }, 1000)
    return
  }

  const handler = handlers[e.key]
  if (handler) {
    e.preventDefault()
    handler()
  }
}

let listenerAttached = false

function ensureListener() {
  if (listenerAttached) return
  document.addEventListener('keydown', handleKeyDown)
  listenerAttached = true
}

/**
 * Register keyboard handlers for a context. The dispatcher routes by
 * context priority (composer > message > list), so registration order
 * does not matter. Returns a teardown function.
 */
export function setupKeyboardHandler(
  context: KeyContext,
  newHandlers: HandlerMap
): () => void {
  ensureListener()
  const prev = handlersByContext.get(context)
  handlersByContext.set(context, newHandlers)
  return () => {
    // Only roll back if our handlers are still the registered ones
    if (handlersByContext.get(context) !== newHandlers) return
    if (prev) handlersByContext.set(context, prev)
    else handlersByContext.delete(context)
  }
}
