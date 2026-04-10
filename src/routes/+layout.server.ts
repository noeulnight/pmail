import type { LayoutServerLoad } from './$types';
import { listImapMailboxes, startMailboxSync } from '$lib/server/mail';

export const load: LayoutServerLoad = async () => {
	startMailboxSync();
	const imapMailboxes = await listImapMailboxes();
	return { imapMailboxes };
};
