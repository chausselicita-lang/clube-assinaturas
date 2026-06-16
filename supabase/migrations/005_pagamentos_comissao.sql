-- ============================================================
-- Módulo Comissões: pagamentos_comissao
-- Executar no SQL Editor do projeto fmkuihcpdsjmsukzjsqm
-- ============================================================

create table if not exists pagamentos_comissao (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profissional_id uuid not null references profissionais(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null,
  total_atendimentos integer not null default 0,
  valor_total numeric(10,2) not null default 0,
  valor_comissao numeric(10,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'parcial')),
  data_pagamento timestamptz,
  observacao text,
  created_at timestamptz not null default now(),
  unique (tenant_id, profissional_id, periodo_inicio, periodo_fim)
);

create index if not exists idx_pagamentos_comissao_tenant on pagamentos_comissao(tenant_id);
create index if not exists idx_pagamentos_comissao_profissional on pagamentos_comissao(profissional_id);

drop trigger if exists trg_set_tenant_id on pagamentos_comissao;
create trigger trg_set_tenant_id before insert on pagamentos_comissao
  for each row execute function set_tenant_id();

alter table pagamentos_comissao enable row level security;

create policy "pagamentos_comissao_select" on pagamentos_comissao for select using (tenant_id = get_tenant_id());
create policy "pagamentos_comissao_insert" on pagamentos_comissao for insert with check (tenant_id = get_tenant_id() or tenant_id is null);
create policy "pagamentos_comissao_update" on pagamentos_comissao for update using (tenant_id = get_tenant_id());
create policy "pagamentos_comissao_delete" on pagamentos_comissao for delete using (tenant_id = get_tenant_id());
