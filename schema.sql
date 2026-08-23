-- =====================================================================
-- FESTIVAL DE NATAL 2026 — Nova Estação Church
-- Schema completo para Supabase (Postgres)
-- Rode este arquivo inteiro em: Supabase > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- TABELAS
-- ---------------------------------------------------------------------

create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  time text,
  title text not null,
  responsible text default 'A definir',
  status text default 'Pendente',
  created_at timestamptz default now()
);

create table if not exists decor (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  responsible text default 'A definir',
  status text default 'Pendente',
  created_at timestamptz default now()
);

create table if not exists food (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  category text,
  responsible text default 'A definir',
  status text default 'Pendente',
  created_at timestamptz default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  products text,
  status text default 'Pendente',
  vendas numeric default 0,
  created_at timestamptz default now()
);

create table if not exists team (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  task text not null,
  responsible text default 'A definir',
  status text default 'Pendente',
  created_at timestamptz default now()
);

create table if not exists finance (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,          -- 'Receita' | 'Despesa'
  descricao text not null,
  valor numeric not null default 0,
  data date default current_date,
  created_at timestamptz default now()
);

create table if not exists mural (
  id uuid primary key default gen_random_uuid(),
  autor text default 'Equipe',
  mensagem text not null,
  fixado boolean default false,
  created_at timestamptz default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text default 'Geral',   -- Decoração | Gastronomia | Artesãos | Estrutura | Divulgação | Geral
  valor_previsto numeric default 0,
  valor_real numeric default 0,
  status text default 'Pendente',   -- Pendente | Aprovado | Pago
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null,           -- 'arquivo' | 'link'
  url text not null,
  categoria text default 'Geral',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- RLS — acesso aberto (link público, sem login), conforme decisão do time
-- Qualquer pessoa com o link do site pode ler e editar os dados.
-- ---------------------------------------------------------------------

alter table schedule  enable row level security;
alter table decor     enable row level security;
alter table food      enable row level security;
alter table vendors   enable row level security;
alter table team      enable row level security;
alter table finance   enable row level security;
alter table mural     enable row level security;
alter table budgets   enable row level security;
alter table documents enable row level security;

do $$
declare t text;
begin
  foreach t in array array['schedule','decor','food','vendors','team','finance','mural','budgets','documents']
  loop
    execute format('drop policy if exists "public_all" on %I;', t);
    execute format('create policy "public_all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- REALTIME — permite que todos vejam as atualizações ao vivo
-- ---------------------------------------------------------------------

alter publication supabase_realtime add table schedule, decor, food, vendors, team, finance, mural, budgets, documents;

-- ---------------------------------------------------------------------
-- STORAGE — bucket público para upload de documentos/orçamentos (PDF, planilhas)
-- Depois de rodar este SQL, crie o bucket manualmente em:
-- Supabase > Storage > New bucket > nome: "documentos" > marque "Public bucket"
-- Depois volte aqui e rode o bloco abaixo para liberar upload/leitura pública.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

drop policy if exists "documentos_public_read" on storage.objects;
create policy "documentos_public_read" on storage.objects
  for select using (bucket_id = 'documentos');

drop policy if exists "documentos_public_insert" on storage.objects;
create policy "documentos_public_insert" on storage.objects
  for insert with check (bucket_id = 'documentos');

drop policy if exists "documentos_public_delete" on storage.objects;
create policy "documentos_public_delete" on storage.objects
  for delete using (bucket_id = 'documentos');

-- ---------------------------------------------------------------------
-- DADOS INICIAIS (seed) — extraídos do briefing do evento
-- ---------------------------------------------------------------------

insert into schedule (time, title, responsible, status) values
  ('10h00', 'Abertura do Festival', 'Eventos', 'Pendente'),
  ('12h00', 'Ministração + boas-vindas + convite à adoração', 'A definir', 'Pendente'),
  ('15h00', 'Oração', 'A definir', 'Pendente'),
  ('17h00', 'Adoração — música natalina cristã', 'A definir', 'Pendente'),
  ('19h00', 'Ministração + convite para Sala Profética', 'A definir', 'Pendente'),
  ('10h–22h', 'Evangelismo ativo (antes e depois dos momentos)', 'A definir', 'Pendente')
on conflict do nothing;

insert into decor (item, responsible, status) values
  ('Presépio na entrada da igreja', 'A definir', 'Pendente'),
  ('Luzes de Natal', 'A definir', 'Pendente'),
  ('Decoração da entrada', 'A definir', 'Pendente'),
  ('Decoração da recepção', 'A definir', 'Pendente'),
  ('Decoração do palco', 'A definir', 'Pendente'),
  ('Cenários da história do nascimento de Jesus', 'A definir', 'Pendente'),
  ('Espaços pensados para fotos e interação', 'A definir', 'Pendente')
on conflict do nothing;

insert into food (item, category, responsible, status) values
  ('Comidas típicas natalinas', 'Comida', 'A definir', 'Pendente'),
  ('Cookies', 'Doce', 'A definir', 'Pendente'),
  ('Bolachinhas', 'Doce', 'A definir', 'Pendente'),
  ('Bebidas', 'Bebida', 'A definir', 'Pendente')
on conflict do nothing;

insert into team (area, task, responsible, status) values
  ('Homens do Legado', 'Montagem das tendas', 'A definir', 'Pendente'),
  ('Homens do Legado', 'Convite e organização dos artesãos', 'A definir', 'Pendente'),
  ('Homens do Legado', 'Definição das comidas', 'A definir', 'Pendente'),
  ('Homens do Legado', 'Organização dos espaços de alimentação', 'A definir', 'Pendente'),
  ('Eventos', 'Caixa', 'A definir', 'Pendente'),
  ('Eventos', 'Divulgação', 'A definir', 'Pendente'),
  ('Eventos', 'Organização da programação', 'A definir', 'Pendente'),
  ('Eventos', 'Decoração', 'A definir', 'Pendente'),
  ('Eventos', 'Coordenação da operação no dia', 'A definir', 'Pendente'),
  ('Comunicação', 'Materiais de divulgação', 'A definir', 'Pendente'),
  ('Comunicação', 'Identidade visual do evento', 'A definir', 'Pendente'),
  ('Comunicação', 'Painel digital para liderança e equipe', 'Igor', 'Em andamento')
on conflict do nothing;

insert into mural (autor, mensagem, fixado) values
  ('Nova Estação Church', 'Painel do Festival de Natal 2026 no ar 🎄 Este é o ponto central de comunicação da equipe — mantenha tudo atualizado por aqui!', true)
on conflict do nothing;
