const {
  useState,
  useEffect,
  useMemo,
  useCallback
} = React;

/* ---------------------------------------------------------
   SUPABASE CLIENT
--------------------------------------------------------- */
const CONFIG_OK = window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && !window.SUPABASE_CONFIG.url.includes("COLE_AQUI") && window.SUPABASE_CONFIG.anonKey && !window.SUPABASE_CONFIG.anonKey.includes("COLE_AQUI");
const supabase = CONFIG_OK ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey) : null;

/* ---------------------------------------------------------
   FOLHA-GOTA — marca NEC
--------------------------------------------------------- */
function FolhaGota({
  fill = "#FFFFFF",
  stroke = "#1E3A5F",
  size = 32
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 120",
    width: size,
    height: size * 1.2,
    style: {
      display: "block",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 5 C50 5, 10 35, 10 72 C10 95, 28 115, 50 115 C72 115, 90 95, 90 72 C90 35, 50 5, 50 5Z",
    fill: fill,
    stroke: stroke,
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "10",
    x2: "50",
    y2: "110",
    stroke: stroke,
    strokeWidth: "3.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "90",
    x2: "22",
    y2: "72",
    stroke: stroke,
    strokeWidth: "2.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "90",
    x2: "78",
    y2: "72",
    stroke: stroke,
    strokeWidth: "2.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "72",
    x2: "18",
    y2: "54",
    stroke: stroke,
    strokeWidth: "2.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "72",
    x2: "82",
    y2: "54",
    stroke: stroke,
    strokeWidth: "2.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "54",
    x2: "22",
    y2: "38",
    stroke: stroke,
    strokeWidth: "2.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "54",
    x2: "78",
    y2: "38",
    stroke: stroke,
    strokeWidth: "2.8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "36",
    x2: "32",
    y2: "24",
    stroke: stroke,
    strokeWidth: "2.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "50",
    y1: "36",
    x2: "68",
    y2: "24",
    stroke: stroke,
    strokeWidth: "2.5"
  }));
}

/* ---------------------------------------------------------
   SUPABASE TABLE HOOK — dados em tempo real, compartilhados
--------------------------------------------------------- */
function useTable(table) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const fetchAll = useCallback(async () => {
    const {
      data,
      error
    } = await supabase.from(table).select("*").order("created_at", {
      ascending: true
    });
    if (error) setErr(error.message);else {
      setItems(data || []);
      setErr(null);
    }
  }, [table]);
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchAll().finally(() => {
      if (active) setLoading(false);
    });
    const channel = supabase.channel("rt_" + table).on("postgres_changes", {
      event: "*",
      schema: "public",
      table
    }, () => fetchAll()).subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [table, fetchAll]);
  const insert = async row => {
    const {
      error
    } = await supabase.from(table).insert(row);
    if (error) setErr(error.message);else fetchAll();
  };
  const update = async (id, patch) => {
    const {
      error
    } = await supabase.from(table).update(patch).eq("id", id);
    if (error) setErr(error.message);else fetchAll();
  };
  const remove = async id => {
    const {
      error
    } = await supabase.from(table).delete().eq("id", id);
    if (error) setErr(error.message);else fetchAll();
  };
  return {
    items,
    loading,
    err,
    insert,
    update,
    remove
  };
}
const EVENT_DATE = new Date("2026-12-04T10:00:00");
function StatusBadge({
  status
}) {
  const map = {
    "Pendente": "bg-gray-100 text-gray-600",
    "Em andamento": "bg-blue-50 text-blue-700",
    "Confirmado": "bg-blue-50 text-blue-700",
    "Aprovado": "bg-blue-50 text-blue-700",
    "Concluído": "bg-emerald-50 text-emerald-700",
    "Pago": "bg-emerald-50 text-emerald-700"
  };
  return /*#__PURE__*/React.createElement("span", {
    className: `text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${map[status] || "bg-gray-100 text-gray-600"}`
  }, status);
}
function EmptyState({
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl"
  }, text);
}
function ErrBanner({
  err
}) {
  if (!err) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 bg-rose-50 text-rose-700 text-sm px-3 py-2 rounded-lg mb-4"
  }, "⚠️ ", err);
}

/* botão fixo presente em toda página que leva de volta ao menu principal */
function PageHeader({
  title,
  subtitle,
  onHome
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onHome,
    className: "flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-3 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
  }, "← Menu Principal"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] font-bold tracking-wider text-blue-600 uppercase mb-1"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-[3px] bg-blue-600 rounded-full mb-1"
  }), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500 mt-2"
  }, subtitle));
}
const uid = () => Math.random().toString(36).slice(2, 10);
const NAV = [{
  id: "inicio",
  label: "Início",
  icon: "🏠"
}, {
  id: "programacao",
  label: "Programação",
  icon: "🎄"
}, {
  id: "decoracao",
  label: "Decoração",
  icon: "✨"
}, {
  id: "gastronomia",
  label: "Gastronomia",
  icon: "🍬"
}, {
  id: "artesaos",
  label: "Artesãos",
  icon: "🎁"
}, {
  id: "equipe",
  label: "Equipe",
  icon: "👥"
}, {
  id: "financeiro",
  label: "Financeiro",
  icon: "💰"
}, {
  id: "orcamentos",
  label: "Orçamentos",
  icon: "📋"
}, {
  id: "documentos",
  label: "Documentos",
  icon: "📁"
}, {
  id: "mural",
  label: "Mural",
  icon: "📌"
}];

/* ===========================================================
   SETUP SCREEN — mostrado se config.js não foi preenchido
=========================================================== */
function SetupScreen() {
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex items-center justify-center bg-slate-50 p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-lg bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
  }, /*#__PURE__*/React.createElement(FolhaGota, {
    fill: "#2563EB",
    stroke: "#FFFFFF",
    size: 36
  }), /*#__PURE__*/React.createElement("h1", {
    className: "text-xl font-extrabold text-gray-900 mt-4 mb-2"
  }, "Configuração pendente"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600 leading-relaxed mb-4"
  }, "Este painel precisa se conectar ao Supabase antes de funcionar. Abra o arquivo ", /*#__PURE__*/React.createElement("code", {
    className: "bg-gray-100 px-1.5 py-0.5 rounded text-xs"
  }, "config.js"), " no repositório e preencha ", /*#__PURE__*/React.createElement("code", {
    className: "bg-gray-100 px-1.5 py-0.5 rounded text-xs"
  }, "url"), " e ", /*#__PURE__*/React.createElement("code", {
    className: "bg-gray-100 px-1.5 py-0.5 rounded text-xs"
  }, "anonKey"), " com os dados do seu projeto Supabase (Project Settings → API)."), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-400"
  }, "Veja o passo a passo completo no README.md do repositório.")));
}

/* ===========================================================
   APP
=========================================================== */
function App() {
  const [tab, setTab] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const schedule = useTable("schedule");
  const decor = useTable("decor");
  const food = useTable("food");
  const vendors = useTable("vendors");
  const team = useTable("team");
  const finance = useTable("finance");
  const budgets = useTable("budgets");
  const documents = useTable("documents");
  const mural = useTable("mural");
  const daysLeft = useMemo(() => Math.ceil((EVENT_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), []);
  const goHome = () => {
    setTab("inicio");
    setMobileOpen(false);
  };
  const activeLabel = NAV.find(n => n.id === tab)?.label || "";
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-slate-50",
    style: {
      fontFamily: "'Inter', sans-serif"
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-30",
    style: {
      background: "#1E3A5F"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-4 md:px-6 h-16"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "md:hidden text-white p-1 -ml-1",
    onClick: () => setMobileOpen(v => !v),
    "aria-label": "Abrir menu"
  }, mobileOpen ? "✕" : "☰"), /*#__PURE__*/React.createElement("button", {
    onClick: goHome,
    className: "flex items-center gap-3 text-left"
  }, /*#__PURE__*/React.createElement(FolhaGota, {
    fill: "#FFFFFF",
    stroke: "#1E3A5F",
    size: 24
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-white font-extrabold text-sm md:text-base leading-tight"
  }, "Festival de Natal 2026"), /*#__PURE__*/React.createElement("p", {
    className: "text-blue-200 text-[11px] hidden md:block"
  }, "Nova Estação Church · Painel da Equipe")))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 text-white"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs md:text-sm font-semibold"
  }, daysLeft > 0 ? `${daysLeft} dias para o evento` : daysLeft === 0 ? "É hoje! 🎄" : "Evento realizado"))), mobileOpen && /*#__PURE__*/React.createElement("div", {
    className: "md:hidden bg-white border-t border-gray-200 shadow-lg max-h-[70vh] overflow-y-auto"
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    onClick: () => {
      setTab(n.id);
      setMobileOpen(false);
    },
    className: `w-full flex items-center gap-3 px-5 py-3 text-sm font-medium border-b border-gray-100 ${tab === n.id ? "text-blue-700 bg-blue-50" : "text-gray-700"}`
  }, /*#__PURE__*/React.createElement("span", null, n.icon), " ", n.label)))), /*#__PURE__*/React.createElement("div", {
    className: "flex"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "hidden md:flex md:flex-col w-60 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] py-4"
  }, NAV.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    onClick: () => setTab(n.id),
    className: `flex items-center gap-3 px-5 py-2.5 text-sm font-medium mx-2 rounded-lg mb-1 transition-colors ${tab === n.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`
  }, /*#__PURE__*/React.createElement("span", null, n.icon), n.label, tab === n.id && /*#__PURE__*/React.createElement("span", {
    className: "ml-auto text-blue-400"
  }, "›")))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 px-4 md:px-8 py-6 md:py-8 max-w-5xl"
  }, tab === "inicio" && /*#__PURE__*/React.createElement(Inicio, {
    collections: {
      schedule,
      decor,
      food,
      vendors,
      team,
      finance,
      budgets,
      documents
    },
    daysLeft: daysLeft,
    setTab: setTab
  }), tab === "programacao" && /*#__PURE__*/React.createElement(Programacao, {
    c: schedule,
    onHome: goHome
  }), tab === "decoracao" && /*#__PURE__*/React.createElement(Decoracao, {
    c: decor,
    onHome: goHome
  }), tab === "gastronomia" && /*#__PURE__*/React.createElement(Gastronomia, {
    c: food,
    onHome: goHome
  }), tab === "artesaos" && /*#__PURE__*/React.createElement(Artesaos, {
    c: vendors,
    onHome: goHome
  }), tab === "equipe" && /*#__PURE__*/React.createElement(Equipe, {
    c: team,
    onHome: goHome
  }), tab === "financeiro" && /*#__PURE__*/React.createElement(Financeiro, {
    c: finance,
    vendors: vendors.items,
    onHome: goHome
  }), tab === "orcamentos" && /*#__PURE__*/React.createElement(Orcamentos, {
    c: budgets,
    onHome: goHome
  }), tab === "documentos" && /*#__PURE__*/React.createElement(Documentos, {
    c: documents,
    onHome: goHome
  }), tab === "mural" && /*#__PURE__*/React.createElement(Mural, {
    c: mural,
    onHome: goHome
  }))));
}

/* ===========================================================
   INÍCIO
=========================================================== */
function Inicio({
  collections,
  daysLeft,
  setTab
}) {
  const {
    schedule,
    decor,
    food,
    vendors,
    team,
    finance,
    budgets,
    documents
  } = collections;
  const pct = (items, isDone) => !items.length ? 0 : Math.round(items.filter(isDone).length / items.length * 100);
  const cards = [{
    key: "programacao",
    label: "Programação",
    icon: "🎄",
    total: schedule.items.length,
    pct: pct(schedule.items, i => i.status === "Confirmado")
  }, {
    key: "decoracao",
    label: "Decoração",
    icon: "✨",
    total: decor.items.length,
    pct: pct(decor.items, i => i.status === "Concluído")
  }, {
    key: "gastronomia",
    label: "Gastronomia",
    icon: "🍬",
    total: food.items.length,
    pct: pct(food.items, i => i.status === "Concluído")
  }, {
    key: "artesaos",
    label: "Artesãos",
    icon: "🎁",
    total: vendors.items.length,
    pct: pct(vendors.items, i => i.status === "Confirmado")
  }, {
    key: "equipe",
    label: "Equipe",
    icon: "👥",
    total: team.items.length,
    pct: pct(team.items, i => i.status === "Concluído")
  }, {
    key: "orcamentos",
    label: "Orçamentos",
    icon: "📋",
    total: budgets.items.length,
    pct: pct(budgets.items, i => i.status === "Pago")
  }, {
    key: "documentos",
    label: "Documentos",
    icon: "📁",
    total: documents.items.length,
    pct: documents.items.length ? 100 : 0
  }];
  const receitas = finance.items.filter(f => f.tipo === "Receita").reduce((a, b) => a + Number(b.valor || 0), 0);
  const despesas = finance.items.filter(f => f.tipo === "Despesa").reduce((a, b) => a + Number(b.valor || 0), 0);
  const resultado = receitas - despesas;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative overflow-hidden rounded-2xl p-8",
    style: {
      background: "#1E3A5F"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute bottom-0 right-0 w-56 h-full pointer-events-none overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: "-40px",
      right: "-60px",
      width: 200,
      height: 320,
      background: "#1D6FA4",
      transform: "skewX(-12deg)",
      opacity: 0.9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: "-40px",
      right: "-20px",
      width: 160,
      height: 280,
      background: "#2563EB",
      transform: "skewX(-12deg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: "60px",
      right: "10px",
      width: 80,
      height: 180,
      background: "#3B82F6",
      transform: "skewX(-12deg)",
      opacity: 0.7
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 max-w-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2"
  }, "04 de dezembro · sexta-feira · 10h–22h"), /*#__PURE__*/React.createElement("h1", {
    className: "text-white text-3xl md:text-4xl font-extrabold leading-tight mb-3"
  }, daysLeft > 0 ? `Faltam ${daysLeft} dias` : daysLeft === 0 ? "É hoje!" : "Festival realizado"), /*#__PURE__*/React.createElement("p", {
    className: "text-blue-100 text-sm leading-relaxed"
  }, "Celebração, gastronomia, artesanato, decoração, música e evangelismo — apontando a cidade para o verdadeiro sentido do Natal: Jesus."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-gray-900 mb-3"
  }, "Progresso por frente"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-3 gap-3"
  }, cards.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.key,
    onClick: () => setTab(c.key),
    className: "text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base"
  }, c.icon), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-semibold text-gray-800"
  }, c.label)), /*#__PURE__*/React.createElement("div", {
    className: "w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full bg-blue-600 rounded-full",
    style: {
      width: `${c.pct}%`
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, c.total, " itens · ", c.pct, "%"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-gray-900 mb-3"
  }, "Resultado financeiro (parcial)"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Receitas"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-emerald-600"
  }, "R$ ", receitas.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Despesas"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-rose-600"
  }, "R$ ", despesas.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Resultado"), /*#__PURE__*/React.createElement("p", {
    className: `text-lg font-bold ${resultado >= 0 ? "text-blue-600" : "text-rose-600"}`
  }, "R$ ", resultado.toLocaleString("pt-BR")))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-400 mt-2"
  }, "Lucro é 100% destinado ao Programa Legacy. Prejuízo é assumido pela Nova Estação Church.")));
}

/* ===========================================================
   PROGRAMAÇÃO
=========================================================== */
function Programacao({
  c,
  onHome
}) {
  const [form, setForm] = useState({
    time: "",
    title: "",
    responsible: ""
  });
  const add = () => {
    if (!form.title.trim()) return;
    c.insert({
      time: form.time || "—",
      title: form.title,
      responsible: form.responsible || "A definir",
      status: "Pendente"
    });
    setForm({
      time: "",
      title: "",
      responsible: ""
    });
  };
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Programação",
    onHome: onHome,
    subtitle: "Os momentos principais do dia: ministração, oração, adoração, convite à Sala Profética e evangelismo ativo."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mb-6"
  }, c.items.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum momento cadastrado ainda."
  }), c.items.slice().sort((a, b) => a.time.localeCompare(b.time)).map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-16 shrink-0 text-sm font-bold text-blue-700"
  }, i.time), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-medium text-gray-800 truncate"
  }, i.title), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "Responsável: ", i.responsible)), /*#__PURE__*/React.createElement("select", {
    value: i.status,
    onChange: e => c.update(i.id, {
      status: e.target.value
    }),
    className: "text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 shrink-0"
  }, /*#__PURE__*/React.createElement("option", null, "Pendente"), /*#__PURE__*/React.createElement("option", null, "Confirmado")), /*#__PURE__*/React.createElement("button", {
    onClick: () => c.remove(i.id),
    className: "text-gray-300 hover:text-rose-500 shrink-0"
  }, "🗑")))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "Adicionar momento"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Horário (ex: 14h00)",
    value: form.time,
    onChange: e => setForm({
      ...form,
      time: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Título do momento",
    value: form.title,
    onChange: e => setForm({
      ...form,
      title: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Responsável",
    value: form.responsible,
    onChange: e => setForm({
      ...form,
      responsible: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Adicionar")));
}

/* ===========================================================
   CHECKLIST genérico (Decoração / Gastronomia)
=========================================================== */
function ChecklistSection({
  c,
  onHome,
  title,
  subtitle,
  itemKey,
  extraField,
  extraLabel
}) {
  const [form, setForm] = useState({
    [itemKey]: "",
    responsible: "",
    extra: ""
  });
  const add = () => {
    if (!form[itemKey].trim()) return;
    const row = {
      [itemKey]: form[itemKey],
      responsible: form.responsible || "A definir",
      status: "Pendente"
    };
    if (extraField) row[extraField] = form.extra || "";
    c.insert(row);
    setForm({
      [itemKey]: "",
      responsible: "",
      extra: ""
    });
  };
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: title,
    onHome: onHome,
    subtitle: subtitle
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mb-6"
  }, c.items.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum item cadastrado ainda."
  }), c.items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => c.update(i.id, {
      status: i.status === "Concluído" ? "Pendente" : "Concluído"
    }),
    className: "shrink-0 text-blue-600 text-lg"
  }, i.status === "Concluído" ? "✅" : "⭕"), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: `text-sm font-medium truncate ${i.status === "Concluído" ? "text-gray-400 line-through" : "text-gray-800"}`
  }, i[itemKey]), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "Responsável: ", i.responsible, extraField && i[extraField] ? ` · ${extraLabel}: ${i[extraField]}` : "")), /*#__PURE__*/React.createElement("select", {
    value: i.status,
    onChange: e => c.update(i.id, {
      status: e.target.value
    }),
    className: "text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 shrink-0"
  }, /*#__PURE__*/React.createElement("option", null, "Pendente"), /*#__PURE__*/React.createElement("option", null, "Em andamento"), /*#__PURE__*/React.createElement("option", null, "Concluído")), /*#__PURE__*/React.createElement("button", {
    onClick: () => c.remove(i.id),
    className: "text-gray-300 hover:text-rose-500 shrink-0"
  }, "🗑")))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "Adicionar item"), /*#__PURE__*/React.createElement("div", {
    className: `grid grid-cols-1 ${extraField ? "md:grid-cols-3" : "md:grid-cols-2"} gap-2`
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Nome do item",
    value: form[itemKey],
    onChange: e => setForm({
      ...form,
      [itemKey]: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  }), extraField && /*#__PURE__*/React.createElement("input", {
    placeholder: extraLabel,
    value: form.extra,
    onChange: e => setForm({
      ...form,
      extra: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Responsável",
    value: form.responsible,
    onChange: e => setForm({
      ...form,
      responsible: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Adicionar")));
}
function Decoracao({
  c,
  onHome
}) {
  return /*#__PURE__*/React.createElement(ChecklistSection, {
    c: c,
    onHome: onHome,
    title: "Decoração",
    itemKey: "item",
    subtitle: "Ambientação grande, bonita e conectada ao Natal — contando a história do nascimento de Jesus e criando pontos de foto."
  });
}
function Gastronomia({
  c,
  onHome
}) {
  return /*#__PURE__*/React.createElement(ChecklistSection, {
    c: c,
    onHome: onHome,
    title: "Gastronomia",
    itemKey: "item",
    extraField: "category",
    extraLabel: "Categoria",
    subtitle: "Comidas, doces e bebidas que tragam o cheiro, sabor e memória afetiva do Natal."
  });
}

/* ===========================================================
   ARTESÃOS
=========================================================== */
function Artesaos({
  c,
  onHome
}) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    products: ""
  });
  const add = () => {
    if (!form.name.trim()) return;
    c.insert({
      name: form.name,
      contact: form.contact,
      products: form.products,
      status: "Pendente",
      vendas: 0
    });
    setForm({
      name: "",
      contact: "",
      products: ""
    });
  };
  const totalVendas = c.items.reduce((a, b) => a + Number(b.vendas || 0), 0);
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Artesãos",
    onHome: onHome,
    subtitle: "Caixa único. Comissão de 30% para o artesão, 70% repassados à Nova Estação na primeira segunda-feira após o evento."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), c.items.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-xl p-4 mb-5 flex flex-wrap gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "Total vendido"), /*#__PURE__*/React.createElement("p", {
    className: "text-base font-bold text-blue-700"
  }, "R$ ", totalVendas.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "Repasse à igreja (70%)"), /*#__PURE__*/React.createElement("p", {
    className: "text-base font-bold text-blue-700"
  }, "R$ ", (totalVendas * 0.7).toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "Comissão artesãos (30%)"), /*#__PURE__*/React.createElement("p", {
    className: "text-base font-bold text-blue-700"
  }, "R$ ", (totalVendas * 0.3).toLocaleString("pt-BR")))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mb-6"
  }, c.items.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum artesão cadastrado ainda."
  }), c.items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "bg-white border border-gray-200 rounded-xl p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-semibold text-gray-800 truncate"
  }, i.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 truncate"
  }, i.products || "Produtos não informados", " ", i.contact ? `· ${i.contact}` : "")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("select", {
    value: i.status,
    onChange: e => c.update(i.id, {
      status: e.target.value
    }),
    className: "text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50"
  }, /*#__PURE__*/React.createElement("option", null, "Pendente"), /*#__PURE__*/React.createElement("option", null, "Confirmado")), /*#__PURE__*/React.createElement("button", {
    onClick: () => c.remove(i.id),
    className: "text-gray-300 hover:text-rose-500"
  }, "🗑"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs text-gray-500"
  }, "Vendas no dia (R$)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: i.vendas,
    onChange: e => c.update(i.id, {
      vendas: Number(e.target.value) || 0
    }),
    className: "border border-gray-200 rounded-lg px-2 py-1 text-xs w-28"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "Adicionar artesão"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Nome",
    value: form.name,
    onChange: e => setForm({
      ...form,
      name: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Contato",
    value: form.contact,
    onChange: e => setForm({
      ...form,
      contact: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Produtos",
    value: form.products,
    onChange: e => setForm({
      ...form,
      products: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Adicionar")));
}

/* ===========================================================
   EQUIPE
=========================================================== */
const AREAS = ["Homens do Legado", "Eventos", "Comunicação"];
function Equipe({
  c,
  onHome
}) {
  const [form, setForm] = useState({
    area: AREAS[0],
    task: "",
    responsible: ""
  });
  const add = () => {
    if (!form.task.trim()) return;
    c.insert({
      ...form,
      status: "Pendente"
    });
    setForm({
      area: AREAS[0],
      task: "",
      responsible: ""
    });
  };
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Equipe",
    onHome: onHome,
    subtitle: "Tarefas por frente de responsabilidade."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), AREAS.map(area => {
    const areaItems = c.items.filter(i => i.area === area);
    const done = areaItems.filter(i => i.status === "Concluído").length;
    return /*#__PURE__*/React.createElement("div", {
      key: area,
      className: "mb-7"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between mb-2"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-sm font-bold text-gray-800"
    }, area), /*#__PURE__*/React.createElement("span", {
      className: "text-xs text-gray-400"
    }, done, "/", areaItems.length, " concluídas")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, areaItems.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
      text: "Nenhuma tarefa nesta frente ainda."
    }), areaItems.map(i => /*#__PURE__*/React.createElement("div", {
      key: i.id,
      className: "flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-0"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-medium text-gray-800 truncate"
    }, i.task), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "Responsável: ", i.responsible || "A definir")), /*#__PURE__*/React.createElement("select", {
      value: i.status,
      onChange: e => c.update(i.id, {
        status: e.target.value
      }),
      className: "text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 shrink-0"
    }, /*#__PURE__*/React.createElement("option", null, "Pendente"), /*#__PURE__*/React.createElement("option", null, "Em andamento"), /*#__PURE__*/React.createElement("option", null, "Concluído")), /*#__PURE__*/React.createElement("button", {
      onClick: () => c.remove(i.id),
      className: "text-gray-300 hover:text-rose-500 shrink-0"
    }, "🗑")))));
  }), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "Adicionar tarefa"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: form.area,
    onChange: e => setForm({
      ...form,
      area: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
  }, AREAS.map(a => /*#__PURE__*/React.createElement("option", {
    key: a
  }, a))), /*#__PURE__*/React.createElement("input", {
    placeholder: "Tarefa",
    value: form.task,
    onChange: e => setForm({
      ...form,
      task: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Responsável",
    value: form.responsible,
    onChange: e => setForm({
      ...form,
      responsible: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Adicionar")));
}

/* ===========================================================
   FINANCEIRO
=========================================================== */
function Financeiro({
  c,
  vendors,
  onHome
}) {
  const [form, setForm] = useState({
    tipo: "Receita",
    descricao: "",
    valor: ""
  });
  const add = () => {
    if (!form.descricao.trim() || !form.valor) return;
    c.insert({
      tipo: form.tipo,
      descricao: form.descricao,
      valor: Number(form.valor)
    });
    setForm({
      tipo: "Receita",
      descricao: "",
      valor: ""
    });
  };
  const receitas = c.items.filter(f => f.tipo === "Receita").reduce((a, b) => a + Number(b.valor || 0), 0);
  const despesas = c.items.filter(f => f.tipo === "Despesa").reduce((a, b) => a + Number(b.valor || 0), 0);
  const resultado = receitas - despesas;
  const totalVendasArtesaos = (vendors || []).reduce((a, b) => a + Number(b.vendas || 0), 0);
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Financeiro",
    onHome: onHome,
    subtitle: "A Nova Estação assume eventual prejuízo. Todo lucro é destinado integralmente ao Programa Legacy."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-3 mb-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "📈 Receitas"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-emerald-600"
  }, "R$ ", receitas.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "📉 Despesas"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-rose-600"
  }, "R$ ", despesas.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Resultado"), /*#__PURE__*/React.createElement("p", {
    className: `text-lg font-bold ${resultado >= 0 ? "text-blue-600" : "text-rose-600"}`
  }, "R$ ", resultado.toLocaleString("pt-BR")))), totalVendasArtesaos > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-50 rounded-xl p-4 mb-5 text-sm text-blue-800"
  }, "Vendas de artesãos registradas: ", /*#__PURE__*/React.createElement("strong", null, "R$ ", totalVendasArtesaos.toLocaleString("pt-BR")), " — 70% desse valor é receita do evento (consulte a aba Artesãos para o detalhamento)."), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mb-6"
  }, c.items.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum lançamento ainda."
  }), c.items.slice().reverse().map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: `text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${i.tipo === "Receita" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`
  }, i.tipo), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-medium text-gray-800 truncate"
  }, i.descricao), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, i.data)), /*#__PURE__*/React.createElement("p", {
    className: `text-sm font-bold shrink-0 ${i.tipo === "Receita" ? "text-emerald-600" : "text-rose-600"}`
  }, "R$ ", Number(i.valor).toLocaleString("pt-BR")), /*#__PURE__*/React.createElement("button", {
    onClick: () => c.remove(i.id),
    className: "text-gray-300 hover:text-rose-500 shrink-0"
  }, "🗑")))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "Novo lançamento"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: form.tipo,
    onChange: e => setForm({
      ...form,
      tipo: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
  }, /*#__PURE__*/React.createElement("option", null, "Receita"), /*#__PURE__*/React.createElement("option", null, "Despesa")), /*#__PURE__*/React.createElement("input", {
    placeholder: "Descrição",
    value: form.descricao,
    onChange: e => setForm({
      ...form,
      descricao: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Valor (R$)",
    value: form.valor,
    onChange: e => setForm({
      ...form,
      valor: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "mt-3 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Lançar")));
}

/* ===========================================================
   ORÇAMENTOS
=========================================================== */
const CATEGORIAS_ORCAMENTO = ["Decoração", "Gastronomia", "Artesãos", "Estrutura", "Divulgação", "Geral"];
function Orcamentos({
  c,
  onHome
}) {
  const [form, setForm] = useState({
    titulo: "",
    categoria: "Geral",
    valor_previsto: "",
    observacoes: ""
  });
  const add = () => {
    if (!form.titulo.trim()) return;
    c.insert({
      titulo: form.titulo,
      categoria: form.categoria,
      valor_previsto: Number(form.valor_previsto) || 0,
      valor_real: 0,
      status: "Pendente",
      observacoes: form.observacoes
    });
    setForm({
      titulo: "",
      categoria: "Geral",
      valor_previsto: "",
      observacoes: ""
    });
  };
  const totalPrevisto = c.items.reduce((a, b) => a + Number(b.valor_previsto || 0), 0);
  const totalReal = c.items.reduce((a, b) => a + Number(b.valor_real || 0), 0);
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Orçamentos",
    onHome: onHome,
    subtitle: "Valores previstos e realizados por frente do evento."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-3 mb-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Previsto total"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-blue-700"
  }, "R$ ", totalPrevisto.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Realizado total"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg font-bold text-gray-800"
  }, "R$ ", totalReal.toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500 mb-1"
  }, "Diferença"), /*#__PURE__*/React.createElement("p", {
    className: `text-lg font-bold ${totalReal <= totalPrevisto ? "text-emerald-600" : "text-rose-600"}`
  }, "R$ ", (totalPrevisto - totalReal).toLocaleString("pt-BR")))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mb-6"
  }, c.items.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum orçamento cadastrado ainda."
  }), c.items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "bg-white border border-gray-200 rounded-xl p-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-semibold text-gray-800 truncate"
  }, i.titulo), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, i.categoria, i.observacoes ? ` · ${i.observacoes}` : "")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("select", {
    value: i.status,
    onChange: e => c.update(i.id, {
      status: e.target.value
    }),
    className: "text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50"
  }, /*#__PURE__*/React.createElement("option", null, "Pendente"), /*#__PURE__*/React.createElement("option", null, "Aprovado"), /*#__PURE__*/React.createElement("option", null, "Pago")), /*#__PURE__*/React.createElement("button", {
    onClick: () => c.remove(i.id),
    className: "text-gray-300 hover:text-rose-500"
  }, "🗑"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-gray-500"
  }, "Previsto: ", /*#__PURE__*/React.createElement("strong", {
    className: "text-gray-800"
  }, "R$ ", Number(i.valor_previsto).toLocaleString("pt-BR"))), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-1.5 text-gray-500"
  }, "Real: R$", /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    value: i.valor_real,
    onChange: e => c.update(i.id, {
      valor_real: Number(e.target.value) || 0
    }),
    className: "border border-gray-200 rounded-lg px-2 py-1 text-xs w-24"
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "Adicionar orçamento"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-2 mb-2"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Título (ex: Locação de tendas)",
    value: form.titulo,
    onChange: e => setForm({
      ...form,
      titulo: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
  }), /*#__PURE__*/React.createElement("select", {
    value: form.categoria,
    onChange: e => setForm({
      ...form,
      categoria: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
  }, CATEGORIAS_ORCAMENTO.map(cat => /*#__PURE__*/React.createElement("option", {
    key: cat
  }, cat))), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Valor previsto (R$)",
    value: form.valor_previsto,
    onChange: e => setForm({
      ...form,
      valor_previsto: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm"
  })), /*#__PURE__*/React.createElement("input", {
    placeholder: "Observações (opcional)",
    value: form.observacoes,
    onChange: e => setForm({
      ...form,
      observacoes: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full mb-2"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Adicionar")));
}

/* ===========================================================
   DOCUMENTOS — upload de arquivos + links externos
=========================================================== */
const CATEGORIAS_DOC = ["Geral", "Orçamentos", "Contratos", "Decoração", "Gastronomia", "Artesãos", "Comunicação"];
function Documentos({
  c,
  onHome
}) {
  const [linkForm, setLinkForm] = useState({
    titulo: "",
    url: "",
    categoria: "Geral"
  });
  const [uploading, setUploading] = useState(false);
  const [uploadTitulo, setUploadTitulo] = useState("");
  const [uploadCategoria, setUploadCategoria] = useState("Geral");
  const [uploadErr, setUploadErr] = useState(null);
  const addLink = () => {
    if (!linkForm.titulo.trim() || !linkForm.url.trim()) return;
    c.insert({
      titulo: linkForm.titulo,
      tipo: "link",
      url: linkForm.url,
      categoria: linkForm.categoria
    });
    setLinkForm({
      titulo: "",
      url: "",
      categoria: "Geral"
    });
  };
  const handleFile = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const {
        error: upErr
      } = await supabase.storage.from("documentos").upload(path, file);
      if (upErr) throw upErr;
      const {
        data
      } = supabase.storage.from("documentos").getPublicUrl(path);
      await c.insert({
        titulo: uploadTitulo.trim() || file.name,
        tipo: "arquivo",
        url: data.publicUrl,
        categoria: uploadCategoria
      });
      setUploadTitulo("");
    } catch (err) {
      setUploadErr("Falha no upload: " + (err.message || "verifique se o bucket 'documentos' foi criado no Supabase."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Documentos",
    onHome: onHome,
    subtitle: "Orçamentos em PDF/planilha, contratos e links que consolidam o evento — tudo em um só lugar."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 mb-6"
  }, c.items.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum documento cadastrado ainda."
  }), c.items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i.id,
    href: i.url,
    target: "_blank",
    rel: "noreferrer",
    className: "flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-colors"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg shrink-0"
  }, i.tipo === "arquivo" ? "📄" : "🔗"), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-medium text-gray-800 truncate"
  }, i.titulo), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, i.categoria, " · ", i.tipo === "arquivo" ? "arquivo enviado" : "link externo")), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.preventDefault();
      c.remove(i.id);
    },
    className: "text-gray-300 hover:text-rose-500 shrink-0"
  }, "🗑")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "📄 Enviar arquivo (PDF, planilha, etc.)"), /*#__PURE__*/React.createElement("input", {
    placeholder: "Título do documento",
    value: uploadTitulo,
    onChange: e => setUploadTitulo(e.target.value),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full mb-2"
  }), /*#__PURE__*/React.createElement("select", {
    value: uploadCategoria,
    onChange: e => setUploadCategoria(e.target.value),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white w-full mb-2"
  }, CATEGORIAS_DOC.map(cat => /*#__PURE__*/React.createElement("option", {
    key: cat
  }, cat))), /*#__PURE__*/React.createElement("input", {
    type: "file",
    onChange: handleFile,
    disabled: uploading,
    className: "text-xs w-full"
  }), uploading && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-blue-600 mt-2"
  }, "Enviando..."), uploadErr && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-rose-600 mt-2"
  }, uploadErr)), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-gray-500 uppercase tracking-wide mb-3"
  }, "🔗 Adicionar link externo"), /*#__PURE__*/React.createElement("input", {
    placeholder: "Título",
    value: linkForm.titulo,
    onChange: e => setLinkForm({
      ...linkForm,
      titulo: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full mb-2"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "https://...",
    value: linkForm.url,
    onChange: e => setLinkForm({
      ...linkForm,
      url: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full mb-2"
  }), /*#__PURE__*/React.createElement("select", {
    value: linkForm.categoria,
    onChange: e => setLinkForm({
      ...linkForm,
      categoria: e.target.value
    }),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white w-full mb-2"
  }, CATEGORIAS_DOC.map(cat => /*#__PURE__*/React.createElement("option", {
    key: cat
  }, cat))), /*#__PURE__*/React.createElement("button", {
    onClick: addLink,
    className: "bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Adicionar link"))));
}

/* ===========================================================
   MURAL
=========================================================== */
function Mural({
  c,
  onHome
}) {
  const [autor, setAutor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const add = () => {
    if (!mensagem.trim()) return;
    c.insert({
      autor: autor.trim() || "Equipe",
      mensagem: mensagem.trim(),
      fixado: false
    });
    setMensagem("");
  };
  const sorted = c.items.slice().sort((a, b) => b.fixado === a.fixado ? new Date(b.created_at) - new Date(a.created_at) : b.fixado - a.fixado);
  if (c.loading) return /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-400"
  }, "Carregando...");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Mural",
    onHome: onHome,
    subtitle: "Avisos, decisões e recados da equipe. Visível para todos que acessam o painel."
  }), /*#__PURE__*/React.createElement(ErrBanner, {
    err: c.err
  }), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-gray-200 rounded-xl p-4 mb-6"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Seu nome",
    value: autor,
    onChange: e => setAutor(e.target.value),
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full mb-2"
  }), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "Escreva um comunicado para a equipe...",
    value: mensagem,
    onChange: e => setMensagem(e.target.value),
    rows: 3,
    className: "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full resize-none"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: add,
    className: "mt-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
  }, "+ Publicar")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, sorted.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    text: "Nenhum comunicado ainda."
  }), sorted.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: `rounded-xl p-4 border ${i.fixado ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3 mb-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold text-gray-800"
  }, i.autor), i.fixado && /*#__PURE__*/React.createElement("span", {
    className: "text-blue-600 text-xs"
  }, "📌")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => c.update(i.id, {
      fixado: !i.fixado
    }),
    className: "text-gray-300 hover:text-blue-600 text-sm"
  }, i.fixado ? "Desafixar" : "Fixar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => c.remove(i.id),
    className: "text-gray-300 hover:text-rose-500"
  }, "🗑"))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-700 whitespace-pre-wrap"
  }, i.mensagem), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-400 mt-2"
  }, new Date(i.created_at).toLocaleString("pt-BR"))))));
}

/* ===========================================================
   MOUNT
=========================================================== */
ReactDOM.createRoot(document.getElementById("root")).render(CONFIG_OK ? /*#__PURE__*/React.createElement(App, null) : /*#__PURE__*/React.createElement(SetupScreen, null));
