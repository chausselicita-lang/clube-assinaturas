-- =============================================
-- BUG CRÍTICO: vazamento entre tenants no cadastro
-- =============================================
-- handle_new_user() pegava "a última empresa criada" no banco INTEIRO pra
-- vincular o usuário que estava se cadastrando — não a empresa que ele
-- próprio informou no formulário. Efeito prático: o segundo cliente a
-- criar conta no SaaS era vinculado (e passava a enxergar/gravar) nos
-- dados da PRIMEIRA barbearia cadastrada; se fosse o primeiro cadastro de
-- todos, ficava com empresa_id nulo e travado pra sempre (RLS nunca libera
-- nada pra empresa_id null). Além disso, o insert em `empresas` feito
-- direto pelo client (register/page.tsx) já era bloqueado pela própria RLS
-- (usuário recém-criado ainda não tem get_empresa_id()).
--
-- Fix: cria a empresa E vincula o usuário no mesmo trigger, atomicamente,
-- usando os metadados (nome/empresa_nome) já enviados em
-- supabase.auth.signUp({ options: { data } }). Elimina a necessidade do
-- client inserir em `empresas` depois — cada cadastro sempre cria a SUA
-- PRÓPRIA empresa nova, nunca reaproveita uma existente.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nova_empresa_id uuid;
  empresa_nome text := coalesce(nullif(trim(new.raw_user_meta_data->>'empresa_nome'), ''), 'Minha Empresa');
begin
  insert into empresas (nome, plano_saas, config)
  values (empresa_nome, 'trial', '{}')
  returning id into nova_empresa_id;

  insert into usuarios (id, empresa_id, nome, email, role)
  values (
    new.id,
    nova_empresa_id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    'admin'
  );
  return new;
end;
$$;
