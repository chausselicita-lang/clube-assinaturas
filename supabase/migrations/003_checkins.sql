-- ============================================================
-- Módulo Check-in: tabela checkins + CPF do cliente
-- Executar no SQL Editor do projeto fmkuihcpdsjmsukzjsqm
-- ============================================================

alter table clientes add column if not exists cpf text;

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  assinatura_id uuid not null references assinaturas(id) on delete cascade,
  profissional_id uuid references profissionais(id) on delete set null,
  creditos_antes integer not null,
  creditos_depois integer not null,
  data_hora timestamptz not null default now(),
  observacao text,
  created_at timestamptz not null default now()
);

create index if not exists idx_checkins_tenant on checkins(tenant_id);
create index if not exists idx_checkins_cliente on checkins(cliente_id);
create index if not exists idx_checkins_data on checkins(tenant_id, data_hora);

drop trigger if exists trg_set_tenant_id on checkins;
create trigger trg_set_tenant_id before insert on checkins
  for each row execute function set_tenant_id();

alter table checkins enable row level security;

create policy "checkins_select" on checkins for select using (tenant_id = get_tenant_id());
create policy "checkins_insert" on checkins for insert with check (tenant_id = get_tenant_id() or tenant_id is null);
create policy "checkins_update" on checkins for update using (tenant_id = get_tenant_id());
create policy "checkins_delete" on checkins for delete using (tenant_id = get_tenant_id());
