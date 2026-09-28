-- UniAds Studio — esquema de encomendas de cartões impressos
-- Corre isto uma vez no SQL Editor do teu projeto Supabase.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'sent_to_print', 'failed', 'canceled')),

  -- dados do design (para reimpressão/consulta, não é a fonte de verdade do preço)
  template_id text not null,
  product_format text not null default 'card' check (product_format in ('card', 'flyer')),
  quantity integer not null,
  fields jsonb not null default '{}'::jsonb,

  -- ficheiro pronto para impressão: guardado como base64 na própria base de dados
  -- (mais simples que gerir um bucket de Storage à parte) e servido pelo endpoint
  -- /api/order-image?id=<id>. image_url guarda essa URL pública para a Gelato descarregar.
  image_data text,
  image_url text,

  -- morada de envio
  shipping_name text not null,
  shipping_address jsonb not null,
  contact_email text not null,

  -- preço cobrado (fonte de verdade: calculado no servidor, nunca confiar no cliente)
  amount_cents integer not null,
  currency text not null default 'eur',

  -- referências externas
  stripe_session_id text unique,
  gelato_order_id text,

  error_message text
);

create index if not exists orders_stripe_session_id_idx on orders (stripe_session_id);
create index if not exists orders_status_idx on orders (status);

-- Migrações para quem já tinha a tabela criada antes destas colunas existirem:
-- alter table orders add column if not exists image_data text;
-- alter table orders add column if not exists product_format text not null default 'card'
--   check (product_format in ('card', 'flyer'));
