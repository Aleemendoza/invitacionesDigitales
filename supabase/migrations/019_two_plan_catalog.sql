-- Consolidate the former Premium and Premium Plus tiers into Invitación + Invitados.
update public.events set plan = 'premium' where plan = 'premium_plus';
update public.event_payments set plan = 'premium' where plan = 'premium_plus';
update public.event_plan_upgrades set source_plan = 'premium' where source_plan = 'premium_plus';
update public.event_plan_upgrades set target_plan = 'premium' where target_plan = 'premium_plus';

alter table public.events drop constraint if exists events_plan_check;
alter table public.events add constraint events_plan_check check (plan in ('standard', 'premium'));

alter table public.event_payments drop constraint if exists event_payments_plan_check;
alter table public.event_payments add constraint event_payments_plan_check check (plan in ('standard', 'premium'));

alter table public.event_plan_upgrades drop constraint if exists event_plan_upgrades_source_plan_check;
alter table public.event_plan_upgrades add constraint event_plan_upgrades_source_plan_check check (source_plan in ('standard', 'premium'));

alter table public.event_plan_upgrades drop constraint if exists event_plan_upgrades_target_plan_check;
alter table public.event_plan_upgrades add constraint event_plan_upgrades_target_plan_check check (target_plan in ('standard', 'premium'));
