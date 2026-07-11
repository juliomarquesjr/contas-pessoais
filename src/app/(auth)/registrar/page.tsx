"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined);
  const [mode, setMode] = useState<"new" | "invite">("new");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode("new")}
            className={cn(
              "rounded-full py-2 text-sm font-medium transition",
              mode === "new"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Nova casa
          </button>
          <button
            type="button"
            onClick={() => setMode("invite")}
            className={cn(
              "rounded-full py-2 text-sm font-medium transition",
              mode === "invite"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Entrar numa casa
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Seu nome</Label>
            <Input id="name" name="name" placeholder="Como te chamam" required />
          </div>

          {mode === "new" ? (
            <div>
              <Label htmlFor="householdName">Nome da casa</Label>
              <Input
                id="householdName"
                name="householdName"
                placeholder="Nossa Casa"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="inviteEmail">Email de quem já usa</Label>
              <Input
                id="inviteEmail"
                name="inviteEmail"
                type="email"
                placeholder="parceiro@casa.com"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Você entra na mesma casa dessa pessoa e compartilha os
                lançamentos.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="email">Seu email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@casa.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full">Criar conta</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
