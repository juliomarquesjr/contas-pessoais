"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { authenticate } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, formAction] = useActionState(authenticate, undefined);

  return (
    <Card className="rounded-3xl shadow-xl shadow-primary/5">
      <CardContent className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Bem-vindo de volta 👋</h2>
          <p className="text-sm text-muted-foreground">
            Entre para continuar cuidando das contas.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@casa.com"
                required
                className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full" size="lg">
            Entrar
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/registrar" className="font-medium text-primary">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
