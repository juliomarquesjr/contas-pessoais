"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Home, UserPlus } from "lucide-react";
import { register } from "../actions";
import { AuthField } from "../auth-field";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined);
  const [mode, setMode] = useState<"new" | "invite">("new");

  return (
    <>
      <div className="mb-7 shrink-0">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-ink">
          Comece agora
        </p>
        <h1 className="font-display text-[34px] font-medium leading-[1.05] tracking-[-0.02em] text-white">
          Criar sua conta
        </h1>
        <p className="mt-3 text-[15px] leading-normal text-white/60">
          Organize as contas da casa com quem mora com você.
        </p>
      </div>

      {/* Fora do handoff, mas é como a pessoa escolhe entre abrir uma casa
          nova ou entrar na de alguém — não dá para perder. */}
      <div className="mb-5 grid shrink-0 grid-cols-2 gap-1 rounded-[14px] border border-white/13 bg-white/6 p-1.25">
        <button
          type="button"
          onClick={() => setMode("new")}
          aria-pressed={mode === "new"}
          className={cn(
            "rounded-[11px] py-2.5 text-[13.5px] font-semibold transition",
            mode === "new"
              ? "bg-white/14 text-white"
              : "text-white/50",
          )}
        >
          Nova casa
        </button>
        <button
          type="button"
          onClick={() => setMode("invite")}
          aria-pressed={mode === "invite"}
          className={cn(
            "rounded-[11px] py-2.5 text-[13.5px] font-semibold transition",
            mode === "invite"
              ? "bg-white/14 text-white"
              : "text-white/50",
          )}
        >
          Entrar numa casa
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-3.5 pb-2">
        <AuthField
          icon={User}
          label="Nome"
          id="name"
          name="name"
          placeholder="Como te chamam"
          required
        />

        {mode === "new" ? (
          <AuthField
            icon={Home}
            label="Nome da casa"
            id="householdName"
            name="householdName"
            placeholder="Nossa Casa"
          />
        ) : (
          <div>
            <AuthField
              icon={UserPlus}
              label="E-mail de quem já usa"
              id="inviteEmail"
              name="inviteEmail"
              type="email"
              placeholder="parceiro@casa.com"
              required
            />
            <p className="mt-1.5 text-xs text-white/45">
              Você entra na mesma casa dessa pessoa e compartilha os lançamentos.
            </p>
          </div>
        )}

        <AuthField
          icon={Mail}
          label="E-mail"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@casa.com"
          required
        />
        <AuthField
          icon={Lock}
          label="Senha"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          required
        />

        {state?.error && (
          <p className="rounded-xl border border-expense/40 bg-expense/15 px-3 py-2 text-sm text-white">
            {state.error}
          </p>
        )}

        <SubmitButton className="mt-1 w-full" size="lg">
          Criar conta
        </SubmitButton>

        <p className="mt-1 text-center text-[14.5px] text-white/55">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary-ink">
            Entrar
          </Link>
        </p>
      </form>
    </>
  );
}
