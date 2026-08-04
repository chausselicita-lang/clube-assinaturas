-- =============================================
-- SUPER ADMIN — visão de rede sobre todos os tenants
-- =============================================
-- O Clube+ é uma plataforma que várias barbearias/salões assinam como
-- clientes do SOFTWARE — cada uma é um tenant isolado (empresa_id + RLS),
-- sem cliente final compartilhado entre elas. O que faltava era um papel
-- capaz de enxergar/gerenciar todos os tenants de cima, sem furar o
-- isolamento das operações do dia a dia de cada loja.

alter table usuarios drop constraint if exists usuarios_role_check;
alter table usuarios add constraint usuarios_role_check
  check (role in ('admin','manager','receptionist','super_admin'));

alter table empresas add column if not exists status text not null default 'ativo'
  check (status in ('ativo','bloqueado'));

-- security definer pra evitar recursão de RLS (usuarios já tem RLS própria;
-- uma policy que consultasse `usuarios` diretamente entraria em loop).
create or replace function is_super_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from usuarios where id = auth.uid() and role = 'super_admin')
$$;

-- super_admin enxerga e atualiza (bloquear/reativar) todas as empresas.
-- Não damos acesso amplo às tabelas operacionais (clientes, assinaturas
-- etc.) via RLS — KPIs agregados são lidos por rota de servidor com
-- service_role, e qualquer ação dentro de um tenant específico passa por
-- "acessar como" (sessão real do admin daquele tenant), nunca por bypass
-- direto de RLS. Superfície de acesso cross-tenant fica pequena e auditável.
create policy "empresas_super_admin" on empresas
  for select using (is_super_admin());
create policy "empresas_super_admin_update" on empresas
  for update using (is_super_admin());
