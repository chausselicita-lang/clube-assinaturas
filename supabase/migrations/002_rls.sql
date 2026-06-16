-- =============================================
-- ROW LEVEL SECURITY — ISOLAMENTO MULTI-TENANT
-- =============================================

-- Habilitar RLS em todas as tabelas
alter table empresas enable row level security;
alter table usuarios enable row level security;
alter table clientes enable row level security;
alter table planos enable row level security;
alter table profissionais enable row level security;
alter table servicos enable row level security;
alter table assinaturas enable row level security;
alter table atendimentos enable row level security;
alter table pagamentos enable row level security;
alter table comissoes enable row level security;
alter table fechamentos enable row level security;

-- Função helper: retorna empresa_id do usuário logado
create or replace function get_empresa_id()
returns uuid language sql stable
as $$
  select empresa_id from usuarios where id = auth.uid()
$$;

-- Políticas: usuário só vê dados da sua empresa
create policy "usuarios_empresa" on usuarios using (id = auth.uid());
create policy "empresas_propria" on empresas using (id = get_empresa_id());
create policy "clientes_empresa" on clientes using (empresa_id = get_empresa_id());
create policy "planos_empresa" on planos using (empresa_id = get_empresa_id());
create policy "profissionais_empresa" on profissionais using (empresa_id = get_empresa_id());
create policy "servicos_empresa" on servicos using (empresa_id = get_empresa_id());
create policy "assinaturas_empresa" on assinaturas using (empresa_id = get_empresa_id());
create policy "atendimentos_empresa" on atendimentos using (empresa_id = get_empresa_id());
create policy "pagamentos_empresa" on pagamentos using (empresa_id = get_empresa_id());
create policy "comissoes_empresa" on comissoes using (empresa_id = get_empresa_id());
create policy "fechamentos_empresa" on fechamentos using (empresa_id = get_empresa_id());

-- Políticas INSERT: herda empresa_id automaticamente via trigger
create or replace function set_empresa_id()
returns trigger language plpgsql
as $$
begin
  new.empresa_id := get_empresa_id();
  return new;
end;
$$;

create trigger t_clientes_empresa before insert on clientes for each row execute function set_empresa_id();
create trigger t_planos_empresa before insert on planos for each row execute function set_empresa_id();
create trigger t_profissionais_empresa before insert on profissionais for each row execute function set_empresa_id();
create trigger t_servicos_empresa before insert on servicos for each row execute function set_empresa_id();
create trigger t_assinaturas_empresa before insert on assinaturas for each row execute function set_empresa_id();
create trigger t_atendimentos_empresa before insert on atendimentos for each row execute function set_empresa_id();
create trigger t_pagamentos_empresa before insert on pagamentos for each row execute function set_empresa_id();
create trigger t_comissoes_empresa before insert on comissoes for each row execute function set_empresa_id();
create trigger t_fechamentos_empresa before insert on fechamentos for each row execute function set_empresa_id();

-- Trigger: criar usuário na tabela usuarios após signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer
as $$
declare
  empresa_id uuid;
begin
  -- Pega a empresa criada mais recentemente (criada junto no register)
  select id into empresa_id from empresas order by created_at desc limit 1;

  insert into usuarios (id, empresa_id, nome, email, role)
  values (
    new.id,
    empresa_id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    'admin'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
