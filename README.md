# UniAds Studio

Gerador de cartões de visita e artes publicitárias para múltiplos segmentos de negócio
(companhias aéreas, casamentos, restaurantes, imobiliárias, beleza, tecnologia, eventos,
saúde, automotivo, educação, moda e corporativo/advocacia). App estática (HTML/CSS/JS puro,
sem build), pensada para abrir direto no navegador ou publicar em GitHub Pages.

## Rodar localmente

```sh
python3 -m http.server 8080   # ou qualquer servidor estático
```

Abra `http://localhost:8080`. Não precisa de `npm install`: é HTML/CSS/JS puro.

## O que dá para fazer

- **14 segmentos, 28 modelos**: cada segmento (`Companhias Aéreas`, `Casamentos`,
  `Restaurantes & Gastronomia`, `Imobiliárias`, `Beleza & Estética`, `Tecnologia & Startups`,
  `Eventos & Festas`, `Saúde & Bem-estar`, `Automotivo`, `Educação`, `Moda`,
  `Corporativo & Advocacia`, `Pet Shops & Veterinária`, `Fitness & Academias`) traz 2 modelos
  com paleta, layout e ícone próprios.
- **7 formatos**: Cartão de Visita (frente/verso, mínimo de encomenda 5 unidades —
  5/10/20/50/100/250/500), Post Instagram, Story, Flyer A5, Convite (impresso, em tiragens
  pequenas — 5/10/20/50/100 unidades, ideal para casamentos e festas), Convite Digital
  (entregue só por e-mail, sem impressão nem morada) e Chip NFC (ver abaixo) — a mesma
  identidade visual do modelo se adapta a cada formato, e o campo "Endereço/Cidade" passa a
  mostrar a localização do evento na própria arte (post, story, flyer e convites).
- **Editor ao vivo**: nome, cargo, empresa, slogan, telefone, e-mail, site, rede social e
  endereço atualizam a pré-visualização em tempo real; logotipo por upload (substitui o ícone
  do segmento) e cores primária/secundária personalizáveis por cima da paleta do modelo.
- **Cartão Digital (QR + vCard)**: o verso do cartão de visita pode incluir um QR code (opção
  ligada por omissão) que, ao ser lido, guarda o contacto diretamente no telemóvel de quem
  recebe o cartão físico. Há também um botão "Ver Cartão Digital" com um QR maior e download
  direto do ficheiro `.vcf`, disponível para qualquer formato.
- **Chip NFC**: um chip físico (cartão, autocolante ou porta-chaves) gravado com o link do
  Cartão Digital do cliente — quem encostar o telemóvel ao chip vê logo os contactos (nome,
  WhatsApp, redes sociais, morada) e pode guardá-los com um toque, sem abrir câmara nem apps.
  É um produto **físico** (precisa de morada de envio) mas **não passa pela Gelato**: é
  preparado à mão pelo dono do site — ver a secção "Chip NFC" mais abaixo para o processo.
- **Exportar**: PNG em alta resolução ou **PDF no tamanho exato de impressão** (via
  `html2canvas` + `jsPDF`, carregados por CDN — precisam de internet), impressão direta do
  navegador, ou **partilhar** direto para outra app (Instagram, WhatsApp, etc.) via Web Share
  API do navegador — em navegadores/dispositivos sem suporte, cai automaticamente para download.
- **Meus Projetos**: salvar, editar, duplicar e excluir projetos — persistidos no
  `localStorage` do navegador (nada é enviado a um servidor).
- **Carrinho com vários itens**: dá para adicionar vários designs/formatos/quantidades ao
  carrinho (até 10 itens, físicos e/ou digitais) e pagar tudo numa única compra/envio. Se o
  carrinho for 100% digital (só "Convite Digital"), o checkout nem pede morada de envio.
- **Impressos físicos com cupão de desconto**: cada formato impresso tem preços e quantidades
  próprios; no checkout da Stripe o cliente pode inserir um código de desconto (cupões geridos
  no dashboard da Stripe, não no código).
- **Códigos de referência**: depois de um pedido pago, é gerado automaticamente um código de
  desconto Stripe único que o cliente pode partilhar com amigos (ver `REFERRAL_COUPON_ID`).
- **Consulta de encomendas** (`minhas-encomendas.html`): o cliente escreve o e-mail usado na
  compra e vê o estado de todos os pedidos que fez.
- **Painel de administração** (`admin.html`, protegido por palavra-passe): lista todas as
  encomendas (estado, formato, quantidade, nº de itens, valor, morada, e-mail) com paginação, e
  permite gerir depoimentos de clientes.
- **E-mail de confirmação automático**: quando o pedido é enviado para impressão, o cliente
  recebe um e-mail (via Resend) com o resumo da encomenda e o código de referência.
- **Rastreio de envio** (opcional): se configurares o webhook da Gelato, o cliente passa a ver
  um botão "📦 Rastrear encomenda" em `pedido-confirmado.html` e `minhas-encomendas.html` assim
  que a Gelato marcar o pedido como expedido.
- **Carrinho abandonado**: se alguém iniciar o checkout mas não pagar, a sessão da Stripe expira
  sozinha (24h) e envia-se automaticamente um e-mail de lembrete com um novo link de pagamento —
  sem precisar de nenhuma tarefa agendada (cron) nem endpoint novo.
- **Botão de WhatsApp**: um botão flutuante em todas as páginas de cliente, para quem preferir
  falar diretamente contigo em vez de usar o checkout.
- **Multi-idioma** (PT/EN/ES), **tema claro/escuro** e **app instalável (PWA)** — funciona como
  app no telemóvel/computador, com ícone próprio e cache dos ficheiros estáticos.
- **SEO básico**: `robots.txt`, `sitemap.xml`, dados estruturados (Organization) e tag canónica
  na página inicial; páginas pessoais/transacionais (`cartao-digital.html`,
  `pedido-confirmado.html`, `admin.html`) ficam marcadas como `noindex`.

## Arquitetura

```
index.html                Estrutura da página (hero, categorias, editor, projetos, checkout)
pedido-confirmado.html    Página de retorno do Stripe Checkout (consulta /api/order-status)
minhas-encomendas.html    Cliente consulta as suas encomendas pelo e-mail
cartao-digital.html       Cartão Digital público (o que um chip NFC ou QR code abre): nome,
                          WhatsApp, redes sociais, morada e um botão para guardar o contacto
admin.html                Painel de administração (protegido por ADMIN_PASSWORD)
manifest.json / sw.js     App instalável (PWA): manifest + service worker (cache dos estáticos,
                          nunca de /api/*)
robots.txt / sitemap.xml  SEO básico

assets/
  css/style.css           Tema da aplicação + sistema de "art board" (cartão/anúncio) themeable
                          via CSS custom properties (--tpl-primary, --tpl-bg, --tpl-icon, ...)
  js/app.js               CATEGORIES / TEMPLATES / FORMATS (dados) + estado do editor +
                          renderização do board + projetos/carrinho (localStorage) +
                          exportação (PNG/PDF)/partilha + cartão digital (QR/vCard) + checkout
  js/i18n.js              Traduções PT/EN/ES do chrome estático da interface
  icon-192.png / icon-512.png / og-image.png   Ícones da PWA e imagem para redes sociais

api/                      Funções serverless (tem de ficar na raiz — é a pasta que a Vercel
                          deteta automaticamente para isto, não pode ser movida). Cada ficheiro
                          `.js` aqui dentro é uma Function separada — a conta grátis (Hobby) da
                          Vercel só permite 12 por deployment (temos 11), por isso os helpers
                          partilhados vivem em `lib/` (fora de `api/`) e não em `api/lib/`.
  create-checkout-session.js  Recebe os itens do carrinho, grava o pedido + order_items (com a
                              imagem em base64 de cada item), cria a Stripe Checkout Session
                              (um line_item por item, cupões de desconto ativados)
  stripe-webhook.js           Confirma o pagamento, cria uma encomenda na Gelato por item do
                              carrinho, gera o código de referência, envia o e-mail, e trata
                              "checkout.session.expired" para o e-mail de carrinho abandonado
  gelato-webhook.js           Recebe atualizações de rastreio/estado da Gelato quando um pedido
                              é expedido (opcional — ver a secção "Rastreio de envio" abaixo)
  prices.js                   Tabela de preços pública (o carrinho mostra subtotais — o preço
                              cobrado é sempre recalculado no servidor)
  order-status.js             Consulta o estado de uma encomenda (usado por pedido-confirmado.html)
  order-image.js              Serve a arte de impressão de uma encomenda ou de um item do carrinho
                              (lida da base de dados) — é esta URL que a Gelato descarrega
  digital-card.js              Devolve os dados de contacto (não sensíveis) de um pedido, para
                              cartao-digital.html mostrar — usado pelos chips NFC e por QR codes
  my-orders.js                Lista as encomendas de um e-mail (usado por minhas-encomendas.html)
  testimonials.js             Lista pública dos depoimentos aprovados
  admin/orders.js              Lista todas as encomendas, paginado (usado por admin.html)
  admin/testimonials.js        CRUD de depoimentos (protegido por ADMIN_PASSWORD)

lib/{supabase,gelato,price,email,adminAuth,referral,formats,checkout}.js   Helpers dos serviços
                          externos, partilhados pelas funções em api/ (não são endpoints)

supabase/schema.sql       Tabelas `orders`, `order_items` e `testimonials` (ver secção de
                          monetização abaixo)
```

Cada modelo combina um `layout` (`split` | `topbar` | `diagonal` | `frame` | `centered`) com
um `pattern` de fundo (`none` | `diagonal` | `dots` | `grid` | `carbon` | `confetti`) e uma
paleta de cores — a mesma malha de CSS é reaproveitada por todos os 24 modelos, então cores e
textos personalizados no editor não quebram o layout. Modelos com fundo escuro (`Tech Mono`,
`Carbon Speed`, `Bistrô Noir`, `Editorial Preto`) e os que usam uma cor de fundo diferente no
verso do cartão (`Skyline Azul`, `Festa Vibrante`) definem `iconAccent`/`textBack` no próprio
template para garantir contraste — ver `TEMPLATES` em `app.js`.

## O que NÃO dá para fazer (e por quê)

- **Exportação em PNG/PDF e o QR code dependem de internet**: `html2canvas`, `jsPDF` e
  `qrcodejs` são carregados via CDN (cdnjs.cloudflare.com); sem conexão, os botões avisam e
  sugerem usar "Imprimir" (que não depende de nenhuma dessas bibliotecas).
- **Projetos e carrinho não sincronizam entre dispositivos**: ficam só no `localStorage` do
  navegador onde foram guardados — não há backend nem conta de usuário.

## Monetização: impressos e convites (Stripe + Supabase + Gelato + Resend)

Nos formatos impressos (Cartão de Visita, Flyer A5, Convite) o editor mostra um botão
**"Adicionar ao Carrinho"** que leva a um checkout: o cliente escolhe quantidade (por formato —
ver `PRICE_TABLE`) e morada, paga via Stripe (com campo de cupão de desconto), e o pedido é
enviado automaticamente para impressão e envio pela [Gelato](https://gelato.com) (rede de
impressão sob encomenda com API pública, print-on-demand local ao destinatário). O formato
**"Convite Digital"** é diferente: não passa pela Gelato nem pede morada — o ficheiro final é
entregue por e-mail assim que o pagamento é confirmado (ver `lib/formats.js` para a lista
de formatos "só digitais").

```
Cliente adiciona 1+ designs ao carrinho → cada item gera o seu PNG no browser
  → POST /api/create-checkout-session com a lista de itens
       (grava o pedido "pai" (orders) + uma linha por item (order_items), cada uma com a
        sua imagem em base64, cria uma Stripe Checkout Session com um line_item por item —
        morada só é pedida/exigida se houver pelo menos um item impresso no carrinho)
  → cliente paga na página da Stripe (pode aplicar um cupão de desconto, incluindo um
    código de referência partilhado por outro cliente)
  → Stripe chama /api/stripe-webhook (checkout.session.completed)
       (marca o pedido como "paid"; para cada item impresso chama a Gelato Order API — que
        descarrega a imagem via /api/order-image?item=<id> —, e para cada item
        "convite-digital" salta a Gelato e prepara o link de download; marca o pedido como
        "sent_to_print" (se houver algum item impresso) ou "delivered" (se for 100%
        digital), gera um código de referência único para este cliente e envia o e-mail de
        confirmação via Resend, se configurada, com os links de download dos itens digitais)
  → pedido-confirmado.html faz polling a /api/order-status até mostrar o estado final
  → o cliente pode depois consultar tudo em minhas-encomendas.html pelo e-mail
```

Cada imagem fica guardada como base64 (coluna `image_data` de `order_items`, ou de `orders`
para o primeiro item — não precisa de um bucket de Storage à parte) e é servida publicamente
por `/api/order-image?item=<id>` (ou `?id=<id>` para o pedido inteiro), que é a URL que a
Gelato usa para descarregar o ficheiro.

### Pôr a funcionar

Isto deixa de ser só ficheiros estáticos: precisa de hosting com funções serverless. O caminho
mais simples (tudo com plano gratuito para começar):

1. **Cria as contas**: [Stripe](https://dashboard.stripe.com) (modo de teste já chega para
   validar o fluxo), [Supabase](https://supabase.com), [Gelato](https://dashboard.gelato.com)
   e, opcionalmente, [Resend](https://resend.com) (e-mail de confirmação).
2. **Supabase**: cria um projeto e corre `supabase/schema.sql` no SQL Editor (não precisa de
   nenhum bucket de Storage — a imagem fica nas próprias tabelas `orders`/`order_items`). Se
   já tinhas a tabela `orders` de uma versão anterior, corre também as migrações comentadas no
   topo do ficheiro (`item_count`, `referral_code`, a criação da tabela `order_items`, e o
   alargamento dos `check` de `product_format`/`status` para incluir `convite` /
   `convite-digital` / `delivered`).
3. **Gelato**: confirma o `productUid` exato de cada formato **impresso** que queres vender
   (cartão, flyer e/ou convite — "convite-digital" não precisa de nenhum, nunca é impresso) —
   usa a tua API key da Gelato para chamar
   `GET https://product.gelatoapis.com/v3/products:search` (filtra por "business card" /
   "flyer" / "invitation" no tamanho/acabamento desejado) e copia os `productUid` devolvidos
   para `GELATO_PRODUCT_UID_CARD` / `GELATO_PRODUCT_UID_FLYER` / `GELATO_PRODUCT_UID_CONVITE`.
   **Não uses os valores em `.env.example` sem confirmar** — são só placeholders.
4. **Preço**: define `PRICE_TABLE` no `.env` só depois de saberes o custo real da Gelato
   (impressão + envio) para o destino que vais vender — os valores de exemplo não são reais.
5. **Cupões de desconto** (opcional): cria em Stripe Dashboard → Product catalog → Coupons /
   Promotion codes — não precisa de nenhuma alteração no código, já está ativado no checkout.
6. **E-mail de confirmação** (opcional): cria uma conta Resend, gera uma API key e define
   `RESEND_API_KEY`. Sem domínio próprio verificado, `onboarding@resend.dev` já funciona para
   testar; para produção, verifica o teu domínio na Resend e atualiza `EMAIL_FROM`.
7. **Painel de administração**: define `ADMIN_PASSWORD` com uma palavra-passe só tua — sem
   isto, `/admin.html` fica desativado (o endpoint responde 503).
7b. **Códigos de referência** (opcional): cria um cupão em Stripe Dashboard → Product catalog
   → Coupons (ex: 10% de desconto) e define `REFERRAL_COUPON_ID` com o ID desse cupão. Sem
   isto, o site funciona na mesma, só não gera códigos de referência depois do pagamento.
8. **Deploy**: importa este repositório na [Vercel](https://vercel.com) (deteta o `/api`
   automaticamente como funções serverless e serve o resto como site estático), copia
   `.env.example` para as variáveis de ambiente do projeto na Vercel com os valores reais.
9. **Webhook da Stripe**: no dashboard da Stripe, cria um endpoint de webhook apontando para
   `https://<o-teu-domínio>/api/stripe-webhook`, subscrito aos eventos `checkout.session.completed`
   **e** `checkout.session.expired` (este segundo é o que aciona o e-mail de carrinho
   abandonado), e copia o "Signing secret" para `STRIPE_WEBHOOK_SECRET`.
10. **Rastreio de envio** (opcional): no dashboard da Gelato (Settings → Webhooks), configura
    o URL `https://<o-teu-domínio>/api/gelato-webhook?secret=<um-segredo-à-tua-escolha>` e
    define esse mesmo segredo em `GELATO_WEBHOOK_SECRET` na Vercel. Confirma nos logs da função
    `gelato-webhook` (Vercel → Deployments → Functions) se os campos do payload da primeira
    entrega real batem certo com o que `api/gelato-webhook.js` espera — ajusta se for preciso.
11. **Botão de WhatsApp**: troca o número de exemplo `351900000000` pelo teu número real (só
    dígitos, formato internacional) em `assets/js/app.js` (`WHATSAPP_NUMBER`) e no `href` do
    botão em `minhas-encomendas.html` e `pedido-confirmado.html`.
12. **SEO**: se usares um domínio próprio em vez do `*.vercel.app`, atualiza esse domínio em
    `robots.txt`, `sitemap.xml` e nas tags `canonical`/`og:url`/JSON-LD de `index.html`, e
    submete o `sitemap.xml` no Google Search Console.

### Chip NFC: o processo (manual, de propósito)

O formato "Chip NFC" é diferente de todos os outros: não há nenhum fornecedor tipo Gelato que
grave chips NFC automaticamente, por isso este é um **piloto com fulfillment manual** — o
software está todo pronto, mas o passo de gravar e enviar o chip físico és tu que fazes:

1. **Compra chips NFC em branco** (cartões, autocolantes ou porta-chaves NFC — procura "NFC tag
   NTAG213" ou similar, vendem-se baratos online em lotes de 10-50).
2. Quando alguém compra um "Chip NFC", o pedido aparece em `/admin.html` com o estado
   **"Aguarda chip NFC"** e um botão **"🔗 Copiar link"** — copia esse link (algo como
   `https://o-teu-site.vercel.app/cartao-digital.html?order=<id>`).
3. **Grava esse link no chip**, usando uma app como "NFC Tools" (Android/iOS) — é escrever um
   registo NDEF do tipo "URL" com esse endereço. O chip nunca guarda os dados do cliente
   diretamente, só o link — por isso não há limite de tamanho nem preocupação com o que cabe
   no chip.
4. Testa (encosta o teu telemóvel ao chip e confirma que abre a página certa, com o nome/
   contactos corretos) e envia o chip pelo correio normal para a morada do pedido.
5. Não há nenhum botão para marcar "enviado" — isso é só para tua organização (ex: marcar numa
   folha de cálculo à parte, ou simplesmente tratar cada pedido "Aguarda chip NFC" assim que
   aparecer).

A página `/cartao-digital.html?order=<id>` funciona também com QR code (o link é o mesmo) e é
pública — qualquer pessoa com o link vê o cartão, mas o id do pedido é um UUID impossível de
adivinhar, o mesmo modelo de confiança já usado por `/api/order-image`.

### Limitações

- Preços e os `productUid` da Gelato em `.env.example` são **placeholders**, não valores
  verificados — confirma-os antes de aceitar pagamentos reais.
- Sem reconciliação automática: se a chamada à Gelato falhar depois do pagamento já cobrado
  (ex: API fora do ar), a encomenda fica marcada `failed` com o erro em `orders.error_message`
  — precisa de resolução manual (reprocessar ou reembolsar pelo dashboard da Stripe).
- **Painel de admin com autenticação simples**: uma única palavra-passe partilhada
  (`ADMIN_PASSWORD`), guardada em `sessionStorage` no browser — suficiente para uso pessoal,
  mas sem contas de utilizador nem controlo de permissões por pessoa.
- **Partilha direta** (`navigator.share`) só funciona em navegadores/dispositivos com suporte
  a Web Share API com ficheiros (maioria dos telemóveis modernos); no desktop ou em
  navegadores sem suporte, cai automaticamente para download da imagem.
- **Cartão Digital (QR/vCard)**: os dados guardados no QR são exatamente os campos preenchidos
  no editor (nome, cargo, empresa, telefone, e-mail, site, endereço, slogan) — não há validação
  de formato desses campos além da que já existe no editor.
- **Multi-idioma cobre só o chrome estático** (menus, botões, títulos fixos) — os nomes dos
  modelos/segmentos e o conteúdo que o utilizador escreve continuam em português.
- **PWA usa estratégia "rede primeiro"**: tenta sempre ir buscar a versão mais recente do site
  à internet (para nunca mostrar conteúdo desatualizado depois de um deploy); só usa a cópia
  em cache como último recurso, se a pessoa estiver mesmo offline. `/api/*` nunca é interceto
  pelo service worker — pagamentos e consultas de encomendas são sempre em direto.
- **Vercel Hobby (grátis) só permite 12 Serverless Functions por deployment** — cada ficheiro
  `.js` dentro de `api/` conta como uma (o código partilhado vive em `lib/`, fora de `api/`,
  para não contar). Atualmente há **11** — só sobra espaço para **mais 1** endpoint novo antes
  de precisares do plano Pro ou de agrupar rotas no mesmo ficheiro.
- **Rastreio de envio depende de campos não confirmados**: `api/gelato-webhook.js` assume
  nomes de campo comuns (`trackingCode`, `trackingUrl`, ...) para o payload que a Gelato envia,
  mas isto não está confirmado com uma entrega real — na primeira vez que a Gelato chamar este
  endpoint, confirma nos logs da função na Vercel se os campos batem certo.
- **Carrinho abandonado depende de subscreveres o evento certo na Stripe**: o dashboard da
  Stripe tem de ter `checkout.session.expired` adicionado à lista de eventos do teu webhook
  (ver passo 9 abaixo) — sem isso, o e-mail de lembrete nunca é enviado.
- **Botão de WhatsApp com número placeholder**: `WHATSAPP_NUMBER` em `assets/js/app.js` (e o
  `href` repetido em `minhas-encomendas.html`/`pedido-confirmado.html`) vêm com um número de
  exemplo — troca pelo teu número real antes de publicar.
- **Publicação automática no Instagram não está incluída** — a API oficial da Meta exige
  revisão de app e uma conta Instagram Business ligada; a partilha via `navigator.share` abre
  o menu nativo de partilha do dispositivo (o Instagram aparece lá como uma das opções, mas a
  publicação em si é feita pela app do Instagram, não por este site).
