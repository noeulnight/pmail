import type { LayoutServerLoad } from './$types';
import { listImapMailboxes, startMailboxSync } from '$lib/server/mail';

export const load: LayoutServerLoad = async ({ locals }) => {
	void startMailboxSync();
	return {
		imapMailboxes: listImapMailboxes(),
		user: locals.user ?? null
	};
};
