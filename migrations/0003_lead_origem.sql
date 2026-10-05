ALTER TABLE leads ADD COLUMN origem TEXT;
ALTER TABLE leads ADD COLUMN parceiro TEXT;
UPDATE leads SET origem = 'ebook' WHERE mensagem = 'Origem: formulário do e-book Guia de doações';
CREATE INDEX IF NOT EXISTS idx_leads_parceiro ON leads (parceiro, criado_em DESC);
