-- Auditoría: quién hizo cada cambio y cuándo
alter table public.clientes add column if not exists updated_by text;
alter table public.clientes add column if not exists updated_at timestamptz default now();

alter table public.equipo add column if not exists updated_by text;
alter table public.equipo add column if not exists updated_at timestamptz default now();

-- Tabla de log de actividad
create table if not exists public.activity_log (
  id bigserial primary key,
  user_email text not null,
  action text not null,        -- 'update_cliente' | 'update_equipo' | 'create_cliente' etc.
  entity_id text,
  entity_name text,
  detail text,
  created_at timestamptz default now()
);

alter table public.activity_log enable row level security;
create policy "allow all" on public.activity_log for all using (true) with check (true);
