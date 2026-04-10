import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

export async function POST({ request }) {
	const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'];
	const missing = required.filter((k) => !env[k]);
	if (missing.length) {
		return error(500, `Missing SMTP config: ${missing.join(', ')}`);
	}

	const { to, cc, bcc, subject, html, inReplyTo } = await request.json();
	if (!to || !subject) {
		return error(400, 'Missing required fields: to, subject');
	}

	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT ?? 587),
		secure: env.SMTP_SECURE === 'true',
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASSWORD
		}
	});

	try {
		await transporter.sendMail({
			from: env.SMTP_FROM || env.SMTP_USER,
			to,
			cc: cc || undefined,
			bcc: bcc || undefined,
			subject,
			html,
			inReplyTo: inReplyTo || undefined
		});
		return json({ success: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return error(500, `Failed to send: ${message}`);
	}
}
