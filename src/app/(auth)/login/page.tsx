"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, formAction] = useActionState(authenticate, undefined);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
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
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full">Entrar</SubmitButton>
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
