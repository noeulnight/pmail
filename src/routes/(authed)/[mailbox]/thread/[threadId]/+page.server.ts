import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import {
  getMessagesInThread,
  markMessageAsRead,
  getMailboxRole,
  resolveMailboxPath
} from '$lib/server/mail'
import { db } from '$lib/server/db'
import { mailAttachment } from '$lib/server/db/schema'
import { payloadBytes, perfLog, perfMs, perfNow } from '$lib/server/perf'
import { inArray } from 'drizzle-orm'

function serializeMessage(message: Awaited<ReturnType<typeof getMessagesInThread>>[number]) {
  return {
    id: message.id,
    uid: message.uid,
    messageId: message.messageId,
    subject: message.subject,
    from: message.from,
    to: message.to,
    preview: message.preview,
    textContent: message.textContent,
    htmlContent: message.htmlContent,
    flags: JSON.parse(message.flags) as string[],
    receivedAt: message.receivedAt?.toISOString() ?? null
  }
}

export const load: PageServerLoad = async ({ params }) => {
  const startedAt = perfNow()
  const mailboxPath = await resolveMailboxPath(params.mailbox)
  const messages = await getMessagesInThread(params.threadId, mailboxPath)

  if (messages.length === 0) {
    error(404, 'Thread not found')
  }

  // Mark all unread messages as read in the background
  for (const msg of messages) {
    const flags: string[] = JSON.parse(msg.flags)
    if (!flags.includes('\\Seen')) {
      void markMessageAsRead(msg)
    }
  }

  const messageIds = messages.map((m) => m.messageId)

  // Load attachment metadata for all messages in the thread
  const attachments =
    messageIds.length > 0
      ? await db
          .select({
            id: mailAttachment.id,
            messageId: mailAttachment.messageId,
            filename: mailAttachment.filename,
            contentType: mailAttachment.contentType,
            size: mailAttachment.size
          })
          .from(mailAttachment)
          .where(inArray(mailAttachment.messageId, messageIds))
      : []

  const mailboxRole = getMailboxRole(mailboxPath)

  const body = {
    threadId: params.threadId,
    messages: messages.map(serializeMessage),
    attachments,
    mailboxRole
  }

  perfLog('load.threadPage', {
    mailbox: mailboxPath,
    threadId: params.threadId,
    messages: body.messages.length,
    attachments: attachments.length,
    payloadBytes: payloadBytes(body),
    ms: perfMs(startedAt)
  })

  return body
}
