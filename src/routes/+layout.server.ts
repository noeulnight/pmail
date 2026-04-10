import type { LayoutServerLoad } from './$types';
import { listImapMailboxes, startMailboxSync } from '$lib/server/mail';

export const load: LayoutServerLoad = () => {
	startMailboxSync();
	return { imapMailboxes: listImapMailboxes() };
};
