/* ---------------------------------------------------------
   UniAds Studio — Tradução da interface (chrome estático).
   Os templates/categorias e conteúdo gerado pelo utilizador
   permanecem em português — apenas textos fixos da interface
   são traduzidos.
   --------------------------------------------------------- */
(function () {
  "use strict";

  var STORAGE_KEY = "uniads_lang";

  var DICT = {
    pt: {
      "nav.segmentos": "Segmentos",
      "nav.editor": "Editor",
      "nav.projetos": "Meus Projetos",
      "nav.ajuda": "Como Funciona",
      "nav.depoimentos": "Depoimentos",
      "nav.encomendas": "Minhas Encomendas",
      "btn.novoProjeto": "+ Novo Projeto",
      "theme.light": "Modo claro",
      "theme.dark": "Modo escuro",

      "hero.eyebrow": "Publicidade &amp; Identidade Visual",
      "hero.title": "Cartões de visita e artes publicitárias para <span class=\"hl\">qualquer negócio</span>",
      "hero.desc": "Monte cartões de visita, posts, stories e flyers prontos para imprimir ou publicar — com templates desenhados para companhias aéreas, casamentos, restaurantes, imobiliárias, saúde, moda, eventos e muito mais.",
      "hero.verSegmentos": "Ver Segmentos",
      "hero.abrirEditor": "Abrir Editor",
      "hero.stat.templates": "modelos",
      "hero.stat.categorias": "segmentos",
      "hero.stat.formatos": "formatos",

      "categorias.title": "Escolha um segmento",
      "categorias.desc": "Cada segmento traz paleta, ícones e composição pensados para o setor. Clique para ir direto ao editor com um modelo sugerido.",

      "editor.title": "Editor",
      "editor.desc": "Personalize textos, cores, logotipo e formato. A pré-visualização atualiza em tempo real.",
      "editor.formato": "Formato",
      "editor.modelo": "Modelo",
      "editor.pesquisarPh": "Pesquisar modelo por nome...",
      "editor.semModelos": "Nenhum modelo encontrado.",
      "editor.conteudo": "Conteúdo",
      "editor.nome": "Nome",
      "editor.cargo": "Cargo / Função",
      "editor.empresa": "Empresa / Marca",
      "editor.slogan": "Frase de efeito / Slogan",
      "editor.telefone": "Telefone",
      "editor.email": "E-mail",
      "editor.site": "Site",
      "editor.instagram": "Instagram / Rede social",
      "editor.endereco": "Endereço / Cidade",
      "editor.logotipo": "Logotipo",
      "editor.remover": "Remover",
      "editor.semLogoHint": "Sem logo? O ícone do segmento é usado automaticamente.",
      "editor.cores": "Cores",
      "editor.primaria": "Primária",
      "editor.secundaria": "Secundária",
      "editor.padraoModelo": "Padrão do modelo",
      "editor.salvarProjeto": "Salvar Projeto",
      "editor.baixarPng": "Baixar PNG",
      "editor.imprimir": "Imprimir",
      "editor.partilhar": "Partilhar",
      "editor.impressosFisicos": "Impressos físicos",
      "editor.impressosHint": "Manda imprimir e entregar em casa (disponível para Cartão de Visita e Flyer A5).",
      "editor.comprarImpressos": "Comprar impressos",
      "editor.adicionarCarrinho": "Adicionar ao Carrinho",
      "editor.ampliar": "Ampliar",
      "editor.baixarPdf": "Baixar PDF",
      "editor.cartaoDigital": "Cartão Digital",
      "editor.incluirQr": "Incluir QR code com os meus contactos no verso do cartão",
      "editor.qrHint": "Quem receber o cartão físico lê o QR e guarda o teu contacto automaticamente no telemóvel.",
      "editor.verCartaoDigital": "Ver Cartão Digital",

      "cart.title": "O teu carrinho",
      "cart.total": "Total",
      "cart.finalizar": "Finalizar Compra",
      "cart.vazio": "O carrinho está vazio.",

      "digitalcard.title": "Cartão Digital",
      "digitalcard.hint": "Aponta a câmara do telemóvel para o código e guarda o contacto diretamente.",
      "digitalcard.baixarVcf": "Descarregar .vcf",
      "digitalcard.baixarQr": "Descarregar QR (PNG)",

      "projetos.title": "Meus Projetos",
      "projetos.desc": "Salvos neste navegador. Edite, duplique ou exclua quando quiser.",
      "projetos.vazio": "Você ainda não salvou nenhum projeto. Personalize um cartão no editor e clique em \"Salvar Projeto\".",

      "ajuda.title": "Como funciona",
      "ajuda.passo1.titulo": "Escolha o segmento",
      "ajuda.passo1.desc": "Aviação, casamentos, gastronomia, imóveis, beleza, tecnologia, saúde, eventos, moda, automotivo, educação, corporativo, pet care ou fitness.",
      "ajuda.passo2.titulo": "Selecione o formato",
      "ajuda.passo2.desc": "Cartão de visita (frente e verso), post para redes sociais, story ou flyer A5.",
      "ajuda.passo3.titulo": "Personalize",
      "ajuda.passo3.desc": "Textos, logotipo e cores — a arte é montada automaticamente respeitando o layout do modelo.",
      "ajuda.passo4.titulo": "Exporte",
      "ajuda.passo4.desc": "Baixe em PNG em alta resolução, imprima direto do navegador ou salve o projeto para editar depois.",

      "depoimentos.title": "Depoimentos",
      "depoimentos.desc": "O que dizem os clientes que já usaram o UniAds Studio.",

      "footer.texto": "UniAds Studio — parte do ecossistema Unisocial.",

      "checkout.title": "Finalizar compra",
      "checkout.hint": "Impressão e envio por um parceiro externo (Gelato). O pagamento é processado de forma segura pela Stripe.",
      "checkout.quantidade": "Quantidade",
      "checkout.nome": "Nome",
      "checkout.apelido": "Apelido",
      "checkout.morada": "Morada",
      "checkout.complemento": "Complemento (opcional)",
      "checkout.cidade": "Cidade",
      "checkout.codigoPostal": "Código Postal",
      "checkout.pais": "País (código, ex: PT)",
      "checkout.telefone": "Telefone (opcional)",
      "checkout.email": "E-mail",
      "checkout.irPagamento": "Ir para pagamento",

      "modal.fechar": "Fechar"
    },

    en: {
      "nav.segmentos": "Segments",
      "nav.editor": "Editor",
      "nav.projetos": "My Projects",
      "nav.ajuda": "How It Works",
      "nav.depoimentos": "Testimonials",
      "nav.encomendas": "My Orders",
      "btn.novoProjeto": "+ New Project",
      "theme.light": "Light mode",
      "theme.dark": "Dark mode",

      "hero.eyebrow": "Advertising &amp; Visual Identity",
      "hero.title": "Business cards and advertising artwork for <span class=\"hl\">any business</span>",
      "hero.desc": "Build business cards, posts, stories and flyers ready to print or publish — with templates designed for airlines, weddings, restaurants, real estate, health, fashion, events and much more.",
      "hero.verSegmentos": "View Segments",
      "hero.abrirEditor": "Open Editor",
      "hero.stat.templates": "templates",
      "hero.stat.categorias": "segments",
      "hero.stat.formatos": "formats",

      "categorias.title": "Choose a segment",
      "categorias.desc": "Each segment brings a palette, icons and layout designed for that industry. Click to jump straight into the editor with a suggested template.",

      "editor.title": "Editor",
      "editor.desc": "Customize text, colors, logo and format. The preview updates in real time.",
      "editor.formato": "Format",
      "editor.modelo": "Template",
      "editor.pesquisarPh": "Search templates by name...",
      "editor.semModelos": "No templates found.",
      "editor.conteudo": "Content",
      "editor.nome": "Name",
      "editor.cargo": "Job Title",
      "editor.empresa": "Company / Brand",
      "editor.slogan": "Tagline / Slogan",
      "editor.telefone": "Phone",
      "editor.email": "Email",
      "editor.site": "Website",
      "editor.instagram": "Instagram / Social",
      "editor.endereco": "Address / City",
      "editor.logotipo": "Logo",
      "editor.remover": "Remove",
      "editor.semLogoHint": "No logo? The segment's icon is used automatically.",
      "editor.cores": "Colors",
      "editor.primaria": "Primary",
      "editor.secundaria": "Secondary",
      "editor.padraoModelo": "Template default",
      "editor.salvarProjeto": "Save Project",
      "editor.baixarPng": "Download PNG",
      "editor.imprimir": "Print",
      "editor.partilhar": "Share",
      "editor.impressosFisicos": "Printed copies",
      "editor.impressosHint": "Get it printed and delivered (available for Business Card and A5 Flyer).",
      "editor.comprarImpressos": "Order prints",
      "editor.adicionarCarrinho": "Add to Cart",
      "editor.ampliar": "Zoom in",
      "editor.baixarPdf": "Download PDF",
      "editor.cartaoDigital": "Digital Card",
      "editor.incluirQr": "Include a QR code with my contact info on the back of the card",
      "editor.qrHint": "Whoever gets the physical card can scan the QR and save your contact straight to their phone.",
      "editor.verCartaoDigital": "View Digital Card",

      "cart.title": "Your cart",
      "cart.total": "Total",
      "cart.finalizar": "Checkout",
      "cart.vazio": "Your cart is empty.",

      "digitalcard.title": "Digital Card",
      "digitalcard.hint": "Point your phone's camera at the code to save the contact directly.",
      "digitalcard.baixarVcf": "Download .vcf",
      "digitalcard.baixarQr": "Download QR (PNG)",

      "projetos.title": "My Projects",
      "projetos.desc": "Saved in this browser. Edit, duplicate or delete whenever you want.",
      "projetos.vazio": "You haven't saved any project yet. Customize a card in the editor and click \"Save Project\".",

      "ajuda.title": "How it works",
      "ajuda.passo1.titulo": "Choose a segment",
      "ajuda.passo1.desc": "Aviation, weddings, food, real estate, beauty, technology, health, events, fashion, automotive, education, corporate, pet care or fitness.",
      "ajuda.passo2.titulo": "Pick a format",
      "ajuda.passo2.desc": "Business card (front and back), social media post, story or A5 flyer.",
      "ajuda.passo3.titulo": "Customize",
      "ajuda.passo3.desc": "Text, logo and colors — the artwork is assembled automatically respecting the template layout.",
      "ajuda.passo4.titulo": "Export",
      "ajuda.passo4.desc": "Download a high-resolution PNG, print directly from the browser, or save the project to edit later.",

      "depoimentos.title": "Testimonials",
      "depoimentos.desc": "What customers who've used UniAds Studio have to say.",

      "footer.texto": "UniAds Studio — part of the Unisocial ecosystem.",

      "checkout.title": "Checkout",
      "checkout.hint": "Printing and shipping by an external partner (Gelato). Payment is securely processed by Stripe.",
      "checkout.quantidade": "Quantity",
      "checkout.nome": "First name",
      "checkout.apelido": "Last name",
      "checkout.morada": "Address",
      "checkout.complemento": "Address line 2 (optional)",
      "checkout.cidade": "City",
      "checkout.codigoPostal": "Postal code",
      "checkout.pais": "Country (code, e.g. PT)",
      "checkout.telefone": "Phone (optional)",
      "checkout.email": "Email",
      "checkout.irPagamento": "Go to payment",

      "modal.fechar": "Close"
    },

    es: {
      "nav.segmentos": "Segmentos",
      "nav.editor": "Editor",
      "nav.projetos": "Mis Proyectos",
      "nav.ajuda": "Cómo Funciona",
      "nav.depoimentos": "Opiniones",
      "nav.encomendas": "Mis Pedidos",
      "btn.novoProjeto": "+ Nuevo Proyecto",
      "theme.light": "Modo claro",
      "theme.dark": "Modo oscuro",

      "hero.eyebrow": "Publicidad &amp; Identidad Visual",
      "hero.title": "Tarjetas de visita y artes publicitarias para <span class=\"hl\">cualquier negocio</span>",
      "hero.desc": "Crea tarjetas de visita, posts, historias y flyers listos para imprimir o publicar — con plantillas diseñadas para aerolíneas, bodas, restaurantes, inmobiliarias, salud, moda, eventos y mucho más.",
      "hero.verSegmentos": "Ver Segmentos",
      "hero.abrirEditor": "Abrir Editor",
      "hero.stat.templates": "plantillas",
      "hero.stat.categorias": "segmentos",
      "hero.stat.formatos": "formatos",

      "categorias.title": "Elige un segmento",
      "categorias.desc": "Cada segmento trae paleta, íconos y composición pensados para el sector. Haz clic para ir directo al editor con una plantilla sugerida.",

      "editor.title": "Editor",
      "editor.desc": "Personaliza textos, colores, logotipo y formato. La vista previa se actualiza en tiempo real.",
      "editor.formato": "Formato",
      "editor.modelo": "Plantilla",
      "editor.pesquisarPh": "Buscar plantilla por nombre...",
      "editor.semModelos": "No se encontraron plantillas.",
      "editor.conteudo": "Contenido",
      "editor.nome": "Nombre",
      "editor.cargo": "Cargo / Función",
      "editor.empresa": "Empresa / Marca",
      "editor.slogan": "Frase / Eslogan",
      "editor.telefone": "Teléfono",
      "editor.email": "Correo electrónico",
      "editor.site": "Sitio web",
      "editor.instagram": "Instagram / Red social",
      "editor.endereco": "Dirección / Ciudad",
      "editor.logotipo": "Logotipo",
      "editor.remover": "Eliminar",
      "editor.semLogoHint": "¿Sin logo? El ícono del segmento se usa automáticamente.",
      "editor.cores": "Colores",
      "editor.primaria": "Primario",
      "editor.secundaria": "Secundario",
      "editor.padraoModelo": "Predeterminado de la plantilla",
      "editor.salvarProjeto": "Guardar Proyecto",
      "editor.baixarPng": "Descargar PNG",
      "editor.imprimir": "Imprimir",
      "editor.partilhar": "Compartir",
      "editor.impressosFisicos": "Impresos físicos",
      "editor.impressosHint": "Manda a imprimir y entregar a domicilio (disponible para Tarjeta de Visita y Flyer A5).",
      "editor.comprarImpressos": "Comprar impresos",
      "editor.adicionarCarrinho": "Añadir al Carrito",
      "editor.ampliar": "Ampliar",
      "editor.baixarPdf": "Descargar PDF",
      "editor.cartaoDigital": "Tarjeta Digital",
      "editor.incluirQr": "Incluir un código QR con mis contactos en el reverso de la tarjeta",
      "editor.qrHint": "Quien reciba la tarjeta física puede leer el QR y guardar tu contacto automáticamente en el móvil.",
      "editor.verCartaoDigital": "Ver Tarjeta Digital",

      "cart.title": "Tu carrito",
      "cart.total": "Total",
      "cart.finalizar": "Finalizar Compra",
      "cart.vazio": "El carrito está vacío.",

      "digitalcard.title": "Tarjeta Digital",
      "digitalcard.hint": "Apunta la cámara del móvil al código y guarda el contacto directamente.",
      "digitalcard.baixarVcf": "Descargar .vcf",
      "digitalcard.baixarQr": "Descargar QR (PNG)",

      "projetos.title": "Mis Proyectos",
      "projetos.desc": "Guardados en este navegador. Edita, duplica o elimina cuando quieras.",
      "projetos.vazio": "Aún no has guardado ningún proyecto. Personaliza una tarjeta en el editor y haz clic en \"Guardar Proyecto\".",

      "ajuda.title": "Cómo funciona",
      "ajuda.passo1.titulo": "Elige el segmento",
      "ajuda.passo1.desc": "Aviación, bodas, gastronomía, inmuebles, belleza, tecnología, salud, eventos, moda, automotriz, educación, corporativo, pet care o fitness.",
      "ajuda.passo2.titulo": "Selecciona el formato",
      "ajuda.passo2.desc": "Tarjeta de visita (frente y dorso), post para redes sociales, historia o flyer A5.",
      "ajuda.passo3.titulo": "Personaliza",
      "ajuda.passo3.desc": "Textos, logotipo y colores — el arte se monta automáticamente respetando el diseño de la plantilla.",
      "ajuda.passo4.titulo": "Exporta",
      "ajuda.passo4.desc": "Descarga en PNG de alta resolución, imprime directo desde el navegador o guarda el proyecto para editarlo después.",

      "depoimentos.title": "Opiniones",
      "depoimentos.desc": "Lo que dicen los clientes que ya usaron UniAds Studio.",

      "footer.texto": "UniAds Studio — parte del ecosistema Unisocial.",

      "checkout.title": "Finalizar compra",
      "checkout.hint": "Impresión y envío por un socio externo (Gelato). El pago se procesa de forma segura con Stripe.",
      "checkout.quantidade": "Cantidad",
      "checkout.nome": "Nombre",
      "checkout.apelido": "Apellido",
      "checkout.morada": "Dirección",
      "checkout.complemento": "Complemento (opcional)",
      "checkout.cidade": "Ciudad",
      "checkout.codigoPostal": "Código postal",
      "checkout.pais": "País (código, ej: PT)",
      "checkout.telefone": "Teléfono (opcional)",
      "checkout.email": "Correo electrónico",
      "checkout.irPagamento": "Ir al pago",

      "modal.fechar": "Cerrar"
    }
  };

  var HTML_LANG = { pt: "pt-PT", en: "en", es: "es" };

  function getLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* sem localStorage */ }
    return DICT[saved] ? saved : "pt";
  }

  function setLang(lang) {
    if (!DICT[lang]) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* não persiste */ }
  }

  function t(key) {
    var lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.pt[key] || key;
  }

  function apply() {
    var lang = getLang();
    document.documentElement.setAttribute("lang", HTML_LANG[lang] || "pt-PT");

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });

    var sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;

    document.dispatchEvent(new CustomEvent("uniads:langchange", { detail: { lang: lang } }));
  }

  window.UniI18n = { t: t, getLang: getLang, setLang: setLang, apply: apply };

  document.addEventListener("DOMContentLoaded", function () {
    apply();
    var sel = document.getElementById("lang-select");
    if (sel) {
      sel.addEventListener("change", function () {
        setLang(sel.value);
        apply();
      });
    }
  });
})();
