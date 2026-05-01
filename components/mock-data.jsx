
// Mock Data
const PROFESSIONALS = [
  { id: 1, nome: "Rafael Souza", bio: "Especialista em degradê", cor: "#C5A47E", comissao: 40, avatar: "RS", especialidades: ["Degradê", "Navalhado"] },
  { id: 2, nome: "Lucas Alves", bio: "Mestre em barba", cor: "#3B82F6", comissao: 35, avatar: "LA", especialidades: ["Barba", "Hot Towel"] },
  { id: 3, nome: "Thiago Costa", bio: "Coloração e estética", cor: "#8B5CF6", comissao: 45, avatar: "TC", especialidades: ["Coloração", "Escova"] },
  { id: 4, nome: "Diego Lima", bio: "Corte clássico e moderno", cor: "#10B981", comissao: 40, avatar: "DL", especialidades: ["Clássico", "Degradê"] },
];

const SERVICOS = [
  { id: 1, titulo: "Corte Masculino", preco: 45, tempo: 45, categoria: "Cabelo", desc: "Corte moderno ou clássico" },
  { id: 2, titulo: "Barba Completa", preco: 35, tempo: 30, categoria: "Barba", desc: "Modelagem e hot towel" },
  { id: 3, titulo: "Combo Corte + Barba", preco: 70, tempo: 75, categoria: "Combo", desc: "Corte + barba com hot towel" },
  { id: 4, titulo: "Degradê", preco: 55, tempo: 50, categoria: "Cabelo", desc: "Degradê skin fade ou mid" },
  { id: 5, titulo: "Coloração", preco: 120, tempo: 90, categoria: "Cabelo", desc: "Coloração completa" },
  { id: 6, titulo: "Sobrancelha", preco: 25, tempo: 20, categoria: "Estética", desc: "Design de sobrancelha" },
  { id: 7, titulo: "Hidratação", preco: 45, tempo: 30, categoria: "Cabelo", desc: "Máscara hidratante" },
  { id: 8, titulo: "Bigode + Cavanhaque", preco: 28, tempo: 25, categoria: "Barba", desc: "Modelagem completa" },
];

const CLIENTES = [
  { id: 1, nome: "Carlos Mendes", telefone: "(11) 98765-4321", email: "carlos@email.com", nascimento: "1990-03-15", total_gasto: 1240, ultimo_agendamento: "2026-04-20", agendamentos: 18, avatar: "CM", planoId: 1, planoStatus: "ativo" },
  { id: 2, nome: "Bruno Ferreira", telefone: "(11) 91234-5678", email: "bruno@email.com", nascimento: "1988-07-22", total_gasto: 890, ultimo_agendamento: "2026-04-18", agendamentos: 12, avatar: "BF", planoId: null, planoStatus: null },
  { id: 3, nome: "André Oliveira", telefone: "(11) 99876-1234", email: "andre@email.com", nascimento: "1995-11-30", total_gasto: 2100, ultimo_agendamento: "2026-04-25", agendamentos: 31, avatar: "AO", planoId: 2, planoStatus: "ativo" },
  { id: 4, nome: "Marcos Paulo", telefone: "(11) 97654-3210", email: "marcos@email.com", nascimento: "1992-09-08", total_gasto: 450, ultimo_agendamento: "2026-03-10", agendamentos: 5, avatar: "MP", planoId: null, planoStatus: null },
  { id: 5, nome: "Felipe Santos", telefone: "(11) 96543-2109", email: "felipe@email.com", nascimento: "1998-01-14", total_gasto: 3200, ultimo_agendamento: "2026-04-24", agendamentos: 42, avatar: "FS", planoId: 1, planoStatus: "expirado" },
  { id: 6, nome: "Gabriel Costa", telefone: "(11) 95432-1098", email: "gabriel@email.com", nascimento: "1985-06-20", total_gasto: 180, ultimo_agendamento: "2026-02-15", agendamentos: 3, avatar: "GC", planoId: null, planoStatus: null },
  { id: 7, nome: "Rodrigo Lima", telefone: "(11) 94321-0987", email: "rodrigo@email.com", nascimento: "1993-12-03", total_gasto: 760, ultimo_agendamento: "2026-04-22", agendamentos: 9, avatar: "RL", planoId: null, planoStatus: null },
  { id: 8, nome: "Thiago Nunes", telefone: "(11) 93210-9876", email: "thiago@email.com", nascimento: "2000-04-17", total_gasto: 590, ultimo_agendamento: "2026-04-15", agendamentos: 7, avatar: "TN", planoId: null, planoStatus: null },
];

const hoje = new Date(2026, 3, 30); // April 30, 2026 (Current)
const AGENDAMENTOS = [
  { id: 1, cliente: CLIENTES[0], profissional: PROFESSIONALS[0], servico: SERVICOS[0], data: "2026-04-30", hora: "09:00", status: "Confirmado", obs: "" },
  { id: 2, cliente: CLIENTES[1], profissional: PROFESSIONALS[1], servico: SERVICOS[1], data: "2026-04-30", hora: "09:30", status: "Pendente", obs: "Prefere barba natural" },
  { id: 3, cliente: CLIENTES[2], profissional: PROFESSIONALS[0], servico: SERVICOS[2], data: "2026-04-30", hora: "10:00", status: "Confirmado", obs: "" },
  { id: 4, cliente: CLIENTES[3], profissional: PROFESSIONALS[2], servico: SERVICOS[4], data: "2026-04-30", hora: "11:00", status: "Pendente", obs: "" },
  { id: 5, cliente: CLIENTES[4], profissional: PROFESSIONALS[3], servico: SERVICOS[3], data: "2026-04-30", hora: "14:00", status: "Confirmado", obs: "" },
  { id: 6, cliente: CLIENTES[5], profissional: PROFESSIONALS[1], servico: SERVICOS[0], data: "2026-04-30", hora: "15:00", status: "Cancelado", obs: "Imprevisto" },
  { id: 7, cliente: CLIENTES[6], profissional: PROFESSIONALS[0], servico: SERVICOS[2], data: "2026-04-30", hora: "16:30", status: "Confirmado", obs: "" },
  { id: 8, cliente: CLIENTES[7], profissional: PROFESSIONALS[3], servico: SERVICOS[5], data: "2026-04-30", hora: "17:00", status: "Pendente", obs: "" },
  { id: 9, cliente: CLIENTES[0], profissional: PROFESSIONALS[0], servico: SERVICOS[0], data: "2026-04-29", hora: "09:00", status: "Confirmado", obs: "" },
  { id: 10, cliente: CLIENTES[2], profissional: PROFESSIONALS[2], servico: SERVICOS[3], data: "2026-04-29", hora: "10:30", status: "Pendente", obs: "" },
  { id: 11, cliente: CLIENTES[1], profissional: PROFESSIONALS[1], servico: SERVICOS[2], data: "2026-05-01", hora: "11:00", status: "Confirmado", obs: "" },
  { id: 12, cliente: CLIENTES[4], profissional: PROFESSIONALS[0], servico: SERVICOS[1], data: "2026-05-01", hora: "14:00", status: "Confirmado", obs: "" },
];

const RECEITA_DIARIA = [
  { dia: "20/Abr", valor: 890 },
  { dia: "21/Abr", valor: 1240 },
  { dia: "22/Abr", valor: 760 },
  { dia: "23/Abr", valor: 1100 },
  { dia: "24/Abr", valor: 980 },
  { dia: "25/Abr", valor: 1380 },
  { dia: "26/Abr", valor: 1050 },
];

const SERVICOS_RANK = [
  { name: "Combo", value: 34 },
  { name: "Corte", value: 28 },
  { name: "Degradê", value: 19 },
  { name: "Barba", value: 12 },
  { name: "Outros", value: 7 },
];

const PRODUTOS = [
  { id: 1, nome: "Pomada Modeladora Matte", preco: 45, estoque: 12, estoque_min: 5, categoria: "Finalizadores" },
  { id: 2, nome: "Óleo para Barba 30ml", preco: 38, estoque: 8, estoque_min: 3, categoria: "Barba" },
  { id: 3, nome: "Shampoo Anticaspa 250ml", preco: 52, estoque: 4, estoque_min: 5, categoria: "Shampoo" },
  { id: 4, nome: "Cera de Bigode", preco: 25, estoque: 15, estoque_min: 5, categoria: "Barba" },
  { id: 5, nome: "Pente de Madeira", preco: 30, estoque: 20, estoque_min: 10, categoria: "Acessórios" },
];

const PLANOS = [
  { id: 1, titulo: "Plano Classic", preco: 150, servicos: [1, 2], recorrencia: "semanal", limite: 1, descricao: "1 Corte e 1 Barba por semana" },
  { id: 2, titulo: "Plano VIP Unlimited", preco: 250, servicos: [1, 2, 4, 6], recorrencia: "livre", limite: null, descricao: "Corte, Barba e Sobrancelha livre o mês todo" },
];

Object.assign(window, { PROFESSIONALS, SERVICOS, CLIENTES, AGENDAMENTOS, RECEITA_DIARIA, SERVICOS_RANK, PRODUTOS, PLANOS, hoje });
