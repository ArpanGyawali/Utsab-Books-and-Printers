-- 0005_inquiry_notified_at — timestamp for the waiting-list notify flow.
--
-- Set when the owner taps "Notify" (or "Notify again"). Notified rows sink to
-- the bottom of the admin waiting list and are purged 5 days after their last
-- notification — opportunistically on waiting-page load, no cron needed.

alter table inquiries add column notified_at timestamptz;

-- Rows notified before this column existed age out 5 days from now.
update inquiries set notified_at = now() where notified and notified_at is null;
