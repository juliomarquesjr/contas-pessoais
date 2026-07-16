"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { authenticate } from "../actions";
import { AuthField } from "../auth-field";
import { SubmitButton } from "@/components/submit-button";
import { LogoTile } from "@/components/ui/page-header";

export default function LoginPage() {
  const [state, formAction] = useActionState(authenticate, undefined);

  return (
    <>
      {/* Bloco de marca ocupa o miolo; o formulário ancora embaixo. */}
      <div className="flex flex-1 flex-col justify-center">
        <LogoTile className="animate-float h-16 w-16 rounded-[19px] [&_svg]:h-8.5 [&_svg]:w-8.5" />
        <p className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.24em] text-primary-ink">
          O livro-caixa da família
        </p>
        <h1 className="font-display text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-white">
          Bem-vindo
          <br />
          de volta.
        </h1>
        <p className="mt-4 max-w-70 text-[15.5px] leading-normal text-white/60">
          Entre para continuar cuidando das contas da casa, mês a mês.
        </p>
      </div>

      <form action={formAction} className="flex shrink-0 flex-col gap-3.5">
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
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        {state?.error && (
          <p className="rounded-xl border border-expense/40 bg-expense/15 px-3 py-2 text-sm text-white">
            {state.error}
          </p>
        )}

        <SubmitButton className="mt-1 w-full" size="lg">
          Entrar
        </SubmitButton>

        <p className="mt-1 text-center text-[14.5px] text-white/55">
          Ainda não tem conta?{" "}
          <Link href="/registrar" className="font-semibold text-primary-ink">
            Criar conta
          </Link>
        </p>
      </form>
    </>
  );
}
