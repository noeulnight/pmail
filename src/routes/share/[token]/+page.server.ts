import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getMessageByShareToken } from '$lib/server/mail'

export const load: PageServerLoad = async ({ params }) => {
  const message = await getMessageByShareToken(params.token)

  if (!message) {
    error(404, 'Shared message not found or link is invalid')
  }

  return {
    subject: message.subject,
    from: message.from,
    to: message.to,
    preview: message.preview,
    textContent: message.textContent,
    htmlContent: message.htmlContent,
    receivedAt: message.receivedAt?.toISOString() ?? null
  }
}
