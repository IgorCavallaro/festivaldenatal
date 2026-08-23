# Festival de Natal 2026 — Painel da Equipe

Painel de gestão completo do Festival de Natal 2026 (Nova Estação Church). Funciona como site normal e como **app instalável (PWA)** no celular. Os dados são compartilhados em tempo real entre todos que acessarem o link — é o ponto central de comunicação da equipe.

Não precisa de build, servidor ou Node.js: são arquivos estáticos + um banco de dados no Supabase (gratuito).

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (ou entre na sua).
2. Clique em **New project**. Escolha um nome (ex: `festival-natal-2026`), uma senha de banco (guarde-a) e a região `South America (São Paulo)`.
3. Aguarde ~2 minutos até o projeto ficar pronto (status "Active").

## Passo 2 — Rodar o schema do banco

1. No painel do Supabase, vá em **SQL Editor** (menu lateral) → **New query**.
2. Abra o arquivo `schema.sql` deste repositório, copie todo o conteúdo e cole no editor.
3. Clique em **Run**. Isso cria todas as tabelas (Programação, Decoração, Gastronomia, Artesãos, Equipe, Financeiro, Orçamentos, Documentos, Mural), libera o acesso público e já popula os dados iniciais do briefing.

## Passo 3 — Criar o bucket de arquivos (upload de documentos)

1. No Supabase, vá em **Storage** (menu lateral) → **New bucket**.
2. Nome: `documentos` — marque a opção **Public bucket** → **Create bucket**.
3. Isso é necessário mesmo o `schema.sql` já ter as políticas prontas, pois o bucket em si precisa existir antes.

## Passo 4 — Pegar suas chaves de API

1. No Supabase, vá em **Project Settings** (ícone de engrenagem) → **API**.
2. Copie a **Project URL** (ex: `https://abcdefghij.supabase.co`).
3. Copie a chave **anon public** (é uma chave pública, segura para uso no navegador — não é a `service_role`).

## Passo 5 — Configurar o app

1. Abra o arquivo `config.js` neste repositório.
2. Substitua os valores:
   ```js
   window.SUPABASE_CONFIG = {
     url: "https://abcdefghij.supabase.co",
     anonKey: "eyJhbGciOiJI..."
   };
   ```
3. Salve.

## Passo 6 — Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público ou privado — se privado, GitHub Pages exige plano pago para publicar).
2. Suba todos os arquivos desta pasta para o repositório (`index.html`, `app.js`, `config.js`, `manifest.json`, `sw.js`, `schema.sql`, pasta `icons/`).
3. No repositório, vá em **Settings → Pages**.
4. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` → **Save**.
5. Em 1–2 minutos, o GitHub mostrará o link do site (algo como `https://seu-usuario.github.io/nome-do-repositorio/`).
6. Compartilhe esse link com a equipe — é o link único e central do painel.

No celular, ao abrir o link, o navegador oferece **"Adicionar à tela inicial"** — isso instala o painel como um app de verdade (ícone próprio, tela cheia).

---

## Sobre o acesso

O link é **aberto**: qualquer pessoa que tiver o endereço pode ver e editar os dados, sem necessidade de login — como combinado. Isso significa que o link não deve ser divulgado publicamente, apenas compartilhado diretamente com a equipe do evento (WhatsApp, e-mail interno etc.).

Se depois quiserem adicionar uma senha simples de equipe ou um login individual, é possível evoluir para isso no Supabase (Auth) sem trocar de ferramenta — é só avisar.

## Estrutura das seções

- **Início** — visão geral, contagem regressiva e progresso de cada frente
- **Programação** — os momentos do dia (ministração, oração, adoração, Sala Profética, evangelismo)
- **Decoração** — checklist dos elementos de ambientação
- **Gastronomia** — itens de comida, doces e bebidas
- **Artesãos** — cadastro, vendas do dia e cálculo automático do repasse 70/30
- **Equipe** — tarefas por frente (Homens do Legado / Eventos / Comunicação)
- **Financeiro** — lançamentos de receita/despesa e resultado destinado ao Programa Legacy
- **Orçamentos** — valores previstos x realizados por categoria
- **Documentos** — upload de arquivos (PDF, planilhas) e links externos que consolidam o evento
- **Mural** — comunicados fixáveis da equipe, visíveis para todos

Todas as páginas têm o botão **← Menu Principal** no topo, e o logotipo no cabeçalho também leva de volta ao início a qualquer momento.

## Manutenção

Qualquer alteração de estrutura (novos campos, novas seções) é feita editando `app.js` e, se necessário, `schema.sql`. Não há processo de build — é só editar e recarregar a página.
