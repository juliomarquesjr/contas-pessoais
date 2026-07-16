# Design System — Finanças da Casa (v2 "Livro-caixa")

Guia curto para manter a **coerência visual** e a identidade do app.
Mobile-first (largura base 390px), amigável e claro para usuários leigos.

## Identidade
- **Papel e tinta.** No claro, o fundo é papel marfim (`#f4f1e8`) com cards
  quase brancos; no escuro, tinta (`#100e18`). Login e Registrar são as
  **únicas telas escuras nos dois temas** (token `--ink`).
- **Cor de acento:** violeta por padrão, personalizável por membro
  (ver "Acento" abaixo).
- **Tom:** amigável, direto. Nada de jargão financeiro.
- **Formas:** cards 18–22px, controles/inputs 11–15px, pílulas 99px.

## Tokens (`globals.css`, claro/escuro)

Os nomes seguem a semântica do app, que difere do handoff em três pontos —
atenção ao traduzir do arquivo de design:

| No handoff | Aqui | Papel |
|---|---|---|
| `--muted` (texto) | `--muted-foreground` | texto secundário |
| `--card-2` (superfície) | `--muted` | superfície de inputs |
| `--muted-2` | `--faint` | placeholder/ícone fraco |
| `--accent` (marca) | `--primary` | a marca |
| `--accent-tint` | `--accent` | tinta do acento |
| `--line` / `--line-2` | `--border` / `--border-strong` | hairlines |

Semânticas: `income`, `expense`, `pending` (a pagar), `receive` (a receber) —
cada uma com o par `-soft` (tinta de fundo). **"A pagar" (âmbar) e "A receber"
(azul) são estados distintos** — não use âmbar para os dois.

Também: `--foreground-soft`, `--primary-strong` (fim do gradiente),
`--primary-ink` (acento legível sobre escuro), `--shadow-card`, `--shadow-dock`.

Use sempre os tokens (`bg-card`, `text-muted-foreground`, `text-pending`) —
nada de `amber-500` solto.

## Tipografia
- **Display** (`font-display`, Bricolage Grotesque): títulos de tela (20px),
  títulos de seção (18px) e as cifras grandes.
- **UI/corpo** (`font-sans`, Geist).
- **Números densos** (`font-mono`, Geist Mono) + `.tnum`: valores em listas.
- **`.snum`**: as cifras grandes (saldo, totais) — display + tabular.
- **`.eyebrow`**: sobrelinha das telas (10.5px/700/uppercase, cor do acento).

## Acento (`src/lib/accents.ts`)
Cada membro escolhe uma cor; são 15 (os 4 do handoff — Violeta, Índigo, Teal,
Ameixa — com tripleta exata, e 11 herdadas que derivam por `color-mix`).

Dois cuidados aprendidos na marra:
1. **O acento é injetado no `:root`** por `(app)/layout.tsx`, não num `<div>`.
   Sheets e diálogos usam portal para `document.body` e ficariam fora de
   qualquer escopo menor.
2. **`--primary-foreground` sai da luminância do acento**, não do tema: um
   acento escuro precisa de texto branco mesmo no tema escuro.

## Componentes base (`src/components/ui`)
- **PageHeader** — uma linha: slot esquerdo (logo nas telas raiz, voltar nas
  internas), sobrelinha + título 20px, slot de ação. Sticky. **Toda tela usa.**
  O slot de ação é estreito: cabe *um* controle (a navegação de mês, por ex.).
- **ScreenBody** — corpo com o padding lateral de 22px.
- **SectionTitle** — título de seção display 18px ("Onde vai o dinheiro",
  "Saídas · 15", "A Casa").
- **Button** — `primary | secondary | outline | ghost | danger | income`,
  tamanhos `sm | md | lg | icon`. Retângulo arredondado com gradiente (não pílula).
- **Card / CardContent**, **Input / Label / Select** (label = micro maiúscula).
- **Sheet** / **ConfirmDialog** — portais; **toda ação destrutiva confirma**.
- **Fab** — ação primária flutuante, acima da dock.
- **CategorySwatch** — ícone da categoria sobre tinta da própria cor.
- **useMounted** (`lib/use-mounted.ts`) — conteúdo só-cliente (portais) sem
  hydration mismatch. Não guarde portal com `typeof document`.

## Navegação
Dock **flutuante** centralizada, 5 itens (Início, Mês, Gráficos, Compras,
Ajustes), translúcida com blur. O item ativo vira pílula preenchida com o
acento (ícone + rótulo); os demais, só ícone. Ações primárias (＋) são FAB
no canto inferior direito, acima da dock.

## Animações (`globals.css`)
`animate-fade-up` (entrada de cards, com `[animation-delay:*]` em cascata),
`animate-grow-x` (barras), `animate-float`, `.skeleton`.
Tudo respeita `prefers-reduced-motion`.

## Padrões de tela
1. `PageHeader` + `ScreenBody`.
2. Conteúdo em cards, `space-y-4`.
3. Estados vazios com ícone + texto amigável orientando a próxima ação.
4. Valores em `formatBRL`; sempre tabular (`.snum`, `.tnum` ou `font-mono`).
