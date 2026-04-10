import { ImapFlow } from 'imapflow';

type MailConfig = {
	host: string;
	port: number;
	secure: boolean;
	user: string;
	password: string;
};

type MarkReadJob = {
	type: 'mark_read';
	uid: number;
	mailbox: string;
};

type ImapJob = MarkReadJob;

const queue: ImapJob[] = [];
let workerRunning = false;
let configResolver: (() => MailConfig | null) | null = null;

export function registerImapConfig(resolver: () => MailConfig | null) {
	configResolver = resolver;
}

export function enqueueMarkRead(uid: number, mailbox: string) {
	if (queue.some((j) => j.type === 'mark_read' && j.uid === uid && j.mailbox === mailbox)) return;
	queue.push({ type: 'mark_read', uid, mailbox });
	startWorker();
}

function startWorker() {
	if (workerRunning) return;
	workerRunning = true;
	void runWorker();
}

async function runWorker() {
	try {
		while (queue.length > 0) {
			await flushQueue();
		}
	} finally {
		workerRunning = false;
	}
}

async function flushQueue() {
	const config = configResolver?.();
	if (!config) {
		queue.length = 0;
		return;
	}

	// Drain all current jobs
	const batch = queue.splice(0, queue.length);

	// Group by mailbox so we open one connection per mailbox
	const byMailbox = new Map<string, number[]>();
	for (const job of batch) {
		if (job.type === 'mark_read') {
			const uids = byMailbox.get(job.mailbox) ?? [];
			uids.push(job.uid);
			byMailbox.set(job.mailbox, uids);
		}
	}

	for (const [mailbox, uids] of byMailbox) {
		await runMarkRead(config, mailbox, uids);
	}
}

async function runMarkRead(config: MailConfig, mailbox: string, uids: number[]) {
	const client = new ImapFlow({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: { user: config.user, pass: config.password },
		logger: false
	});

	try {
		await client.connect();
		const lock = await client.getMailboxLock(mailbox);
		try {
			// Send all UIDs in one STORE command
			const uidSet = uids.join(',');
			await client.messageFlagsAdd(uidSet, ['\\Seen'], { uid: true });
		} finally {
			lock.release();
			await client.logout();
		}
	} catch {
		// Jobs are dropped on failure; the DB was already updated optimistically
	}
}
