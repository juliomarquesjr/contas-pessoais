"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Inbox } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { TransactionItem } from "@/components/transaction-item";
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
}: {
  transactions: TransactionWithCategory[];
  categories: Category[];
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

  return (
    <div className="space-y-4">
      {/* Busca + filtro */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lançamento"
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition",
            activeCount > 0
              ? "border-primary bg-accent text-primary"
              : "border-border bg-card text-foreground hover:bg-muted",
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
        <div className="space-y-6">
          {expense.length > 0 && (
            <Section title="Saídas">
              {expense.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} categories={categories} />
              ))}
            </Section>
          )}
          {income.length > 0 && (
            <Section title="Entradas">
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
            <p className="mb-2 text-sm font-medium">Período</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  De
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Até
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-full border border-border py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Limpar
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 px-1 text-sm font-semibold text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
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
