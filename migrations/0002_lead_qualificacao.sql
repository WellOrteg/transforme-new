-- O formulário do roteiro do cliente qualifica o lead: além de nome, e-mail e
-- organização, ele coleta o WhatsApp e o principal desafio da organização.
--
-- `mensagem` continua na tabela, aceitando nulo. Ela guarda os leads recebidos
-- antes desta mudança e não deve ser removida.
ALTER TABLE leads ADD COLUMN whatsapp TEXT;
ALTER TABLE leads ADD COLUMN desafio TEXT;
