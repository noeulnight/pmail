CREATE TABLE `mail_share` (
  `token` text PRIMARY KEY NOT NULL,
  `message_id` text NOT NULL,
  `created_at` integer NOT NULL
);
