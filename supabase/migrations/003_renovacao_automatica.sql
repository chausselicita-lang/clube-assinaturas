-- =============================================
-- RENOVAÇÃO AUTOMÁTICA DE ASSINATURAS
-- =============================================
-- Problema: proxima_cobranca/data_renovacao eram gravadas na criação da
-- assinatura mas nada resetava os créditos nem avançava essas datas quando
-- o período vencia — o lojista tinha que fazer isso manualmente pra cada
-- cliente todo mês.
--
-- Esta função roda 1x/dia (pg_cron) e, para toda assinatura 'ativa' cuja
-- proxima_cobranca já passou:
--   1. reseta os créditos disponíveis para o total do plano
--   2. avança data_renovacao/proxima_cobranca pelo período da assinatura
--   3. cria um registro em `pagamentos` (status 'pendente') representando
--      a cobrança do novo ciclo — hoje isso fica pendente de baixa manual;
--      quando o gateway de pagamento (Asaas) for ativado, o webhook de
--      pagamento confirmado é quem deve marcar esse registro como 'pago'.
--
-- IMPORTANTE: esta renovação é apenas por calendário — não valida se o
-- ciclo anterior foi realmente pago. Enquanto não há gateway integrado,
-- é o mesmo modelo manual que já existia (o lojista cobra por fora).
-- Quando o Asaas estiver ativo, o ideal é condicionar a renovação à
-- confirmação de pagamento em vez de rodar puramente por data.

create extension if not exists pg_cron with schema extensions;

create or replace function renovar_assinaturas_vencidas()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  proximo_intervalo interval;
begin
  for r in
    select a.*, p.creditos_mensais
    from assinaturas a
    join planos p on p.id = a.plano_id
    where a.status = 'ativa'
      and a.proxima_cobranca <= current_date
  loop
    proximo_intervalo := case r.periodicidade
      when 'mensal' then interval '1 month'
      when 'semestral' then interval '6 months'
      when 'anual' then interval '1 year'
      else interval '1 month'
    end;

    update assinaturas
    set
      creditos_disponiveis = r.creditos_mensais,
      creditos_totais = r.creditos_mensais,
      data_renovacao = (r.data_renovacao + proximo_intervalo)::date,
      proxima_cobranca = (r.proxima_cobranca + proximo_intervalo)::date,
      updated_at = now()
    where id = r.id;

    insert into pagamentos (empresa_id, assinatura_id, valor, metodo, status, data_vencimento)
    values (r.empresa_id, r.id, r.valor_pago, 'manual', 'pendente', (r.proxima_cobranca + proximo_intervalo)::date);
  end loop;
end;
$$;

select cron.schedule(
  'renovar-assinaturas-diario',
  '0 3 * * *',
  $$select renovar_assinaturas_vencidas()$$
);
