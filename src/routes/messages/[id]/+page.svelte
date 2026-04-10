<script lang="ts">
	type SyncData = {
		mailbox: string;
		configured: boolean;
		skipped: boolean;
		fetchedCount: number;
		storedCount: number;
		lastSyncedAt: string | null;
		lastError: string | null;
		reason?: string;
	};

	type Message = {
		id: string;
		uid: number;
		subject: string | null;
		from: string | null;
		to: string | null;
		preview: string | null;
		htmlContent: string | null;
		textContent: string | null;
		flags: string[];
		receivedAt: string | null;
	};

	type Props = {
		data: {
			sync: SyncData;
			message: Message;
		};
	};

	let { data }: Props = $props();

	const sync = $derived(data.sync);
	const message = $derived(data.message);

	const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	function formatDateTime(value: string | null | undefined) {
		if (!value) return 'Never';
		return dateTimeFormatter.format(new Date(value));
	}

	function senderLabel(from: string | null | undefined) {
		if (!from) return 'Unknown sender';
		return from;
	}

	function recipientLabel(to: string | null | undefined) {
		if (!to) return 'Unknown recipient';
		return to;
	}

	function subjectLabel(subject: string | null | undefined) {
		if (!subject) return '(no subject)';
		return subject;
	}

	function previewLabel(
		preview: string | null | undefined,
		textContent: string | null | undefined
	) {
		return preview || textContent || 'No preview available.';
	}

	function isUnread(flags: string[] = []) {
		return !flags.includes('\\Seen');
	}
</script>

<svelte:head>
	<title>{subjectLabel(message.subject)} · Inbox</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
		<section
			class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/20"
		>
			<div class="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
				<div class="space-y-3">
					<div class="flex flex-wrap items-center gap-3">
						<p class="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">Mailbox</p>
						{#if !sync.configured}
							<span
								class="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300"
							>
								Configuration missing
							</span>
						{/if}
					</div>

					<div>
						<h1 class="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
							{sync.mailbox}
						</h1>
						<p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
							Last synced {formatDateTime(sync.lastSyncedAt)}
							{#if sync.reason}
								<span class="text-slate-500">· {sync.reason}</span>
							{/if}
						</p>
					</div>

					{#if sync.lastError}
						<div
							class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
						>
							<p class="font-medium text-rose-100">Sync error</p>
							<p class="mt-1 break-words text-rose-200/90">{sync.lastError}</p>
						</div>
					{/if}
				</div>

				<div class="grid min-w-full grid-cols-2 gap-3 sm:min-w-80">
					<div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<p class="text-xs tracking-wide text-slate-500 uppercase">Fetched</p>
						<p class="mt-2 text-2xl font-semibold text-white">{sync.fetchedCount}</p>
					</div>
					<div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<p class="text-xs tracking-wide text-slate-500 uppercase">Stored</p>
						<p class="mt-2 text-2xl font-semibold text-white">{sync.storedCount}</p>
					</div>
					<div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<p class="text-xs tracking-wide text-slate-500 uppercase">Status</p>
						<p class="mt-2 text-sm font-medium text-slate-200">
							{#if sync.skipped}
								Skipped
							{:else}
								Synced
							{/if}
						</p>
					</div>
					<div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<p class="text-xs tracking-wide text-slate-500 uppercase">Message</p>
						<p class="mt-2 text-sm font-medium text-slate-200">
							{#if isUnread(message.flags)}
								Unread
							{:else}
								Read
							{/if}
						</p>
					</div>
				</div>
			</div>
		</section>

		<div>
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-sky-300 transition-colors hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:outline-none"
			>
				<span aria-hidden="true">←</span>
				<span>Back to inbox</span>
			</a>
		</div>

		<section class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
			<div class="border-b border-slate-800 px-5 py-4 sm:px-6">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2">
							<h2 class="text-lg font-semibold text-white">{subjectLabel(message.subject)}</h2>
							{#if isUnread(message.flags)}
								<span
									class="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sky-300 uppercase"
								>
									New
								</span>
							{/if}
						</div>
						<p class="mt-1 text-sm text-slate-400">Full message details</p>
					</div>
					<p class="text-sm text-slate-500">Received {formatDateTime(message.receivedAt)}</p>
				</div>
			</div>

			<div class="space-y-6 px-5 py-5 sm:px-6">
				<dl class="grid gap-4 sm:grid-cols-2">
					<div>
						<dt class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">From</dt>
						<dd class="mt-1 text-sm leading-6 text-slate-200">{senderLabel(message.from)}</dd>
					</div>
					<div>
						<dt class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">To</dt>
						<dd class="mt-1 text-sm leading-6 text-slate-200">{recipientLabel(message.to)}</dd>
					</div>
					<div class="sm:col-span-2">
						<dt class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Preview</dt>
						<dd class="mt-1 text-sm leading-6 text-slate-300">
							{previewLabel(message.preview, message.textContent)}
						</dd>
					</div>
					<div class="sm:col-span-2">
						<dt class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Body</dt>
						<dd class="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50 p-4">
							{#if message.htmlContent}
								<iframe
									title={`Email body for ${subjectLabel(message.subject)}`}
									sandbox=""
									srcdoc={message.htmlContent}
									class="block min-h-96 w-full rounded-lg border border-slate-800 bg-white"
								></iframe>
							{:else}
								<pre
									class="font-sans text-sm leading-6 break-words whitespace-pre-wrap text-slate-200">{message.textContent ||
										'No message body available.'}</pre>
							{/if}
						</dd>
					</div>
				</dl>
			</div>
		</section>
	</div>
</div>
