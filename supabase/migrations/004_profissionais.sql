-- ============================================================
-- Módulo Profissionais: especialidade + foto
-- Executar no SQL Editor do projeto fmkuihcpdsjmsukzjsqm
-- ============================================================

alter table profissionais add column if not exists especialidade text;
alter table profissionais add column if not exists foto_url text;
