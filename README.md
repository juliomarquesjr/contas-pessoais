# Finanças da Casa 💜

App **mobile-first** de controle financeiro familiar: entradas e saídas mês a mês,
gráficos, categorias, lista de compras e tema claro/escuro em tons de roxo.

Feito com **Next.js 16 (App Router)**, **Drizzle ORM + Neon PostgreSQL**,
**Auth.js**, **Tailwind CSS** e **Recharts**.

## Funcionalidades

- 🔐 Login por email e senha; várias pessoas compartilham a mesma "casa".
- 📅 Tela do mês com saldo, entradas, saídas e navegação entre meses.
- ➕ Adicionar / editar / excluir lançamentos por categoria.
- 📋 Botão **copiar mês anterior** para montar o mês rapidamente.
- 📊 Gráficos: entradas x saídas (6 meses), evolução do saldo e saídas por categoria.
- 🛒 Lista de compras por fornecedor/local, com opção de lançar o total como gasto.
- 🎨 Categorias editáveis (cor + ícone) e tema claro/escuro.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL e AUTH_SECRET
npm run db:migrate           # cria as tabelas no Neon
npm run db:seed              # cria a casa, 2 usuários e categorias padrão
npm run dev
```

Acesse http://localhost:3000. Usuários do seed:

- `julio@casa.com` / `mudar123`
- `parceiro@casa.com` / `mudar123`

> Troque essas senhas depois (ou crie contas novas em `/registrar`).

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` / `npm start` | Build e execução de produção |
| `npm run db:generate` | Gera migrations a partir do schema |
| `npm run db:migrate` | Aplica migrations no banco |
| `npm run db:seed` | Popula casa/usuários/categorias iniciais |
| `npm run db:studio` | Abre o Drizzle Studio |

## Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em vercel.com, **New Project → Import** do repositório.
3. Em **Environment Variables**, configure:
   - `DATABASE_URL` (Neon)
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
4. Deploy. Cada push na branch principal publica em produção e cada PR gera um
   preview automático.

As migrations rodam contra o Neon com `npm run db:migrate` (localmente ou num
passo de CI). O seed é opcional em produção — você pode criar sua conta em
`/registrar`.

## Segurança

- Nunca comite `.env*` (já está no `.gitignore`).
- As senhas são armazenadas com **bcrypt**.
- Todas as consultas são isoladas por `household_id` da sessão.
