-- Migration 008: Add status column to bookings

alter table bookings add column if not exists status text default 'confirmed';
update bookings set status = 'confirmed' where status is null;
