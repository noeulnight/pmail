ALTER TABLE `mail_message` ADD COLUMN `thread_key` text NOT NULL DEFAULT '';
--> statement-breakpoint
UPDATE `mail_message`
SET `thread_key` = COALESCE(NULLIF(`thread_id`, ''), `message_id`)
WHERE `thread_key` = '';
--> statement-breakpoint
CREATE INDEX `mail_message_thread_key_idx` ON `mail_message` (`thread_key`);
--> statement-breakpoint
CREATE TABLE `mail_thread_summary` (
	`mailbox` text NOT NULL,
	`thread_key` text NOT NULL,
	`representative_mailbox_entry_id` integer NOT NULL,
	`thread_count` integer NOT NULL,
	`latest_uid` integer NOT NULL,
	`latest_received_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mail_thread_summary_mailbox_thread_key_idx`
	ON `mail_thread_summary` (`mailbox`, `thread_key`);
--> statement-breakpoint
CREATE INDEX `mail_thread_summary_mailbox_latest_received_at_uid_idx`
	ON `mail_thread_summary` (`mailbox`, `latest_received_at`, `latest_uid`);
--> statement-breakpoint
WITH ranked AS (
	SELECT
		mmb.`mailbox` AS `mailbox`,
		m.`thread_key` AS `thread_key`,
		mmb.`id` AS `representative_mailbox_entry_id`,
		COUNT(*) OVER (PARTITION BY mmb.`mailbox`, m.`thread_key`) AS `thread_count`,
		mmb.`uid` AS `latest_uid`,
		mmb.`received_at` AS `latest_received_at`,
		ROW_NUMBER() OVER (
			PARTITION BY mmb.`mailbox`, m.`thread_key`
			ORDER BY mmb.`received_at` DESC, mmb.`uid` DESC
		) AS `row_num`
	FROM `mail_message_mailbox` mmb
	JOIN `mail_message` m ON mmb.`message_id` = m.`message_id`
)
INSERT INTO `mail_thread_summary` (
	`mailbox`,
	`thread_key`,
	`representative_mailbox_entry_id`,
	`thread_count`,
	`latest_uid`,
	`latest_received_at`
)
SELECT
	`mailbox`,
	`thread_key`,
	`representative_mailbox_entry_id`,
	`thread_count`,
	`latest_uid`,
	`latest_received_at`
FROM ranked
WHERE `row_num` = 1;
