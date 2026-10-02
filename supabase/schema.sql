-- UniAds Studio — esquema de encomendas de cartões impressos
-- Corre isto uma vez no SQL Editor do teu projeto Supabase.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 'delivered': pedido 100% digital (convite-digital), entregue por e-mail, sem
  -- passar pela Gelato nem precisar de morada de envio.
  -- 'manual_pending': pedido com produto físico preparado à mão (ex: chip NFC),
  -- pago mas ainda por gravar/enviar manualmente pelo dono do site.
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'sent_to_print', 'delivered', 'manual_pending', 'failed', 'canceled')),

  -- dados do design (para reimpressão/consulta, não é a fonte de verdade do preço)
  template_id text not null,
  product_format text not null default 'card'
    check (product_format in ('card', 'flyer', 'convite', 'convite-digital', 'nfc')),
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

  -- número total de itens do carrinho neste pedido (1 para pedidos antigos/simples).
  -- os itens em si (um design/formato/quantidade cada) vivem em order_items.
  item_count integer not null default 1,

  -- código de desconto Stripe (Promotion Code) gerado para este cliente depois do
  -- pagamento, para ele partilhar com amigos (ver lib/referral.js).
  referral_code text,

  -- rastreio do envio (preenchido pelo webhook da Gelato quando o pedido é expedido —
  -- espelha o item principal; cada item tem o seu próprio rastreio em order_items).
  tracking_code text,
  tracking_url text,
  carrier_name text,

  -- true depois de já termos enviado o e-mail de "ainda tens itens no carrinho"
  -- (checkout.session.expired) — evita reenviar em cada expiração seguinte da mesma
  -- encomenda, mesmo que uma nova sessão de pagamento seja gerada automaticamente.
  abandoned_email_sent boolean not null default false,

  error_message text
);

create index if not exists orders_stripe_session_id_idx on orders (stripe_session_id);
create index if not exists orders_status_idx on orders (status);

-- Migrações para quem já tinha a tabela criada antes destas colunas existirem:
-- alter table orders add column if not exists image_data text;
-- alter table orders add column if not exists product_format text not null default 'card'
--   check (product_format in ('card', 'flyer'));
-- alter table orders add column if not exists item_count integer not null default 1;
-- alter table orders add column if not exists referral_code text;

-- Migração para quem já tinha a tabela orders antes dos formatos "convite" /
-- "convite-digital" / "nfc" e dos estados "delivered" / "manual_pending" existirem
-- (widening dos checks) — corre sempre a versão mais recente destes dois blocos:
-- alter table orders drop constraint if exists orders_product_format_check;
-- alter table orders add constraint orders_product_format_check
--   check (product_format in ('card', 'flyer', 'convite', 'convite-digital', 'nfc'));
-- alter table orders drop constraint if exists orders_status_check;
-- alter table orders add constraint orders_status_check
--   check (status in ('pending_payment', 'paid', 'sent_to_print', 'delivered', 'manual_pending', 'failed', 'canceled'));
-- alter table order_items drop constraint if exists order_items_product_format_check;
-- alter table order_items add constraint order_items_product_format_check
--   check (product_format in ('card', 'flyer', 'convite', 'convite-digital', 'nfc'));

-- Migração para quem já tinha a tabela orders antes do rastreio de envio e do
-- carrinho abandonado existirem:
-- alter table orders add column if not exists tracking_code text;
-- alter table orders add column if not exists tracking_url text;
-- alter table orders add column if not exists carrier_name text;
-- alter table orders add column if not exists abandoned_email_sent boolean not null default false;
-- alter table order_items add column if not exists tracking_code text;
-- alter table order_items add column if not exists tracking_url text;
-- alter table order_items add column if not exists carrier_name text;

-- Itens individuais de um pedido (carrinho com vários designs/formatos numa só compra).
-- A primeira linha de order_items de cada pedido espelha os campos "planos" que já
-- existiam em orders (template_id, product_format, quantity, image_data) — por isso
-- código antigo que só lê a tabela orders continua a funcionar sem alterações.
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  created_at timestamptz not null default now(),

  template_id text not null,
  product_format text not null default 'card'
    check (product_format in ('card', 'flyer', 'convite', 'convite-digital', 'nfc')),
  quantity integer not null,
  fields jsonb not null default '{}'::jsonb,

  -- nulo para formatos sem arte impressa (ex: "nfc" — ver needsImage() em lib/formats.js)
  image_data text,
  image_url text,

  amount_cents integer not null,

  gelato_order_id text,
  tracking_code text,
  tracking_url text,
  carrier_name text,
  error_message text
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- Registo de cada vez que o Cartão Digital de um pedido é aberto (tocar num chip NFC ou
-- ler um QR code) — ver api/digital-card.js. país/cidade vêm dos cabeçalhos de geo-IP da
-- Vercel (grátis, sem nenhum serviço externo), por isso só existem em produção.
create table if not exists card_scans (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  country text,
  city text
);

create index if not exists card_scans_order_id_idx on card_scans (order_id);

-- Depoimentos de clientes, adicionados manualmente pelo dono do site em admin.html
-- (nunca gerados automaticamente — evita mostrar avaliações que não são reais).
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author_name text not null,
  company text,
  quote text not null,
  rating integer check (rating between 1 and 5),
  approved boolean not null default true
);

create index if not exists testimonials_approved_idx on testimonials (approved);
