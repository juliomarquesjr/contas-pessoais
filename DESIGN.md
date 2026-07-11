# Design System — Finanças da Casa

Guia curto para manter a **coerência visual** e a identidade do app.
Mobile-first, amigável e claro para usuários leigos.

## Identidade
- **Cor principal:** roxo/violeta (`--primary`).
- **Tom:** amigável, direto, com emojis pontuais. Nada de jargão financeiro.
- **Formas:** cantos bem arredondados (`rounded-2xl`/`rounded-3xl`), sombras suaves.
- **Cores semânticas:** entradas/positivo = verde (`--income`); saídas/negativo =
  vermelho-rosado (`--expense`); pendências/atenção = âmbar.

## Tokens (definidos em `globals.css`, claro/escuro)
`background, foreground, card, muted, primary, accent, border, ring, income,
income-soft, expense, expense-soft`. Use sempre os tokens (ex.: `bg-card`,
`text-muted-foreground`, `text-income`) — nunca cores fixas fora do necessário.

## Componentes base (`src/components/ui`)
- **PageHeader** — cabeçalho padrão de toda tela: título 2xl bold + subtítulo +
  ação opcional. É o que distingue o topo do conteúdo. **Toda tela usa.**
- **Button** — variantes `primary | secondary | outline | ghost | danger`,
  tamanhos `sm | md | lg | icon`, formato pílula.
- **Card / CardContent** — blocos de conteúdo.
- **Input / Label / Select** — campos de formulário.
- **Sheet** — bottom sheet para formulários (novo lançamento, categoria, lista).
- **ConfirmDialog** — **toda ação destrutiva ou relevante confirma aqui** (excluir,
  marcar pago/recebido, copiar mês, lançar gasto). Tons: `primary | danger | success`.
- **Skeleton** + `loading.tsx` — estados de carregamento com brilho (shimmer).

## Navegação
Bottom tab bar fixa com 5 itens. O item central **Início** é um botão circular
elevado e destacado (primary). Demais: Mês, Gráficos, Compras, Ajustes.
Ações primárias (＋) ficam como FAB no canto inferior direito (não colidem com o
botão central).

## Animações (`globals.css`)
- `animate-fade-up` — entrada de cards (com `[animation-delay:*]` para cascata).
- `animate-grow-x` — barras de progresso.
- `animate-wave` — aceno do 👋.
- `.skeleton` — carregamento.
- Tudo respeita `prefers-reduced-motion`.

## Padrões de tela
1. `PageHeader` no topo.
2. Conteúdo em cards, espaçados com `space-y-4`/`space-y-5`.
3. Estados vazios sempre com ícone + texto amigável orientando a próxima ação.
4. Valores em `formatBRL` e `tabular-nums`.
