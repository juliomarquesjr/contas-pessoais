"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Inbox } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { SectionTitle } from "@/components/ui/page-header";
import { TransactionItem } from "@/components/transaction-item";
import { DateRangeCalendar } from "@/components/date-range-calendar";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/schema";
import type { TransactionWithCategory } from "@/lib/queries";

type Status = "all" | "paid" | "pending";
type TypeFilter = "all" | "income" | "expense";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function MonthTransactions({
  transactions,
  categories,
  monthKey,
}: {
  transactions: TransactionWithCategory[];
  categories: Category[];
  monthKey: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const activeCount =
    (status !== "all" ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return transactions.filter((t) => {
      if (status === "paid" && !t.paid) return false;
      if (status === "pending" && t.paid) return false;
      if (type !== "all" && t.type !== type) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (q) {
        const hay = normalize(`${t.description} ${t.categoryName ?? ""}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, query, status, type, from, to]);

  const expense = filtered.filter((t) => t.type === "expense");
  const income = filtered.filter((t) => t.type === "income");

  function clearFilters() {
    setStatus("all");
    setType("all");
    setFrom("");
    setTo("");
  }

  function clearAll() {
    clearFilters();
    setQuery("");
  }

  return (
    <div className="space-y-4">
      {/* Busca + filtro */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lançamento"
            className="h-12 w-full rounded-[14px] border border-border bg-card pl-11 pr-9 text-[14.5px] text-foreground placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Filtros"
          onClick={() => setFilterOpen(true)}
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border transition active:scale-95",
            activeCount > 0
              ? "border-primary bg-accent text-primary"
              : "border-border bg-card text-foreground",
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="font-medium">Nada encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste a busca ou os filtros.
          </p>
          {(activeCount > 0 || query) && (
            <button
              type="button"
              onClick={() => {
                clearFilters();
                setQuery("");
              }}
              className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary"
            >
              Limpar tudo
            </button>
          )}
        </div>
      ) : (
        <div>
          {expense.length > 0 && (
            <Section title="Saídas" count={expense.length}>
              {expense.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} categories={categories} />
              ))}
            </Section>
          )}
          {income.length > 0 && (
            <Section title="Entradas" count={income.length}>
              {income.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} categories={categories} />
              ))}
            </Section>
          )}
        </div>
      )}

      {/* Menu de filtros */}
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filtros">
        <div className="space-y-5">
          <FilterGroup label="Situação">
            <ChipOption active={status === "all"} onClick={() => setStatus("all")}>
              Todos
            </ChipOption>
            <ChipOption
              active={status === "paid"}
              onClick={() => setStatus("paid")}
            >
              Pago / Recebido
            </ChipOption>
            <ChipOption
              active={status === "pending"}
              onClick={() => setStatus("pending")}
            >
              Pendente
            </ChipOption>
          </FilterGroup>

          <FilterGroup label="Tipo">
            <ChipOption active={type === "all"} onClick={() => setType("all")}>
              Todos
            </ChipOption>
            <ChipOption
              active={type === "expense"}
              onClick={() => setType("expense")}
            >
              Saídas
            </ChipOption>
            <ChipOption
              active={type === "income"}
              onClick={() => setType("income")}
            >
              Entradas
            </ChipOption>
          </FilterGroup>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Período</p>
              <p className="text-xs text-muted-foreground">
                {from && to
                  ? "Intervalo selecionado"
                  : from
                    ? "Toque no dia final"
                    : "Toque para selecionar"}
              </p>
            </div>
            <DateRangeCalendar
              monthKey={monthKey}
              from={from}
              to={to}
              onChange={(f, t) => {
                setFrom(f);
                setTo(t);
              }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Limpar tudo
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
            >
              Ver {filtered.length}{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle>
        {title} · {count} {count === 1 ? "lançamento" : "lançamentos"}
      </SectionTitle>
      {/* px-4.5 + py-0.5: as linhas trazem o próprio py-3 e o divisor */}
      <div className="divide-y divide-border rounded-[18px] border border-border bg-card px-4.5 py-0.5">
        {children}
      </div>
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ChipOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-primary bg-accent text-primary"
          : "border-border text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
