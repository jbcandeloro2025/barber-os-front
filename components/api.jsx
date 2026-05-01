
// Central API helper
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3333";

const PROF_COLORS = ["#C5A47E","#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4"];

// Token management
const getToken  = ()       => localStorage.getItem("barber_token");
const setToken  = (t)      => localStorage.setItem("barber_token", t);
const clearToken = ()      => localStorage.removeItem("barber_token");
const getShopId = ()       => localStorage.getItem("barber_shop_id");
const setShopId = (id)     => localStorage.setItem("barber_shop_id", id);

// Central fetch wrapper
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body !== undefined
      ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body))
      : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Erro ${res.status}`);
  }

  return data;
}

// Status mappers (PT <-> API enum)
const STATUS_PT_TO_API = {
  "Pendente":   "PENDING",
  "Confirmado": "CONFIRMED",
  "Finalizado": "COMPLETED",
  "Cancelado":  "CANCELED",
};
const STATUS_API_TO_PT = Object.fromEntries(
  Object.entries(STATUS_PT_TO_API).map(([k, v]) => [v, k])
);

// Normaliza appointment da API para formato usado nos componentes do front
function normalizeAppointment(ap, profColors = {}) {
  const dt = new Date(ap.scheduled_at);
  const pad = n => String(n).padStart(2, "0");
  return {
    id:          ap.id,
    data:        ap.scheduled_at.split("T")[0],
    hora:        `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
    status:      STATUS_API_TO_PT[ap.status] || ap.status,
    obs:         ap.notes || "",
    payment_status: ap.payment_status,
    cliente: {
      id:       ap.client_id,
      nome:     ap.client?.name  || "",
      telefone: ap.client?.phone || "",
    },
    servico: {
      id:     ap.service_id,
      titulo: ap.service?.title || "",
      preco:  Number(ap.service?.price || 0),
      tempo:  ap.service?.duration || 0,
    },
    profissional: {
      id:   ap.professional_id,
      nome: ap.professional?.name || "",
      cor:  profColors[ap.professional_id] || "#C5A47E",
    },
  };
}

// Normaliza professional da API
function normalizeProfessional(p, index = 0) {
  return {
    id:           p.id,
    nome:         p.name,
    bio:          p.specialties?.join(", ") || "",
    cor:          PROF_COLORS[index % PROF_COLORS.length],
    comissao:     Number(p.commission_rate),
    avatar:       p.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
    especialidades: p.specialties || [],
    active:       p.active,
  };
}

// Normaliza client da API
function normalizeClient(c) {
  const sub = c.subscriptions?.[0] ?? c.subscription ?? null;
  return {
    id:           c.id,
    nome:         c.name || "",
    telefone:     c.phone || "",
    email:        c.email || "",
    avatar:       (c.name || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase(),
    subscription: sub,
  };
}

// Normaliza service da API
function normalizeService(s) {
  return {
    id:        s.id,
    titulo:    s.title,
    preco:     Number(s.price),
    tempo:     s.duration,
    categoria: "Serviço",
    desc:      s.description || "",
    active:    s.active,
  };
}

Object.assign(window, {
  API_BASE, getToken, setToken, clearToken, getShopId, setShopId,
  apiFetch, STATUS_PT_TO_API, STATUS_API_TO_PT,
  normalizeAppointment, normalizeProfessional, normalizeClient, normalizeService,
  PROF_COLORS,
});
