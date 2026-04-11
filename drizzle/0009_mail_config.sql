CREATE TABLE `mail_config` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`imap_host` text,
	`imap_port` integer,
	`imap_secure` integer,
	`imap_user` text,
	`imap_password` text,
	`imap_mailbox` text,
	`imap_poll_seconds` integer,
	`smtp_host` text,
	`smtp_port` integer,
	`smtp_secure` integer,
	`smtp_user` text,
	`smtp_password` text,
	`smtp_from` text,
	`updated_at` integer
);
