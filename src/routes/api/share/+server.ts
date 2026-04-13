import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createShareToken } from '$lib/server/mail'

export const POST: RequestHandler = async ({ request, url }) => {
  const body = await request.json().catch(() => null)
  const id = body?.id

  if (!id || typeof id !== 'number') {
    error(400, 'Missing message id')
  }

  const token = await createShareToken(id)
  if (!token) error(404, 'Message not found')

  const shareUrl = `${url.origin}/share/${token}`
  return json({ url: shareUrl })
}
