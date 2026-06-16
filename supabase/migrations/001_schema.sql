-- =============================================
-- CLUBE+ ASSINATURAS — SCHEMA COMPLETO
-- =============================================

-- Empresas (tenants)
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  logo_url text,
  plano_saas text not null default 'trial',
  config jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Usuários vinculados ao Supabase Auth
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references empresas(id) on delete cascade,
  nome text not null,
  email text not null,
  role text not null default 'admin' check (role in ('admin','manager','receptionist')),
  created_at timestamptz not null default now()
);

-- Clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  telefone text not null,
  whatsapp text,
  email text,
  data_nascimento date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Planos
create table if not exists planos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  valor_mensal numeric(10,2) not null default 0,
  valor_semestral numeric(10,2) not null default 0,
  valor_anual numeric(10,2) not null default 0,
  creditos_mensais integer not null default 1,
  servicos_permitidos text[] not null default '{}',
  beneficios text[] not null default '{}',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Profissionais
create table if not exists profissionais (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  funcao text not null,
  comissao_percentual numeric(5,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Serviços
create table if not exists servicos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  valor_interno numeric(10,2) not null default 0,
  comissao_percentual numeric(5,2) not null default 0,
  creditos_necessarios integer not null default 1,
  created_at timestamptz not null default now()
);

-- Assinaturas
create table if not exists assinaturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  plano_id uuid not null references planos(id),
  status text not null default 'ativa' check (status in ('ativa','suspensa','cancelada','inadimplente')),
  periodicidade text not null default 'mensal' check (periodicidade in ('mensal','semestral','anual')),
  data_inicio date not null,
  data_renovacao date not null,
  proxima_cobranca date not null,
  valor_pago numeric(10,2) not null default 0,
  creditos_disponiveis integer not null default 0,
  creditos_totais integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atendimentos
create table if not exists atendimentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  cliente_id uuid not null references clientes(id),
  assinatura_id uuid not null references assinaturas(id),
  profissional_id uuid not null references profissionais(id),
  servico_id uuid not null references servicos(id),
  creditos_consumidos integer not null default 1,
  valor_servico numeric(10,2) not null default 0,
  valor_comissao numeric(10,2) not null default 0,
  status text not null default 'concluido' check (status in ('pendente','concluido','cancelado')),
  created_at timestamptz not null default now()
);

-- Pagamentos (camada de abstração)
create table if not exists pagamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  assinatura_id uuid not null references assinaturas(id),
  valor numeric(10,2) not null,
  metodo text not null default 'manual' check (metodo in ('pix','cartao','boleto','manual')),
  status text not null default 'pendente' check (status in ('pendente','pago','falhou')),
  gateway text,
  gateway_id text,
  data_vencimento date not null,
  data_pagamento date,
  created_at timestamptz not null default now()
);

-- Comissões
create table if not exists comissoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  profissional_id uuid not null references profissionais(id),
  atendimento_id uuid not null references atendimentos(id),
  valor numeric(10,2) not null,
  periodo_mes integer not null,
  periodo_ano integer not null,
  status text not null default 'pendente' check (status in ('pendente','pago')),
  created_at timestamptz not null default now()
);

-- Fechamentos mensais
create table if not exists fechamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  profissional_id uuid not null references profissionais(id),
  mes integer not null,
  ano integer not null,
  total_comissao numeric(10,2) not null default 0,
  total_atendimentos integer not null default 0,
  status text not null default 'aberto' check (status in ('aberto','fechado')),
  created_at timestamptz not null default now(),
  unique(profissional_id, mes, ano)
);

-- Índices
create index if not exists idx_clientes_empresa on clientes(empresa_id);
create index if not exists idx_clientes_telefone on clientes(telefone);
create index if not exists idx_assinaturas_cliente on assinaturas(cliente_id);
create index if not exists idx_assinaturas_status on assinaturas(status);
create index if not exists idx_atendimentos_empresa on atendimentos(empresa_id);
create index if not exists idx_comissoes_periodo on comissoes(periodo_mes, periodo_ano);
create index if not exists idx_comissoes_profissional on comissoes(profissional_id);
