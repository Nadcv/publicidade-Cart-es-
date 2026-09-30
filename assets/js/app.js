/* =========================================================
   UniAds Studio — lógica do gerador de cartões e publicidade
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "uniads_studio_projects_v1";

  /* ---------------------------------------------------------
     Ícones (SVG inline, sem dependências externas)
     --------------------------------------------------------- */
  var ICON_PATHS = {
    plane: '<path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/>',
    rings: '<circle cx="8" cy="15" r="5"/><circle cx="16" cy="15" r="5"/>',
    fork: '<path d="M6 2v7a2 2 0 0 0 4 0V2"/><path d="M8 9v13"/><path d="M15 2c-1.6 1.6-1.6 6.4 0 8l0 12"/>',
    house: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
    flower: '<circle cx="12" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    confetti: '<circle cx="12" cy="4" r="1.3"/><circle cx="4" cy="12" r="1.3"/><circle cx="20" cy="12" r="1.3"/><circle cx="12" cy="20" r="1.3"/><rect x="10.4" y="10.4" width="3.2" height="3.2" transform="rotate(20 12 12)"/><path d="M4 4l2.4 2.4M20 4l-2.4 2.4M4 20l2.4-2.4M20 20l-2.4-2.4"/>',
    cross: '<path d="M12 3v18M3 12h18"/>',
    bolt: '<path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" fill="currentColor" stroke="none"/>',
    cap: '<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 8v6"/>',
    star: '<path d="M12 2l2.9 6.6L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2 2 9.3l7.1-.7L12 2z" fill="currentColor" stroke="none"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/>',
    pin: '<path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.4"/>',
    paw: '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6.5" r="2"/><circle cx="17" cy="9" r="2"/><path d="M8.5 14.5c0-2 1.6-3.2 3.5-3.2s3.5 1.2 3.5 3.2c0 2.3-1.8 3.8-3.5 3.8s-3.5-1.5-3.5-3.8z"/>',
    dumbbell: '<path d="M6.5 7v10M17.5 7v10"/><rect x="3" y="9" width="3" height="6" rx="1"/><rect x="18" y="9" width="3" height="6" rx="1"/><path d="M6.5 12h11"/>'
  };

  function iconSVG(name, cls) {
    var p = ICON_PATHS[name] || ICON_PATHS.star;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }

  /* ---------------------------------------------------------
     Categorias
     --------------------------------------------------------- */
  var CATEGORIES = [
    { id: "aviacao", name: "Companhias Aéreas", icon: "plane", color: "#4c8dff",
      description: "Cartões e artes para tripulação, agências de viagem e companhias aéreas.",
      defaults: { nome: "Marina Duarte", cargo: "Comissária de Bordo", empresa: "Skyline Airlines",
        slogan: "Voando mais alto, todos os dias.", telefone: "(11) 4002-8922", email: "contato@skylineair.com",
        site: "www.skylineair.com", instagram: "@skylineairlines", endereco: "Aeroporto Internacional, Guarulhos - SP" } },

    { id: "casamento", name: "Casamentos", icon: "rings", color: "#caa356",
      description: "Cerimonialistas, buffets e fornecedores de casamento com identidade elegante.",
      defaults: { nome: "Ana & Pedro", cargo: "Cerimonialistas", empresa: "Ateliê dos Sonhos",
        slogan: "Transformamos seu grande dia em inesquecível.", telefone: "(21) 99887-1234", email: "contato@atelierdossonhos.com",
        site: "www.atelierdossonhos.com", instagram: "@atelierdossonhos", endereco: "Rio de Janeiro - RJ" } },

    { id: "gastronomia", name: "Restaurantes & Gastronomia", icon: "fork", color: "#c1622c",
      description: "Restaurantes, chefs, cafeterias e delivery com visual saboroso.",
      defaults: { nome: "Chef Rafael Souza", cargo: "Chef Executivo", empresa: "Sabor & Raiz",
        slogan: "Da terra para sua mesa.", telefone: "(31) 3212-4567", email: "reservas@saboreraiz.com.br",
        site: "www.saboreraiz.com.br", instagram: "@saboreraiz", endereco: "Belo Horizonte - MG" } },

    { id: "imoveis", name: "Imobiliárias", icon: "house", color: "#2f8f5b",
      description: "Corretores e imobiliárias com visual sólido e confiável.",
      defaults: { nome: "Fernanda Lima", cargo: "Corretora de Imóveis", empresa: "Lima Imóveis",
        slogan: "O imóvel certo, na hora certa.", telefone: "(41) 99123-4567", email: "fernanda@limaimoveis.com",
        site: "www.limaimoveis.com", instagram: "@limaimoveis", endereco: "Curitiba - PR" } },

    { id: "beleza", name: "Beleza & Estética", icon: "flower", color: "#e0679d",
      description: "Salões, clínicas de estética e profissionais de beleza.",
      defaults: { nome: "Camila Rocha", cargo: "Especialista em Estética", empresa: "Studio Camila Rocha",
        slogan: "Sua beleza, nossa arte.", telefone: "(51) 99876-5432", email: "contato@studiocamila.com",
        site: "www.studiocamila.com", instagram: "@studiocamilarocha", endereco: "Porto Alegre - RS" } },

    { id: "tecnologia", name: "Tecnologia & Startups", icon: "cpu", color: "#23c68b",
      description: "Startups, devs e empresas de tecnologia com visual moderno.",
      defaults: { nome: "Lucas Andrade", cargo: "CEO & Fundador", empresa: "NovaTech Soluções",
        slogan: "Inovação que transforma negócios.", telefone: "(11) 98765-4321", email: "lucas@novatech.io",
        site: "www.novatech.io", instagram: "@novatech.io", endereco: "São Paulo - SP" } },

    { id: "eventos", name: "Eventos & Festas", icon: "confetti", color: "#a15bde",
      description: "Produtoras de eventos, decoração e festas com energia e cor.",
      defaults: { nome: "Bruna Castro", cargo: "Produtora de Eventos", empresa: "Bruna Castro Eventos",
        slogan: "Festas que viram memórias.", telefone: "(85) 99654-3210", email: "contato@brunacastroeventos.com",
        site: "www.brunacastroeventos.com", instagram: "@brunacastroeventos", endereco: "Fortaleza - CE" } },

    { id: "saude", name: "Saúde & Bem-estar", icon: "cross", color: "#2196c9",
      description: "Clínicas, consultórios e profissionais de saúde com visual limpo.",
      defaults: { nome: "Dr. André Martins", cargo: "Clínico Geral", empresa: "Clínica Vida Plena",
        slogan: "Cuidando de você em todas as fases.", telefone: "(62) 3251-7890", email: "contato@vidaplena.med.br",
        site: "www.vidaplena.med.br", instagram: "@clinicavidaplena", endereco: "Goiânia - GO" } },

    { id: "automotivo", name: "Automotivo", icon: "bolt", color: "#d33a3a",
      description: "Oficinas, concessionárias e consultores automotivos.",
      defaults: { nome: "Ricardo Nogueira", cargo: "Consultor Automotivo", empresa: "Nogueira Motors",
        slogan: "Performance que você sente na estrada.", telefone: "(19) 99321-6547", email: "contato@nogueiramotors.com",
        site: "www.nogueiramotors.com", instagram: "@nogueiramotors", endereco: "Campinas - SP" } },

    { id: "educacao", name: "Educação", icon: "cap", color: "#274b8f",
      description: "Escolas, cursos e educadores com visual institucional.",
      defaults: { nome: "Profa. Juliana Prado", cargo: "Coordenadora Pedagógica", empresa: "Colégio Novo Horizonte",
        slogan: "Educação que constrói o futuro.", telefone: "(48) 3025-1122", email: "contato@novohorizonte.edu.br",
        site: "www.novohorizonte.edu.br", instagram: "@colegionovohorizonte", endereco: "Florianópolis - SC" } },

    { id: "moda", name: "Moda", icon: "star", color: "#c9436c",
      description: "Estilistas, ateliês e marcas de moda com visual editorial.",
      defaults: { nome: "Beatriz Nunes", cargo: "Designer de Moda", empresa: "BN Atelier",
        slogan: "Moda autoral, atitude própria.", telefone: "(11) 99456-7890", email: "contato@bnatelier.com",
        site: "www.bnatelier.com", instagram: "@bn.atelier", endereco: "São Paulo - SP" } },

    { id: "corporativo", name: "Corporativo & Advocacia", icon: "briefcase", color: "#35507a",
      description: "Escritórios de advocacia, consultorias e empresas corporativas.",
      defaults: { nome: "Dr. Marcelo Teixeira", cargo: "Advogado Sócio", empresa: "Teixeira & Associados",
        slogan: "Excelência jurídica a seu favor.", telefone: "(11) 3055-9900", email: "contato@teixeiraassociados.adv.br",
        site: "www.teixeiraassociados.adv.br", instagram: "@teixeiraassociados", endereco: "São Paulo - SP" } },

    { id: "petcare", name: "Pet Shops & Veterinária", icon: "paw", color: "#e07b3f",
      description: "Clínicas veterinárias, pet shops e banho & tosa com visual amigável.",
      defaults: { nome: "Dra. Sofia Almeida", cargo: "Médica Veterinária", empresa: "Clínica Patas Felizes",
        slogan: "Cuidado de quem também é família.", telefone: "(71) 99234-5678", email: "contato@patasfelizes.vet.br",
        site: "www.patasfelizes.vet.br", instagram: "@patasfelizesvet", endereco: "Salvador - BA" } },

    { id: "fitness", name: "Fitness & Academias", icon: "dumbbell", color: "#d9432e",
      description: "Academias, personal trainers e estúdios de treino com energia e força.",
      defaults: { nome: "Diego Martins", cargo: "Personal Trainer", empresa: "Força Total Studio",
        slogan: "Supera o teu limite, todos os dias.", telefone: "(41) 99876-1234", email: "contato@forcatotal.com",
        site: "www.forcatotal.com", instagram: "@forcatotalstudio", endereco: "Curitiba - PR" } }
  ];

  /* ---------------------------------------------------------
     Templates (2 por categoria = 24 modelos)
     layout: split | topbar | diagonal | frame | centered
     pattern: none | diagonal | dots | grid | carbon | confetti
     --------------------------------------------------------- */
  var TEMPLATES = [
    { id: "aviacao-1", name: "Skyline Azul", category: "aviacao", icon: "plane", layout: "diagonal", pattern: "diagonal",
      colors: { primary: "#173d7a", secondary: "#c9d4e3", bg: "#ffffff", bgBack: "#0e2a55", text: "#0e1c33", textSoft: "#5b6b83",
        textBack: "#eaf1fb", textSoftBack: "#9fb3d6", iconAccentBack: "#eaf1fb" } },
    { id: "aviacao-2", name: "Voo Executivo", category: "aviacao", icon: "plane", layout: "topbar", pattern: "grid",
      colors: { primary: "#0e2a55", secondary: "#b48a3f", bg: "#ffffff", bgBack: "#ffffff", text: "#101826", textSoft: "#5b6b83" } },

    { id: "casamento-1", name: "Elos Dourados", category: "casamento", icon: "rings", layout: "frame", pattern: "none",
      colors: { primary: "#b48a3f", secondary: "#3a2f24", bg: "#fbf6ec", bgBack: "#fbf6ec", text: "#2c2418", textSoft: "#8a7a5c" }, font: "Georgia, 'Times New Roman', serif" },
    { id: "casamento-2", name: "Jardim Romance", category: "casamento", icon: "rings", layout: "centered", pattern: "dots",
      colors: { primary: "#d9a5b3", secondary: "#b48a3f", bg: "#fff5f7", bgBack: "#fff5f7", text: "#3a2530", textSoft: "#8a6a72" }, font: "Georgia, 'Times New Roman', serif" },

    { id: "gastronomia-1", name: "Sabor Rústico", category: "gastronomia", icon: "fork", layout: "topbar", pattern: "none",
      colors: { primary: "#a8481f", secondary: "#e7c98f", bg: "#fbf1e2", bgBack: "#fbf1e2", text: "#3a2211", textSoft: "#8a6a4c" } },
    { id: "gastronomia-2", name: "Bistrô Noir", category: "gastronomia", icon: "fork", layout: "split", pattern: "diagonal",
      colors: { primary: "#1a1a1a", secondary: "#c99b3f", bg: "#151515", bgBack: "#151515", text: "#f2e9d8", textSoft: "#b8ab8f", iconAccent: "#c99b3f" } },

    { id: "imoveis-1", name: "Moderno Verde", category: "imoveis", icon: "house", layout: "split", pattern: "grid",
      colors: { primary: "#1f5c3f", secondary: "#d8e6dc", bg: "#ffffff", bgBack: "#ffffff", text: "#101c15", textSoft: "#5c6b62" } },
    { id: "imoveis-2", name: "Alto Padrão", category: "imoveis", icon: "house", layout: "frame", pattern: "none",
      colors: { primary: "#2b2b2b", secondary: "#b48a3f", bg: "#ffffff", bgBack: "#ffffff", text: "#1a1a1a", textSoft: "#6b6b6b" } },

    { id: "beleza-1", name: "Rosé Elegance", category: "beleza", icon: "flower", layout: "centered", pattern: "dots",
      colors: { primary: "#e0679d", secondary: "#f6c9dc", bg: "#fff0f6", bgBack: "#fff0f6", text: "#3a1f2b", textSoft: "#8a6272" } },
    { id: "beleza-2", name: "Studio Glow", category: "beleza", icon: "flower", layout: "topbar", pattern: "none",
      colors: { primary: "#c9436c", secondary: "#1a1a1a", bg: "#ffffff", bgBack: "#ffffff", text: "#1a1a1a", textSoft: "#6b6b6b" } },

    { id: "tecnologia-1", name: "Tech Mono", category: "tecnologia", icon: "cpu", layout: "split", pattern: "grid",
      colors: { primary: "#0f1115", secondary: "#23c68b", bg: "#0f1115", bgBack: "#0f1115", text: "#eef5f2", textSoft: "#93a39c", iconAccent: "#23c68b" } },
    { id: "tecnologia-2", name: "Startup Grid", category: "tecnologia", icon: "cpu", layout: "topbar", pattern: "grid",
      colors: { primary: "#3a3fc9", secondary: "#23c6c6", bg: "#ffffff", bgBack: "#ffffff", text: "#12142b", textSoft: "#5b5e77" } },

    { id: "eventos-1", name: "Festa Vibrante", category: "eventos", icon: "confetti", layout: "diagonal", pattern: "confetti",
      colors: { primary: "#a15bde", secondary: "#ffb347", bg: "#ffffff", bgBack: "#2c1a45", text: "#20122f", textSoft: "#6b5b7d",
        textBack: "#f3ecff", textSoftBack: "#c9b8e0", iconAccentBack: "#ffb347" } },
    { id: "eventos-2", name: "Balada Neon", category: "eventos", icon: "confetti", layout: "centered", pattern: "dots",
      colors: { primary: "#d63bb0", secondary: "#3b7bd6", bg: "#150e22", bgBack: "#150e22", text: "#f2ecff", textSoft: "#b8a9d6" } },

    { id: "saude-1", name: "Clean Care", category: "saude", icon: "cross", layout: "topbar", pattern: "none",
      colors: { primary: "#2196c9", secondary: "#a9def9", bg: "#ffffff", bgBack: "#ffffff", text: "#0f2733", textSoft: "#5b7280" } },
    { id: "saude-2", name: "Vida Plena", category: "saude", icon: "cross", layout: "split", pattern: "dots",
      colors: { primary: "#1c8f7a", secondary: "#d6f0ea", bg: "#ffffff", bgBack: "#ffffff", text: "#0f2b25", textSoft: "#5c766f" } },

    { id: "automotivo-1", name: "Carbon Speed", category: "automotivo", icon: "bolt", layout: "split", pattern: "carbon",
      colors: { primary: "#111111", secondary: "#d33a3a", bg: "#111111", bgBack: "#111111", text: "#f2f2f2", textSoft: "#a3a3a3", iconAccent: "#d33a3a" } },
    { id: "automotivo-2", name: "Garage Pro", category: "automotivo", icon: "bolt", layout: "topbar", pattern: "diagonal",
      colors: { primary: "#2b2b2b", secondary: "#f0b429", bg: "#ffffff", bgBack: "#ffffff", text: "#1a1a1a", textSoft: "#6b6b6b" } },

    { id: "educacao-1", name: "Acadêmico Clássico", category: "educacao", icon: "cap", layout: "frame", pattern: "none",
      colors: { primary: "#274b8f", secondary: "#b48a3f", bg: "#faf7ee", bgBack: "#faf7ee", text: "#161f33", textSoft: "#5b6478" }, font: "Georgia, 'Times New Roman', serif" },
    { id: "educacao-2", name: "Campus Moderno", category: "educacao", icon: "cap", layout: "topbar", pattern: "grid",
      colors: { primary: "#274b8f", secondary: "#4fb0e0", bg: "#ffffff", bgBack: "#ffffff", text: "#101a2e", textSoft: "#5b6478" } },

    { id: "moda-1", name: "Editorial Preto", category: "moda", icon: "star", layout: "centered", pattern: "none",
      colors: { primary: "#0a0a0a", secondary: "#ffffff", bg: "#0a0a0a", bgBack: "#0a0a0a", text: "#f5f5f5", textSoft: "#b0b0b0", iconAccent: "#ffffff" } },
    { id: "moda-2", name: "Atelier Branco", category: "moda", icon: "star", layout: "frame", pattern: "dots",
      colors: { primary: "#0a0a0a", secondary: "#c9436c", bg: "#ffffff", bgBack: "#ffffff", text: "#0a0a0a", textSoft: "#6b6b6b" } },

    { id: "corporativo-1", name: "Clássico Executivo", category: "corporativo", icon: "briefcase", layout: "topbar", pattern: "none",
      colors: { primary: "#1c2b45", secondary: "#a8b3c4", bg: "#ffffff", bgBack: "#ffffff", text: "#101826", textSoft: "#5b6b83" } },
    { id: "corporativo-2", name: "Prestígio", category: "corporativo", icon: "briefcase", layout: "frame", pattern: "none",
      colors: { primary: "#2b2b2b", secondary: "#b48a3f", bg: "#ffffff", bgBack: "#ffffff", text: "#1a1a1a", textSoft: "#6b6b6b" } },

    { id: "petcare-1", name: "Patinhas Alegres", category: "petcare", icon: "paw", layout: "centered", pattern: "dots",
      colors: { primary: "#e07b3f", secondary: "#2f8f5b", bg: "#fff6ee", bgBack: "#fff6ee", text: "#3a2416", textSoft: "#8a6a4c" } },
    { id: "petcare-2", name: "Clínica Vet Clean", category: "petcare", icon: "paw", layout: "topbar", pattern: "none",
      colors: { primary: "#2f8f5b", secondary: "#d8e6dc", bg: "#ffffff", bgBack: "#ffffff", text: "#101c15", textSoft: "#5c6b62" } },

    { id: "fitness-1", name: "Força Urbana", category: "fitness", icon: "dumbbell", layout: "split", pattern: "diagonal",
      colors: { primary: "#111111", secondary: "#d9432e", bg: "#111111", bgBack: "#111111", text: "#f2f2f2", textSoft: "#a3a3a3", iconAccent: "#d9432e" } },
    { id: "fitness-2", name: "Studio Energy", category: "fitness", icon: "dumbbell", layout: "diagonal", pattern: "grid",
      colors: { primary: "#d9432e", secondary: "#2b2b2b", bg: "#ffffff", bgBack: "#1a1010", text: "#1a1010", textSoft: "#6b6b6b",
        textBack: "#f5ece9", textSoftBack: "#c9a79f", iconAccentBack: "#d9432e" } }
  ];

  var FORMATS = [
    { id: "card", label: "Cartão de Visita", type: "card", printable: true, printQuantities: [100, 250, 500] },
    { id: "post", label: "Post Instagram", type: "ad", printable: false },
    { id: "story", label: "Story", type: "ad", printable: false },
    { id: "flyer", label: "Flyer A5", type: "ad", printable: true, printQuantities: [50, 100, 250] },
    { id: "convite", label: "Convite (Impresso)", type: "ad", printable: true, printQuantities: [5, 10, 20, 50, 100] },
    { id: "convite-digital", label: "Convite Digital", type: "ad", printable: true, printQuantities: [1], digitalOnly: true }
  ];

  // Formatos entregues só por e-mail (sem impressão, sem morada de envio) — tem de bater
  // certo com DIGITAL_ONLY_FORMATS em lib/formats.js.
  var DIGITAL_ONLY_FORMATS = ["convite-digital"];
  function isDigitalOnlyFormat(formatId) { return DIGITAL_ONLY_FORMATS.indexOf(formatId) !== -1; }

  var FIELD_KEYS = ["nome", "cargo", "empresa", "slogan", "telefone", "email", "site", "instagram", "endereco"];

  // Secções principais alternadas por botão (visual "uma de cada vez", em vez de scroll longo).
  var SECTION_IDS = ["categorias", "editor", "projetos", "ajuda", "depoimentos"];

  function showSection(id, skipScroll) {
    if (SECTION_IDS.indexOf(id) === -1) return;
    SECTION_IDS.forEach(function (sid) {
      var el = document.getElementById(sid);
      if (el) el.classList.toggle("is-active", sid === id);
    });
    document.querySelectorAll('[data-nav][data-section]').forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-section") === id);
    });
    if (!skipScroll) {
      var header = document.querySelector(".site-header");
      var target = document.getElementById(id);
      if (target) {
        var y = target.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0) - 8;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* file:// ou navegador antigo, ignora */ }
  }

  /* ---------------------------------------------------------
     Estado
     --------------------------------------------------------- */
  var state = {
    templateId: TEMPLATES[0].id,
    formatId: "card",
    side: "front",
    fields: Object.assign({}, CATEGORIES[0].defaults),
    colorOverride: { primary: "", secondary: "" },
    logo: null,
    includeQr: true,
    currentProjectId: null,
    projects: [],
    cart: []
  };

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function getTemplate(id) {
    var t = null;
    for (var i = 0; i < TEMPLATES.length; i++) { if (TEMPLATES[i].id === id) { t = TEMPLATES[i]; break; } }
    return t || TEMPLATES[0];
  }
  function getCategory(id) {
    var c = null;
    for (var i = 0; i < CATEGORIES.length; i++) { if (CATEGORIES[i].id === id) { c = CATEGORIES[i]; break; } }
    return c || CATEGORIES[0];
  }
  function getFormat(id) {
    var f = null;
    for (var i = 0; i < FORMATS.length; i++) { if (FORMATS[i].id === id) { f = FORMATS[i]; break; } }
    return f || FORMATS[0];
  }
  function templatesByCategory(catId) {
    return TEMPLATES.filter(function (t) { return !catId || catId === "all" || t.category === catId; });
  }
  function effectiveColors(tpl) {
    var c = tpl.colors;
    var primary = state.colorOverride.primary || c.primary;
    return {
      primary: primary,
      secondary: state.colorOverride.secondary || c.secondary,
      bg: c.bg, bgBack: c.bgBack || c.bg, text: c.text, textSoft: c.textSoft,
      textBack: c.textBack || c.text, textSoftBack: c.textSoftBack || c.textSoft,
      icon: c.iconAccent || primary,
      iconBack: c.iconAccentBack || c.iconAccent || primary,
      font: tpl.font || "'Inter', -apple-system, sans-serif"
    };
  }
  function uid() { return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8); }

  /* ---------------------------------------------------------
     Render: categorias
     --------------------------------------------------------- */
  function renderCategories() {
    var grid = $("#category-grid");
    grid.innerHTML = CATEGORIES.map(function (cat) {
      var count = templatesByCategory(cat.id).length;
      return '<button type="button" class="category-card" data-cat="' + cat.id + '" ' +
        'style="--cat-color:' + cat.color + '; --cat-icon-bg:' + cat.color + '2e;">' +
        '<span class="cat-count">' + count + " modelo" + (count === 1 ? "" : "s") + '</span>' +
        '<span class="cat-icon">' + iconSVG(cat.icon) + '</span>' +
        "<h3>" + escapeHtml(cat.name) + "</h3>" +
        "<p>" + escapeHtml(cat.description) + "</p>" +
        "</button>";
    }).join("");

    $all(".category-card", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { applyCategory(btn.getAttribute("data-cat"), true); });
    });
  }

  /* ---------------------------------------------------------
     Render: filtro + picker de templates
     --------------------------------------------------------- */
  function renderTemplateFilter() {
    var sel = $("#template-category-filter");
    var opts = ['<option value="all">Todos os segmentos</option>'].concat(
      CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + escapeHtml(c.name) + "</option>"; })
    );
    sel.innerHTML = opts.join("");
    sel.value = getTemplate(state.templateId).category;
    sel.addEventListener("change", function () { renderTemplatePicker(); });
    $("#template-search").addEventListener("input", function () { renderTemplatePicker(); });
  }

  function renderTemplatePicker(filterCat) {
    filterCat = filterCat || $("#template-category-filter").value || "all";
    var search = $("#template-search").value.trim().toLowerCase();
    var list = templatesByCategory(filterCat);
    if (search) {
      list = list.filter(function (tpl) {
        return tpl.name.toLowerCase().indexOf(search) !== -1 ||
          getCategory(tpl.category).name.toLowerCase().indexOf(search) !== -1;
      });
    }
    var picker = $("#template-picker");
    $("#template-empty").classList.toggle("hidden", list.length > 0);
    picker.innerHTML = list.map(function (tpl) {
      var cat = getCategory(tpl.category);
      var active = tpl.id === state.templateId ? " active" : "";
      return '<button type="button" class="template-chip' + active + '" data-tpl="' + tpl.id + '">' +
        '<span class="swatch" style="background:linear-gradient(135deg,' + tpl.colors.primary + ',' + (tpl.colors.secondary || tpl.colors.primary) + ')"></span>' +
        '<span class="tpl-name">' + escapeHtml(tpl.name) + "</span>" +
        '<span class="tpl-cat">' + escapeHtml(cat.name) + "</span>" +
        "</button>";
    }).join("");

    $all(".template-chip", picker).forEach(function (btn) {
      btn.addEventListener("click", function () { selectTemplate(btn.getAttribute("data-tpl")); });
    });
  }

  /* ---------------------------------------------------------
     Render: abas de formato / lado
     --------------------------------------------------------- */
  function renderFormatTabs() {
    var box = $("#format-tabs");
    box.innerHTML = FORMATS.map(function (f) {
      var active = f.id === state.formatId ? " active" : "";
      return '<button type="button" class="' + active.trim() + '" data-format="' + f.id + '">' + f.label + "</button>";
    }).join("");
    $all("button", box).forEach(function (btn) {
      btn.addEventListener("click", function () { selectFormat(btn.getAttribute("data-format")); });
    });
  }

  function renderSideTabs() {
    var box = $("#side-tabs");
    var isCard = getFormat(state.formatId).type === "card";
    box.classList.toggle("hidden", !isCard);
    box.innerHTML =
      '<button type="button" data-side="front" class="' + (state.side === "front" ? "active" : "") + '">Frente</button>' +
      '<button type="button" data-side="back" class="' + (state.side === "back" ? "active" : "") + '">Verso</button>';
    $all("button", box).forEach(function (btn) {
      btn.addEventListener("click", function () { state.side = btn.getAttribute("data-side"); renderBoard(); renderSideTabs(); });
    });
    $("#format-label").textContent = getFormat(state.formatId).label;
  }

  /* ---------------------------------------------------------
     Render: campos de formulário
     --------------------------------------------------------- */
  function fillFormFromState() {
    FIELD_KEYS.forEach(function (k) {
      var input = $("#f-" + k);
      if (input) input.value = state.fields[k] || "";
    });
    var tpl = getTemplate(state.templateId);
    $("#f-color-primary").value = state.colorOverride.primary || tpl.colors.primary;
    $("#f-color-secondary").value = state.colorOverride.secondary || (tpl.colors.secondary || tpl.colors.primary);
  }

  function bindForm() {
    FIELD_KEYS.forEach(function (k) {
      var input = $("#f-" + k);
      input.addEventListener("input", function () {
        state.fields[k] = input.value;
        renderBoard();
      });
    });
    $("#f-color-primary").addEventListener("input", function (e) { state.colorOverride.primary = e.target.value; renderBoard(); });
    $("#f-color-secondary").addEventListener("input", function (e) { state.colorOverride.secondary = e.target.value; renderBoard(); });
    $("#reset-colors").addEventListener("click", function () {
      state.colorOverride = { primary: "", secondary: "" };
      fillFormFromState();
      renderBoard();
    });
    $("#f-logo").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () { state.logo = reader.result; renderBoard(); };
      reader.readAsDataURL(file);
    });
    $("#remove-logo").addEventListener("click", function () {
      state.logo = null;
      $("#f-logo").value = "";
      renderBoard();
    });
  }

  /* ---------------------------------------------------------
     Construção do cartão (frente / verso)
     --------------------------------------------------------- */
  function logoOrIcon(tpl, colors, size, extraClass) {
    if (state.logo) {
      return '<span class="icon-wrap logo-img ' + (extraClass || "") + '" style="width:' + size + 'px;height:' + size + 'px;">' +
        '<img src="' + state.logo + '" alt="Logotipo" /></span>';
    }
    return '<span class="icon-wrap ' + (extraClass || "") + '" style="width:' + size + 'px;height:' + size + 'px;">' + iconSVG(tpl.icon) + "</span>";
  }

  function buildCardFront(tpl, colors, f) {
    var layout = "layout-" + tpl.layout;
    var body = "";
    var nome = '<div class="cf-nome">' + escapeHtml(f.nome || "Seu Nome") + "</div>";
    var cargo = '<div class="cf-cargo">' + escapeHtml(f.cargo || "Cargo / Função") + "</div>";
    var empresa = '<div class="cf-empresa">' + escapeHtml(f.empresa || "Empresa") + "</div>";

    if (tpl.layout === "split") {
      body = '<div class="cf-side">' + logoOrIcon(tpl, colors, 40) + "</div>" +
        '<div class="cf-main">' + nome + cargo + empresa + "</div>";
    } else if (tpl.layout === "topbar") {
      body = '<div class="cf-top">' + logoOrIcon(tpl, colors, 20) + "<span>" + escapeHtml((f.empresa || "EMPRESA").toUpperCase()) + "</span></div>" +
        '<div class="cf-main">' + nome + cargo + empresa + "</div><div class=\"cf-accent\"></div>";
    } else if (tpl.layout === "diagonal") {
      body = logoOrIcon(tpl, colors, 30, "cf-icon-top") + nome + cargo + empresa;
    } else if (tpl.layout === "frame") {
      body = logoOrIcon(tpl, colors, 34) + nome + cargo + empresa;
    } else { // centered
      body = logoOrIcon(tpl, colors, 34) + nome + cargo + empresa;
    }

    return '<div class="card-face front ' + layout + ' active">' +
      '<div class="bg-pattern pattern-' + tpl.pattern + '"></div>' +
      '<div class="cf-inner">' + body + "</div></div>";
  }

  function buildCardBack(tpl, colors, f) {
    var rows = [
      ["phone", f.telefone], ["mail", f.email], ["globe", f.site],
      ["instagram", f.instagram], ["pin", f.endereco]
    ].filter(function (r) { return r[1]; }).map(function (r) {
      return '<div class="cb-row">' + '<span class="icon-wrap">' + iconSVG(r[0]) + "</span><span>" + escapeHtml(r[1]) + "</span></div>";
    }).join("");

    return '<div class="card-face back">' +
      '<div class="bg-pattern pattern-' + tpl.pattern + '"></div>' +
      '<div class="cb-inner">' +
      '<div class="cb-header">' + logoOrIcon(tpl, colors, 22) + "<strong>" + escapeHtml(f.empresa || "Empresa") + "</strong></div>" +
      (f.slogan ? '<div class="cb-slogan">"' + escapeHtml(f.slogan) + '"</div>' : "") +
      rows +
      "</div>" +
      (state.includeQr ? '<div class="cb-qr"></div>' : "") +
      '<div class="cb-bar"></div></div>';
  }

  /* ---------------------------------------------------------
     Cartão digital (vCard + QR code)
     --------------------------------------------------------- */
  function vcardEscape(s) {
    return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  function buildVCard(f) {
    var url = f.site ? (/^https?:\/\//i.test(f.site) ? f.site : "http://" + f.site) : "";
    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:;" + vcardEscape(f.nome) + ";;;",
      "FN:" + vcardEscape(f.nome || "Contacto"),
      f.empresa ? "ORG:" + vcardEscape(f.empresa) : "",
      f.cargo ? "TITLE:" + vcardEscape(f.cargo) : "",
      f.telefone ? "TEL;TYPE=CELL:" + vcardEscape(f.telefone) : "",
      f.email ? "EMAIL:" + vcardEscape(f.email) : "",
      url ? "URL:" + vcardEscape(url) : "",
      f.endereco ? "ADR;TYPE=WORK:;;" + vcardEscape(f.endereco) + ";;;;" : "",
      f.slogan ? "NOTE:" + vcardEscape(f.slogan) : "",
      "END:VCARD"
    ].filter(Boolean);
    return lines.join("\n");
  }

  function renderQrInto(el, text, size) {
    if (!el) return;
    el.innerHTML = "";
    if (typeof window.QRCode !== "function" || !text) return;
    try {
      new window.QRCode(el, {
        text: text, width: size, height: size,
        colorDark: "#000000", colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M
      });
    } catch (e) { /* falha a gerar o QR (biblioteca não carregou?) — ignora, o resto do cartão continua normal */ }
  }

  function openDigitalCard() {
    var f = state.fields;
    $("#digitalcard-name").textContent = f.nome || f.empresa || "Cartão Digital";
    renderQrInto($("#digitalcard-qr"), buildVCard(f), 220);
    $("#digitalcard-modal").classList.remove("hidden");
  }
  function closeDigitalCard() { $("#digitalcard-modal").classList.add("hidden"); }

  function downloadVCard() {
    var blob = new Blob([buildVCard(state.fields)], { type: "text/vcard" });
    var link = document.createElement("a");
    link.download = fileBaseName() + ".vcf";
    link.href = URL.createObjectURL(blob);
    link.click();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 4000);
  }

  function downloadQrPng() {
    var canvas = $("#digitalcard-qr canvas");
    if (!canvas) { flashStatus("O QR ainda não está pronto."); return; }
    var link = document.createElement("a");
    link.download = fileBaseName() + "-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function buildAdBoard(tpl, colors, f) {
    var footerRows = [
      ["pin", f.endereco], ["phone", f.telefone], ["globe", f.site], ["instagram", f.instagram]
    ].filter(function (r) { return r[1]; }).map(function (r) {
      return '<span class="cb-row"><span class="icon-wrap">' + iconSVG(r[0]) + "</span>" + escapeHtml(r[1]) + "</span>";
    }).join("");

    return '<div class="ad-board">' +
      '<div class="bg-pattern pattern-' + tpl.pattern + '"></div>' +
      '<div class="ad-inner">' +
      '<div class="ad-head">' + logoOrIcon(tpl, colors, 22) + "<span>" + escapeHtml((f.empresa || "EMPRESA").toUpperCase()) + "</span></div>" +
      '<div class="ad-body">' + logoOrIcon(tpl, colors, 52, "big") +
      '<div class="ad-headline">' + escapeHtml(f.slogan || f.empresa || "Sua marca em destaque") + "</div>" +
      (f.cargo || f.nome ? '<div class="ad-sub">' + escapeHtml([f.cargo, f.nome].filter(Boolean).join(" • ")) + "</div>" : "") +
      "</div>" +
      (footerRows ? '<div class="ad-footer">' + footerRows + "</div>" : "") +
      "</div></div>";
  }

  /* ---------------------------------------------------------
     Render principal do board
     --------------------------------------------------------- */
  function renderBoard(target) {
    var board = target || $("#art-board");
    var tpl = getTemplate(state.templateId);
    var colors = effectiveColors(tpl);
    var format = getFormat(state.formatId);
    var f = state.fields;

    board.setAttribute("data-format", format.id);
    board.style.setProperty("--tpl-primary", colors.primary);
    board.style.setProperty("--tpl-secondary", colors.secondary);
    board.style.setProperty("--tpl-bg", colors.bg);
    board.style.setProperty("--tpl-bg-back", colors.bgBack);
    board.style.setProperty("--tpl-text", colors.text);
    board.style.setProperty("--tpl-text-soft", colors.textSoft);
    board.style.setProperty("--tpl-text-back", colors.textBack);
    board.style.setProperty("--tpl-text-soft-back", colors.textSoftBack);
    board.style.setProperty("--tpl-icon", colors.icon);
    board.style.setProperty("--tpl-icon-back", colors.iconBack);
    board.style.setProperty("--tpl-font", colors.font);

    if (format.type === "card") {
      board.innerHTML = buildCardFront(tpl, colors, f) + buildCardBack(tpl, colors, f);
      $all(".card-face", board).forEach(function (el) {
        var isFront = el.classList.contains("front");
        el.classList.toggle("active", (isFront && state.side === "front") || (!isFront && state.side === "back"));
      });
      if (state.includeQr) renderQrInto(board.querySelector(".cb-qr"), buildVCard(f), 92);
    } else {
      board.innerHTML = buildAdBoard(tpl, colors, f);
    }

    if (!target) {
      $("#template-name").textContent = tpl.name + " — " + getCategory(tpl.category).name;
    }
  }

  /* ---------------------------------------------------------
     Seleções
     --------------------------------------------------------- */
  function applyCategory(catId, scroll) {
    var list = templatesByCategory(catId);
    if (!list.length) return;
    state.currentProjectId = null;
    state.logo = null;
    $("#f-logo").value = "";
    $("#template-search").value = "";
    $("#template-category-filter").value = catId;
    renderTemplatePicker(catId);
    state.fields = Object.assign({}, getCategory(catId).defaults);
    selectTemplate(list[0].id, true);
    if (scroll) showSection("editor");
  }

  function selectTemplate(id, skipFieldReset) {
    state.templateId = id;
    state.colorOverride = { primary: "", secondary: "" };
    $("#template-category-filter").value = getTemplate(id).category;
    renderTemplatePicker($("#template-category-filter").value);
    fillFormFromState();
    renderBoard();
    if (!skipFieldReset) { /* keep current text fields */ }
  }

  function selectFormat(id) {
    state.formatId = id;
    renderFormatTabs();
    renderSideTabs();
    renderBoard();
    var buyBlock = $("#buy-print-block");
    if (buyBlock) buyBlock.style.display = getFormat(id).printable ? "" : "none";
    var qrRow = $("#include-qr-row");
    if (qrRow) qrRow.style.display = getFormat(id).type === "card" ? "" : "none";
    renderAddQtyOptions();
  }

  /* ---------------------------------------------------------
     Projetos (localStorage)
     --------------------------------------------------------- */
  function loadProjects() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      state.projects = raw ? JSON.parse(raw) : [];
    } catch (e) { state.projects = []; }
  }
  function persistProjects() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.projects)); } catch (e) { /* ignora quota excedida */ }
  }

  function currentProjectSnapshot(name) {
    return {
      id: state.currentProjectId || uid(),
      name: name,
      templateId: state.templateId,
      formatId: state.formatId,
      fields: Object.assign({}, state.fields),
      colorOverride: Object.assign({}, state.colorOverride),
      logo: state.logo,
      includeQr: state.includeQr,
      updatedAt: Date.now()
    };
  }

  function saveCurrentProject() {
    var suggestion = state.fields.empresa || state.fields.nome || "Meu Projeto";
    var name = window.prompt("Nome do projeto:", suggestion);
    if (name === null) return;
    name = name.trim() || suggestion;

    var snap = currentProjectSnapshot(name);
    var idx = state.projects.findIndex(function (p) { return p.id === snap.id; });
    if (idx >= 0) state.projects[idx] = snap; else state.projects.push(snap);
    state.currentProjectId = snap.id;
    persistProjects();
    renderProjects();
    flashStatus("Projeto \"" + name + "\" salvo.");
  }

  function loadProject(id) {
    var p = state.projects.find(function (x) { return x.id === id; });
    if (!p) return;
    state.currentProjectId = p.id;
    state.templateId = p.templateId;
    state.formatId = p.formatId;
    state.fields = Object.assign({}, p.fields);
    state.colorOverride = Object.assign({ primary: "", secondary: "" }, p.colorOverride);
    state.logo = p.logo || null;
    state.includeQr = p.includeQr !== false;
    state.side = "front";

    renderFormatTabs(); renderSideTabs();
    $("#template-category-filter").value = getTemplate(state.templateId).category;
    renderTemplatePicker(state.templateId ? getTemplate(state.templateId).category : "all");
    fillFormFromState();
    var qrCheckbox = $("#f-include-qr");
    if (qrCheckbox) qrCheckbox.checked = state.includeQr;
    renderBoard();
    showSection("editor");
    flashStatus("Projeto \"" + p.name + "\" carregado no editor.");
  }

  function duplicateProject(id) {
    var p = state.projects.find(function (x) { return x.id === id; });
    if (!p) return;
    var copy = Object.assign({}, p, { id: uid(), name: p.name + " (cópia)", updatedAt: Date.now() });
    state.projects.push(copy);
    persistProjects();
    renderProjects();
  }

  function deleteProject(id) {
    if (!window.confirm("Excluir este projeto? Essa ação não pode ser desfeita.")) return;
    state.projects = state.projects.filter(function (p) { return p.id !== id; });
    if (state.currentProjectId === id) state.currentProjectId = null;
    persistProjects();
    renderProjects();
  }

  function renderProjects() {
    var grid = $("#projects-grid");
    if (!state.projects.length) {
      grid.innerHTML = '<p id="projects-empty" class="empty-note">Você ainda não salvou nenhum projeto. ' +
        'Personalize um cartão no editor e clique em "Salvar Projeto".</p>';
      return;
    }
    grid.innerHTML = "";

    state.projects
      .slice()
      .sort(function (a, b) { return b.updatedAt - a.updatedAt; })
      .forEach(function (p) {
        var tpl = getTemplate(p.templateId);
        var card = document.createElement("div");
        card.className = "project-card";
        var date = new Date(p.updatedAt).toLocaleDateString("pt-BR");
        card.innerHTML =
          '<div class="project-thumb"><div class="art-board" data-format="' + p.formatId + '"></div></div>' +
          '<div class="project-info"><strong>' + escapeHtml(p.name) + "</strong>" +
          "<span>" + escapeHtml(tpl.name) + " · " + escapeHtml(getFormat(p.formatId).label) + " · " + date + "</span></div>" +
          '<div class="project-actions">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-act="edit">Editar</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="dup">Duplicar</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-act="del">Excluir</button>' +
          "</div>";
        grid.appendChild(card);

        // renderiza miniatura isolada
        var prevState = { templateId: state.templateId, formatId: state.formatId, fields: state.fields, colorOverride: state.colorOverride, logo: state.logo, side: state.side };
        state.templateId = p.templateId; state.formatId = p.formatId; state.fields = p.fields; state.colorOverride = p.colorOverride; state.logo = p.logo; state.side = "front";
        renderBoard(card.querySelector(".art-board"));
        state.templateId = prevState.templateId; state.formatId = prevState.formatId; state.fields = prevState.fields; state.colorOverride = prevState.colorOverride; state.logo = prevState.logo; state.side = prevState.side;

        card.querySelector('[data-act="edit"]').addEventListener("click", function () { loadProject(p.id); });
        card.querySelector('[data-act="dup"]').addEventListener("click", function () { duplicateProject(p.id); });
        card.querySelector('[data-act="del"]').addEventListener("click", function () { deleteProject(p.id); });
      });
  }

  /* ---------------------------------------------------------
     Depoimentos
     --------------------------------------------------------- */
  function starsHtml(rating) {
    var n = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
    if (!n) return "";
    var out = "";
    for (var i = 0; i < 5; i++) out += i < n ? "★" : "☆";
    return '<span class="testimonial-stars" aria-hidden="true">' + out + "</span>";
  }

  function renderTestimonials() {
    var list = $("#testimonials-list");
    if (!list) return;
    fetch("/api/testimonials")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var items = (data && data.testimonials) || [];
        if (!items.length) {
          list.innerHTML = '<p id="testimonials-empty" class="empty-note">Ainda sem depoimentos publicados.</p>';
          return;
        }
        list.innerHTML = items
          .map(function (t) {
            return (
              '<div class="testimonial-card">' +
              starsHtml(t.rating) +
              '<p class="testimonial-quote">"' + escapeHtml(t.quote) + '"</p>' +
              '<p class="testimonial-author"><strong>' + escapeHtml(t.author_name) + "</strong>" +
              (t.company ? " · " + escapeHtml(t.company) : "") +
              "</p>" +
              "</div>"
            );
          })
          .join("");
      })
      .catch(function () {
        list.innerHTML = '<p class="empty-note">Não foi possível carregar os depoimentos agora.</p>';
      });
  }

  /* ---------------------------------------------------------
     Exportação
     --------------------------------------------------------- */
  function flashStatus(msg) {
    var el = $("#editor-status");
    el.textContent = msg;
    window.clearTimeout(flashStatus._t);
    flashStatus._t = window.setTimeout(function () { el.textContent = ""; }, 3500);
  }

  function fileBaseName() {
    var base = (state.fields.empresa || state.fields.nome || "uniads").toLowerCase();
    return base.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "uniads";
  }

  function downloadPNG() {
    if (typeof window.html2canvas !== "function") {
      flashStatus("Não foi possível carregar o exportador de imagem (sem conexão?).");
      return;
    }
    var board = $("#art-board");
    flashStatus("Gerando imagem...");
    window.html2canvas(board, { scale: 3, backgroundColor: null, useCORS: true }).then(function (canvas) {
      var link = document.createElement("a");
      link.download = fileBaseName() + "-" + state.formatId + (getFormat(state.formatId).type === "card" ? "-" + state.side : "") + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      flashStatus("Imagem baixada com sucesso.");
    }).catch(function () {
      flashStatus("Falha ao gerar a imagem. Tente novamente.");
    });
  }

  // Dimensões reais de impressão (mm) por formato — usadas para gerar um PDF no
  // tamanho exato do produto físico, em vez de uma folha genérica A4.
  var PRINT_SIZE_MM = {
    card: { w: 85, h: 55 },
    flyer: { w: 148, h: 210 },
    post: { w: 100, h: 100 },
    story: { w: 100, h: 177.8 },
    convite: { w: 105, h: 148 },
    "convite-digital": { w: 105, h: 148 }
  };

  function downloadPDF() {
    if (typeof window.html2canvas !== "function") {
      flashStatus("Não foi possível carregar o exportador de imagem (sem conexão?).");
      return;
    }
    if (!window.jspdf || typeof window.jspdf.jsPDF !== "function") {
      flashStatus("Não foi possível carregar o exportador de PDF (sem conexão?).");
      return;
    }
    var board = $("#art-board");
    var size = PRINT_SIZE_MM[state.formatId] || PRINT_SIZE_MM.card;
    flashStatus("Gerando PDF...");
    window.html2canvas(board, { scale: 4, backgroundColor: "#ffffff", useCORS: true }).then(function (canvas) {
      var orientation = size.w >= size.h ? "landscape" : "portrait";
      var pdf = new window.jspdf.jsPDF({ orientation: orientation, unit: "mm", format: [size.w, size.h] });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, size.w, size.h);
      pdf.save(fileBaseName() + "-" + state.formatId + (getFormat(state.formatId).type === "card" ? "-" + state.side : "") + ".pdf");
      flashStatus("PDF baixado com sucesso.");
    }).catch(function () {
      flashStatus("Falha ao gerar o PDF. Tente novamente.");
    });
  }

  function shareBoard() {
    if (typeof window.html2canvas !== "function") {
      flashStatus("Não foi possível carregar o exportador de imagem (sem conexão?).");
      return;
    }
    var board = $("#art-board");
    flashStatus("A preparar imagem para partilhar...");
    window.html2canvas(board, { scale: 3, backgroundColor: null, useCORS: true }).then(function (canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) { flashStatus("Falha ao gerar a imagem."); return; }
        var fileName = fileBaseName() + "-" + state.formatId + ".png";
        var file = new File([blob], fileName, { type: "image/png" });
        var shareData = {
          files: [file],
          title: state.fields.empresa || "UniAds Studio",
          text: state.fields.slogan || "Feito com UniAds Studio"
        };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share(shareData).then(function () {
            flashStatus("Partilhado com sucesso.");
          }).catch(function (err) {
            if (err && err.name !== "AbortError") flashStatus("Não foi possível partilhar.");
          });
        } else {
          flashStatus("Este navegador não suporta partilha direta — a imagem foi baixada.");
          var link = document.createElement("a");
          link.download = fileName;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      }, "image/png");
    }).catch(function () {
      flashStatus("Falha ao gerar a imagem. Tente novamente.");
    });
  }

  var THEME_KEY = "uniads_theme";
  function themeLabel(theme) {
    var key = theme === "light" ? "theme.dark" : "theme.light";
    return window.UniI18n ? window.UniI18n.t(key) : (theme === "light" ? "Modo escuro" : "Modo claro");
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = $("#theme-toggle");
    if (btn) btn.textContent = themeLabel(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* sem localStorage, não persiste */ }
  }
  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignora */ }
    applyTheme(saved === "light" ? "light" : "dark");
  }

  function openZoom() {
    var stage = $("#zoom-stage");
    stage.innerHTML = '<div class="art-board"></div>';
    renderBoard(stage.querySelector(".art-board"));
    $("#zoom-modal").classList.remove("hidden");
  }
  function closeZoom() { $("#zoom-modal").classList.add("hidden"); }

  function printBoard() {
    var existing = document.getElementById("print-target");
    if (existing) existing.remove();
    var wrapper = document.createElement("div");
    wrapper.id = "print-target";
    var clone = $("#art-board").cloneNode(true);
    clone.style.width = "";
    clone.style.transform = "";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    window.print();
    window.setTimeout(function () { wrapper.remove(); }, 500);
  }

  /* ---------------------------------------------------------
     Hero mini previews
     --------------------------------------------------------- */
  function renderHeroPreview() {
    var box = $("#hero-preview");
    var picks = [TEMPLATES[0], TEMPLATES[2], TEMPLATES[4]];
    box.innerHTML = picks.map(function () { return '<div class="mini-card"></div>'; }).join("");
    var mini = $all(".mini-card", box);
    picks.forEach(function (tpl, i) {
      var el = mini[i];
      el.style.setProperty("--tpl-primary", tpl.colors.primary);
      el.style.setProperty("--tpl-secondary", tpl.colors.secondary || tpl.colors.primary);
      el.style.setProperty("--tpl-bg", tpl.colors.bg);
      el.style.setProperty("--tpl-text", tpl.colors.text);
      el.style.setProperty("--tpl-font", tpl.font || "'Inter', sans-serif");
      el.style.background = tpl.colors.bg;
      el.style.overflow = "hidden";
      el.setAttribute("data-format", "card");
      var f = getCategory(tpl.category).defaults;
      el.innerHTML = buildCardFront(tpl, effectiveColorsForTpl(tpl), f);
    });
  }
  function effectiveColorsForTpl(tpl) {
    return { primary: tpl.colors.primary, secondary: tpl.colors.secondary || tpl.colors.primary, bg: tpl.colors.bg, bgBack: tpl.colors.bgBack || tpl.colors.bg, text: tpl.colors.text, textSoft: tpl.colors.textSoft, font: tpl.font || "'Inter', sans-serif" };
  }

  /* ---------------------------------------------------------
     Compra de cartões impressos (Stripe Checkout + Gelato)
     --------------------------------------------------------- */
  function boardToPngBase64() {
    if (typeof window.html2canvas !== "function") {
      return Promise.reject(new Error("Exportador de imagem indisponível (sem conexão?)."));
    }
    return window.html2canvas($("#art-board"), { scale: 3, backgroundColor: "#ffffff", useCORS: true })
      .then(function (canvas) { return canvas.toDataURL("image/png"); });
  }

  /* ---------------------------------------------------------
     Tabela de preços (pública, só para mostrar subtotais — o preço
     cobrado é sempre recalculado no servidor)
     --------------------------------------------------------- */
  var priceState = { table: {}, currency: "eur" };
  function loadPriceTable() {
    return fetch("/api/prices")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        priceState.table = data.table || {};
        priceState.currency = data.currency || "eur";
      })
      .catch(function () { /* mantém tabela vazia — preços simplesmente não aparecem */ });
  }
  function priceFor(format, qty) {
    var forFormat = priceState.table[format];
    return forFormat && forFormat[qty] != null ? forFormat[qty] : null;
  }
  function formatMoney(cents) {
    return ((cents || 0) / 100).toLocaleString("pt-PT", { style: "currency", currency: (priceState.currency || "eur").toUpperCase() });
  }

  function renderAddQtyOptions() {
    var sel = $("#add-qty");
    if (!sel) return;
    var format = getFormat(state.formatId);
    if (!format.printable) { sel.innerHTML = ""; return; }
    sel.innerHTML = format.printQuantities.map(function (q) {
      var cents = priceFor(format.id, q);
      var label = format.digitalOnly ? "Convite digital" : q + " unidades";
      return '<option value="' + q + '">' + label + (cents != null ? " — " + formatMoney(cents) : "") + "</option>";
    }).join("");
  }

  /* ---------------------------------------------------------
     Carrinho (vários designs/formatos numa só compra)
     --------------------------------------------------------- */
  var CART_STORAGE_KEY = "uniads_cart_v1";
  var CART_MAX_ITEMS = 10;

  function loadCart() {
    try {
      var raw = localStorage.getItem(CART_STORAGE_KEY);
      state.cart = raw ? JSON.parse(raw) : [];
    } catch (e) { state.cart = []; }
  }
  function persistCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
    } catch (e) {
      flashStatus("Não foi possível guardar o carrinho (armazenamento cheio?).");
    }
  }
  function updateCartBadge() {
    var badge = $("#cart-count");
    if (!badge) return;
    badge.textContent = state.cart.length;
    badge.classList.toggle("hidden", state.cart.length === 0);
  }

  function addToCart() {
    var format = getFormat(state.formatId);
    if (!format.printable) return;
    if (state.cart.length >= CART_MAX_ITEMS) {
      flashStatus("Máximo de " + CART_MAX_ITEMS + " itens no carrinho.");
      return;
    }
    var qty = parseInt($("#add-qty").value, 10);
    if (!qty) return;

    flashStatus("A adicionar ao carrinho...");
    boardToPngBase64()
      .then(function (imageBase64) {
        var tpl = getTemplate(state.templateId);
        state.cart.push({
          id: uid(),
          templateId: state.templateId,
          templateName: tpl.name,
          formatId: state.formatId,
          formatLabel: format.label,
          fields: Object.assign({}, state.fields),
          colorOverride: Object.assign({}, state.colorOverride),
          logo: state.logo,
          includeQr: state.includeQr,
          quantity: qty,
          amountCents: priceFor(format.id, qty),
          imageBase64: imageBase64
        });
        persistCart();
        updateCartBadge();
        flashStatus("Adicionado ao carrinho.");
      })
      .catch(function () {
        flashStatus("Não foi possível preparar a arte para o carrinho.");
      });
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(function (it) { return it.id !== id; });
    persistCart();
    updateCartBadge();
    renderCartModal();
  }

  function cartTotalCents() {
    return state.cart.reduce(function (sum, it) { return sum + (it.amountCents || 0); }, 0);
  }

  function renderCartModal() {
    var wrap = $("#cart-items");
    if (!state.cart.length) {
      wrap.innerHTML = '<p class="empty-note">O carrinho está vazio. Adiciona um design no editor.</p>';
    } else {
      wrap.innerHTML = state.cart.map(function (it) {
        return (
          '<div class="cart-item" data-id="' + it.id + '">' +
          '<div class="cart-item-thumb"><div class="art-board" data-format="' + it.formatId + '"></div></div>' +
          '<div class="cart-item-info"><strong>' + escapeHtml(it.templateName) + "</strong>" +
          "<span>" + escapeHtml(it.formatLabel) + " · " + it.quantity + " un.</span>" +
          "<span>" + (it.amountCents != null ? formatMoney(it.amountCents) : "—") + "</span></div>" +
          '<button type="button" class="cart-item-remove" data-remove="' + it.id + '" aria-label="Remover">&times;</button>' +
          "</div>"
        );
      }).join("");

      state.cart.forEach(function (it) {
        var board = wrap.querySelector('.cart-item[data-id="' + it.id + '"] .art-board');
        if (!board) return;
        var prev = { templateId: state.templateId, formatId: state.formatId, fields: state.fields, colorOverride: state.colorOverride, logo: state.logo, includeQr: state.includeQr, side: state.side };
        state.templateId = it.templateId; state.formatId = it.formatId; state.fields = it.fields;
        state.colorOverride = it.colorOverride; state.logo = it.logo; state.includeQr = it.includeQr; state.side = "front";
        renderBoard(board);
        state.templateId = prev.templateId; state.formatId = prev.formatId; state.fields = prev.fields;
        state.colorOverride = prev.colorOverride; state.logo = prev.logo; state.includeQr = prev.includeQr; state.side = prev.side;
      });

      wrap.querySelectorAll("[data-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () { removeFromCart(btn.getAttribute("data-remove")); });
      });
    }
    $("#cart-total-value").textContent = state.cart.length ? formatMoney(cartTotalCents()) : "—";
  }

  function openCart() { renderCartModal(); $("#cart-modal").classList.remove("hidden"); }
  function closeCart() { $("#cart-modal").classList.add("hidden"); }

  /* ---------------------------------------------------------
     Checkout (Stripe Checkout + Gelato) — todos os itens do carrinho
     --------------------------------------------------------- */
  function renderCheckoutSummary() {
    var box = $("#checkout-summary");
    box.innerHTML = state.cart.map(function (it) {
      var digitalTag = isDigitalOnlyFormat(it.formatId) ? " (digital)" : "";
      return (
        '<div class="cs-row"><span>' + escapeHtml(it.templateName) + " · " + it.quantity + " un." + digitalTag + "</span><span>" +
        (it.amountCents != null ? formatMoney(it.amountCents) : "—") + "</span></div>"
      );
    }).join("") + '<div class="cs-row cs-total"><span>Total</span><span>' + formatMoney(cartTotalCents()) + "</span></div>";
  }

  function cartIsAllDigital() {
    return state.cart.length > 0 && state.cart.every(function (it) { return isDigitalOnlyFormat(it.formatId); });
  }

  function openCheckoutModal() {
    if (!state.cart.length) {
      flashStatus("O carrinho está vazio.");
      return;
    }
    $("#checkout-status").textContent = "";
    $("#co-email").value = "";
    renderCheckoutSummary();

    var allDigital = cartIsAllDigital();
    $("#checkout-shipping-fields").classList.toggle("hidden", allDigital);
    $("#checkout-digital-note").classList.toggle("hidden", !allDigital);
    ["#co-address1", "#co-city", "#co-postcode", "#co-country"].forEach(function (sel) {
      $(sel).required = !allDigital;
    });

    closeCart();
    $("#checkout-modal").classList.remove("hidden");
  }
  function closeCheckoutModal() { $("#checkout-modal").classList.add("hidden"); }

  function submitCheckout(e) {
    e.preventDefault();
    if (!state.cart.length) return;
    var submitBtn = $("#checkout-submit");
    var statusEl = $("#checkout-status");
    var allDigital = cartIsAllDigital();
    var country = $("#co-country").value.trim().toUpperCase();

    if (!allDigital && !/^[A-Z]{2}$/.test(country)) {
      statusEl.textContent = "Código do país deve ter 2 letras (ex: PT, BR, ES).";
      return;
    }

    var shipping = {
      firstName: $("#co-first-name").value.trim(),
      lastName: $("#co-last-name").value.trim(),
      addressLine1: $("#co-address1").value.trim(),
      addressLine2: $("#co-address2").value.trim(),
      city: $("#co-city").value.trim(),
      postCode: $("#co-postcode").value.trim(),
      country: country,
      phone: $("#co-phone").value.trim(),
      email: $("#co-email").value.trim()
    };

    var items = state.cart.map(function (it) {
      return { templateId: it.templateId, format: it.formatId, quantity: it.quantity, fields: it.fields, imageBase64: it.imageBase64 };
    });

    submitBtn.disabled = true;
    statusEl.textContent = "A abrir o pagamento...";

    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items, shipping: shipping })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok || !result.data.url) throw new Error(result.data.error || "Falha ao iniciar o pagamento.");
        state.cart = [];
        persistCart();
        window.location.href = result.data.url;
      })
      .catch(function (err) {
        statusEl.textContent = err.message || "Não foi possível iniciar o pagamento. Tenta novamente.";
        submitBtn.disabled = false;
      });
  }

  /* ---------------------------------------------------------
     Novo projeto
     --------------------------------------------------------- */
  function newProject() {
    state.currentProjectId = null;
    state.logo = null;
    state.colorOverride = { primary: "", secondary: "" };
    state.formatId = "card";
    state.side = "front";
    applyCategory(CATEGORIES[0].id, false);
    selectFormat("card");
    showSection("editor");
    flashStatus("Novo projeto iniciado.");
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    $("#stat-templates").textContent = TEMPLATES.length;
    $("#stat-categories").textContent = CATEGORIES.length;
    $("#stat-formats").textContent = FORMATS.length;

    renderCategories();
    renderTemplateFilter();
    renderTemplatePicker("all");
    renderFormatTabs();
    renderSideTabs();
    bindForm();
    fillFormFromState();
    renderBoard();
    renderHeroPreview();

    loadProjects();
    renderProjects();
    renderTestimonials();

    $("#save-project").addEventListener("click", saveCurrentProject);
    $("#download-png").addEventListener("click", downloadPNG);
    $("#download-pdf").addEventListener("click", downloadPDF);
    $("#print-board").addEventListener("click", printBoard);
    var shareBtn = $("#share-board");
    if (shareBtn) {
      if (navigator.share) shareBtn.addEventListener("click", shareBoard);
      else shareBtn.style.display = "none";
    }
    $("#new-project-btn").addEventListener("click", newProject);

    initTheme();
    $("#theme-toggle").addEventListener("click", toggleTheme);
    document.addEventListener("uniads:langchange", function () {
      var btn = $("#theme-toggle");
      if (btn) btn.textContent = themeLabel(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    });

    $("#zoom-board").addEventListener("click", openZoom);
    $("#zoom-close").addEventListener("click", closeZoom);
    $("#zoom-modal").addEventListener("click", function (e) { if (e.target.id === "zoom-modal") closeZoom(); });

    $("#f-include-qr").addEventListener("change", function (e) { state.includeQr = e.target.checked; renderBoard(); });
    $("#digitalcard-btn").addEventListener("click", openDigitalCard);
    $("#digitalcard-close").addEventListener("click", closeDigitalCard);
    $("#digitalcard-modal").addEventListener("click", function (e) { if (e.target.id === "digitalcard-modal") closeDigitalCard(); });
    $("#digitalcard-download-vcf").addEventListener("click", downloadVCard);
    $("#digitalcard-download-qr").addEventListener("click", downloadQrPng);

    loadCart();
    updateCartBadge();
    loadPriceTable().then(renderAddQtyOptions);
    $("#add-to-cart-btn").addEventListener("click", addToCart);
    $("#cart-btn").addEventListener("click", openCart);
    $("#cart-close").addEventListener("click", closeCart);
    $("#cart-modal").addEventListener("click", function (e) { if (e.target.id === "cart-modal") closeCart(); });
    $("#cart-checkout-btn").addEventListener("click", openCheckoutModal);

    $("#checkout-close").addEventListener("click", closeCheckoutModal);
    $("#checkout-modal").addEventListener("click", function (e) { if (e.target.id === "checkout-modal") closeCheckoutModal(); });
    $("#checkout-form").addEventListener("submit", submitCheckout);
    $("#buy-print-block").style.display = getFormat(state.formatId).printable ? "" : "none";
    $("#include-qr-row").style.display = getFormat(state.formatId).type === "card" ? "" : "none";
    renderAddQtyOptions();

    document.querySelectorAll('[data-nav][data-section]').forEach(function (btn) {
      btn.addEventListener("click", function () { showSection(btn.getAttribute("data-section")); });
    });
    var initialSection = SECTION_IDS.indexOf(window.location.hash.slice(1)) !== -1
      ? window.location.hash.slice(1)
      : "categorias";
    showSection(initialSection, true);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").catch(function () { /* sem PWA, site continua normal */ });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
