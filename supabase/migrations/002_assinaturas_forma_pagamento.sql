-- ============================================================
-- Adiciona forma de pagamento às assinaturas
-- Executar no SQL Editor do projeto fmkuihcpdsjmsukzjsqm
-- ============================================================

alter table assinaturas add column if not exists forma_pagamento text;
