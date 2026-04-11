import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getSyncSummary } from '$lib/server/mail'

export const GET: RequestHandler = async () => {
  const summary = await getSyncSummary()
  return json(summary)
}
