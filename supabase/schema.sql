-- ============================================================
-- Clube+ Assinaturas — Schema completo (multi-tenant via RLS)
-- Executar no SQL Editor do Supabase do projeto fmkuihcpdsjmsukzjsqm
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TENANTS (empresas)
-- ------------------------------------------------------------
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nicho text not null default 'barbearia',
  logo_url text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- USUARIOS (vincula auth.users a um tenant)
-- ------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  email text not null,
  papel text not null default 'admin' check (papel in ('admin', 'gestor', 'profissional')),
  created_at timestamptz not null default now()
);

create index if not exists idx_usuarios_tenant on usuarios(tenant_id);

-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  telefone text not null,
  whatsapp text,
  email text,
  nascimento date,
  cpf text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_clientes_tenant on clientes(tenant_id);
create index if not exists idx_clientes_telefone on clientes(tenant_id, telefone);

-- ------------------------------------------------------------
-- PLANOS
-- ------------------------------------------------------------
create table if not exists planos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  descricao text,
  periodicidade text not null check (periodicidade in ('mensal', 'semestral', 'anual')),
  valor numeric(10,2) not null,
  creditos integer not null default 0,
  beneficios text[] not null default '{}',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_planos_tenant on planos(tenant_id);

-- ------------------------------------------------------------
-- ASSINATURAS
-- ------------------------------------------------------------
create table if not exists assinaturas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  plano_id uuid not null references planos(id) on delete restrict,
  status text not null default 'ativa' check (status in ('ativa', 'suspensa', 'cancelada', 'inadimplente')),
  creditos_disponiveis integer not null default 0,
  data_inicio date not null default current_date,
  proxima_cobranca date,
  forma_pagamento text,
  created_at timestamptz not null default now()
);

create index if not exists idx_assinaturas_tenant on assinaturas(tenant_id);
create index if not exists idx_assinaturas_cliente on assinaturas(cliente_id);
create index if not exists idx_assinaturas_status on assinaturas(tenant_id, status);

-- ------------------------------------------------------------
-- PROFISSIONAIS
-- ------------------------------------------------------------
create table if not exists profissionais (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  especialidade text,
  telefone text,
  percentual_comissao numeric(5,2) not null default 0,
  foto_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_profissionais_tenant on profissionais(tenant_id);

-- ------------------------------------------------------------
-- SERVICOS
-- ------------------------------------------------------------
create table if not exists servicos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nome text not null,
  valor_interno numeric(10,2) not null default 0,
  percentual_comissao numeric(5,2) not null default 0,
  creditos_necessarios integer not null default 1,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_servicos_tenant on servicos(tenant_id);

-- ------------------------------------------------------------
-- ATENDIMENTOS (check-in)
-- ------------------------------------------------------------
create table if not exists atendimentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  assinatura_id uuid not null references assinaturas(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  profissional_id uuid not null references profissionais(id) on delete restrict,
  servico_id uuid not null references servicos(id) on delete restrict,
  creditos_debitados integer not null default 1,
  valor_comissao numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_atendimentos_tenant on atendimentos(tenant_id);
create index if not exists idx_atendimentos_profissional on atendimentos(profissional_id);
create index if not exists idx_atendimentos_created on atendimentos(tenant_id, created_at);

-- ------------------------------------------------------------
-- COMISSOES (fechamento mensal por profissional)
-- ------------------------------------------------------------
create table if not exists comissoes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  profissional_id uuid not null references profissionais(id) on delete cascade,
  competencia date not null,
  valor_total numeric(10,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  pago_em timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, profissional_id, competencia)
);

create index if not exists idx_comissoes_tenant on comissoes(tenant_id);
create index if not exists idx_comissoes_profissional on comissoes(profissional_id);

-- ------------------------------------------------------------
-- CHECKINS (registro de check-in do cliente)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- PAGAMENTOS_COMISSAO (registro de pagamentos de comissão por período)
-- ------------------------------------------------------------
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

-- ============================================================
-- FUNÇÃO AUXILIAR: tenant do usuário logado
-- ============================================================
create or replace function get_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from usuarios where id = auth.uid()
$$;

-- ============================================================
-- TRIGGER: injeta tenant_id automaticamente em inserts
-- ============================================================
create or replace function set_tenant_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.tenant_id is null then
    new.tenant_id := get_tenant_id();
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['clientes','planos','assinaturas','profissionais','servicos','atendimentos','comissoes','checkins','pagamentos_comissao']
  loop
    execute format(
      'drop trigger if exists trg_set_tenant_id on %I; create trigger trg_set_tenant_id before insert on %I for each row execute function set_tenant_id();',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- TRIGGER: cria registro em usuarios após signup
-- (espera que o app passe tenant_id e nome em raw_user_meta_data)
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into usuarios (id, tenant_id, nome, email, papel)
  values (
    new.id,
    (new.raw_user_meta_data->>'tenant_id')::uuid,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'papel', 'admin')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- RLS — habilitar e criar políticas multi-tenant
-- ============================================================
alter table tenants enable row level security;
alter table usuarios enable row level security;
alter table clientes enable row level security;
alter table planos enable row level security;
alter table assinaturas enable row level security;
alter table profissionais enable row level security;
alter table servicos enable row level security;
alter table atendimentos enable row level security;
alter table comissoes enable row level security;
alter table checkins enable row level security;
alter table pagamentos_comissao enable row level security;

create policy "tenants_select_own" on tenants
  for select using (id = get_tenant_id());

create policy "usuarios_select_own_tenant" on usuarios
  for select using (tenant_id = get_tenant_id());

do $$
declare
  t text;
begin
  foreach t in array array['clientes','planos','assinaturas','profissionais','servicos','atendimentos','comissoes','checkins','pagamentos_comissao']
  loop
    execute format('create policy "%I_select" on %I for select using (tenant_id = get_tenant_id());', t, t);
    execute format('create policy "%I_insert" on %I for insert with check (tenant_id = get_tenant_id() or tenant_id is null);', t, t);
    execute format('create policy "%I_update" on %I for update using (tenant_id = get_tenant_id());', t, t);
    execute format('create policy "%I_delete" on %I for delete using (tenant_id = get_tenant_id());', t, t);
  end loop;
end $$;
