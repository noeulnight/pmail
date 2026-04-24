import type { LayoutServerLoad } from './$types'
import { getImapMailboxes } from '$lib/server/mail'

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    imapMailboxes: await getImapMailboxes({ waitForCache: true }),
    user: locals.user ?? null
  }
}
