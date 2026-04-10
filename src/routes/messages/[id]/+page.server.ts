import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getStoredMessageById, syncMailboxIfDue } from '$lib/server/mail';

function serializeMessage(message: NonNullable<Awaited<ReturnType<typeof getStoredMessageById>>>) {
	return {
		id: message.id,
		uid: message.uid,
		subject: message.subject,
		from: message.from,
		to: message.to,
		preview: message.preview,
		textContent: message.textContent,
		htmlContent: message.htmlContent,
		flags: JSON.parse(message.flags) as string[],
		receivedAt: message.receivedAt?.toISOString() ?? null
	};
}

export const load: PageServerLoad = async ({ params }) => {
	const sync = await syncMailboxIfDue();
	const message = await getStoredMessageById(params.id);

	if (!message) {
		error(404, 'Message not found');
	}

	return {
		sync,
		message: serializeMessage(message)
	};
};
