-- Tabla clientes
create table if not exists public.clientes (
  id text primary key,
  nombre text not null,
  sector text,
  contacto text,
  email text,
  wa text,
  ingresos text,
  color text,
  fase text,
  score integer default 0,
  scores jsonb default '{}',
  contrato bigint default 0,
  pagado bigint default 0,
  inicio text,
  "tipoServicio" text,
  resumen text,
  notas text,
  contenido jsonb default '[]',
  pautas jsonb default '[]',
  entregables jsonb default '[]',
  alertas jsonb default '[]',
  created_at timestamptz default now()
);

alter table public.clientes enable row level security;
create policy "allow all" on public.clientes for all using (true) with check (true);

-- Tabla equipo
create table if not exists public.equipo (
  id text primary key,
  nombre text not null,
  rol text,
  especialidad text,
  email text,
  pago bigint default 0,
  "tipoPago" text,
  estado text default 'activo',
  clientes jsonb default '[]',
  color text,
  pagos jsonb default '[]',
  created_at timestamptz default now()
);

alter table public.equipo enable row level security;
create policy "allow all" on public.equipo for all using (true) with check (true);
