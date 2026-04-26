ALTER TABLE `mail_message_mailbox` ADD COLUMN `received_at` integer;
--> statement-breakpoint

UPDATE `mail_message_mailbox`
SET `received_at` = (
  SELECT `received_at`
  FROM `mail_message`
  WHERE `mail_message`.`message_id` = `mail_message_mailbox`.`message_id`
)
WHERE `received_at` IS NULL;
--> statement-breakpoint

CREATE INDEX `mail_message_mailbox_mailbox_received_at_uid_idx`
  ON `mail_message_mailbox` (`mailbox`, `received_at`, `uid`);
