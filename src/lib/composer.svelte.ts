export type ComposerMode = 'compose' | 'reply' | 'reply-all' | 'forward'

export type ComposerMessage = {
  id: number
  messageId?: string
  from: string | null
  to: string | null
  subject: string | null
  htmlContent: string | null
  textContent: string | null
  receivedAt: string | null
}

type ComposerState = {
  open: boolean
  minimized: boolean
  fullscreen: boolean
  mode: ComposerMode
  to: string
  cc: string
  bcc: string
  subject: string
  initialHtml: string
  inReplyTo: string | null
}

export const composer = $state<ComposerState>({
  open: false,
  minimized: false,
  fullscreen: false,
  mode: 'compose' as ComposerMode,
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  initialHtml: '',
  inReplyTo: null as string | null
})

function extractEmail(addr: string | null): string {
  if (!addr) return ''
  const match = addr.match(/<([^>]+)>/)
  return match ? match[1] : addr.trim()
}

function extractName(addr: string | null): string {
  if (!addr) return ''
  const name = addr.split('<')[0]?.trim()
  return name || addr
}

function formatQuoteDate(date: string | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(date))
}

function buildReplyQuote(msg: ComposerMessage): string {
  const date = formatQuoteDate(msg.receivedAt)
  const name = extractName(msg.from)
  const email = extractEmail(msg.from)
  const label = name && name !== email ? `${name} &lt;${email}&gt;` : `&lt;${email}&gt;`
  const body = msg.htmlContent
    ? msg.htmlContent
    : `<p>${(msg.textContent ?? '').replace(/\n/g, '<br>')}</p>`
  return `<p></p><blockquote data-type="quote"><p>On ${date}, ${label} wrote:</p>${body}</blockquote>`
}

function buildForwardBody(msg: ComposerMessage): string {
  const date = formatQuoteDate(msg.receivedAt)
  const body = msg.htmlContent
    ? msg.htmlContent
    : `<p>${(msg.textContent ?? '').replace(/\n/g, '<br>')}</p>`
  return `<p></p>
<p>---------- Forwarded message ----------</p>
<p><strong>From:</strong> ${msg.from ?? ''}</p>
<p><strong>Date:</strong> ${date}</p>
<p><strong>Subject:</strong> ${msg.subject ?? ''}</p>
<p><strong>To:</strong> ${msg.to ?? ''}</p>
<p></p>
${body}`
}

export function openCompose() {
  composer.mode = 'compose'
  composer.to = ''
  composer.cc = ''
  composer.bcc = ''
  composer.subject = ''
  composer.initialHtml = ''
  composer.inReplyTo = null
  composer.minimized = false
  composer.fullscreen = false
  composer.open = true
}

export function openReply(msg: ComposerMessage) {
  composer.mode = 'reply'
  composer.to = msg.from ?? ''
  composer.cc = ''
  composer.bcc = ''
  composer.subject = msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject ?? ''}`
  composer.initialHtml = buildReplyQuote(msg)
  composer.inReplyTo = null
  composer.minimized = false
  composer.fullscreen = false
  composer.open = true
}

export function openReplyAll(msg: ComposerMessage) {
  const fromEmail = extractEmail(msg.from)
  const toAddrs = (msg.to ?? '')
    .split(',')
    .map((a) => a.trim())
    .filter((a) => extractEmail(a) !== fromEmail)
  composer.mode = 'reply-all'
  composer.to = msg.from ?? ''
  composer.cc = toAddrs.join(', ')
  composer.bcc = ''
  composer.subject = msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject ?? ''}`
  composer.initialHtml = buildReplyQuote(msg)
  composer.inReplyTo = null
  composer.minimized = false
  composer.fullscreen = false
  composer.open = true
}

export function openForward(msg: ComposerMessage) {
  composer.mode = 'forward'
  composer.to = ''
  composer.cc = ''
  composer.bcc = ''
  composer.subject = msg.subject?.startsWith('Fwd:') ? msg.subject : `Fwd: ${msg.subject ?? ''}`
  composer.initialHtml = buildForwardBody(msg)
  composer.inReplyTo = null
  composer.minimized = false
  composer.fullscreen = false
  composer.open = true
}

export function closeComposer() {
  composer.fullscreen = false
  composer.open = false
}
