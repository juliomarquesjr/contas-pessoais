"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ChevronRight, KeyRound, Mail } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import {
  addMember,
  resetMemberPassword,
  updateMemberEmail,
  type ProfileState,
} from "@/app/(app)/actions/profile";

type Member = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function MemberManager({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: number;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [managing, setManaging] = useState<Member | null>(null);

  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Membros da casa
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {members.map((m) => {
          const isSelf = m.id === currentUserId;
          return (
            <button
              key={m.id}
              type="button"
              disabled={isSelf}
              onClick={() => !isSelf && setManaging(m)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition disabled:opacity-100 enabled:hover:bg-muted/50"
            >
              <Avatar
                src={m.avatarUrl}
                name={m.name}
                className="h-10 w-10 rounded-full text-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {m.name}
                  {isSelf && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      Você
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.email}
                </p>
              </div>
              {!isSelf && (
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
            <UserPlus className="h-5 w-5" />
          </span>
          <span className="font-medium text-primary">Adicionar membro</span>
        </button>
      </div>

      <AddMemberSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <ManageMemberSheet
        member={managing}
        onClose={() => setManaging(null)}
      />
    </section>
  );
}

function AddMemberSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ProfileState, FormData>(
    addMember,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  return (
    <Sheet open={open} onClose={onClose} title="Adicionar membro">
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="m-name">Nome</Label>
          <Input id="m-name" name="name" placeholder="Nome da pessoa" required />
        </div>
        <div>
          <Label htmlFor="m-email">Email de login</Label>
          <Input
            id="m-email"
            name="email"
            type="email"
            placeholder="pessoa@casa.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="m-password">Senha provisória</Label>
          <Input
            id="m-password"
            name="password"
            type="text"
            placeholder="Mínimo 6 caracteres"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            A pessoa pode trocar a senha depois nos ajustes.
          </p>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
            {state.error}
          </p>
        )}

        <SubmitButton className="w-full" size="lg">
          Adicionar
        </SubmitButton>
      </form>
    </Sheet>
  );
}

function ManageMemberSheet({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pwState, pwAction] = useActionState<ProfileState, FormData>(
    resetMemberPassword,
    undefined,
  );
  const [emailState, emailAction] = useActionState<ProfileState, FormData>(
    updateMemberEmail,
    undefined,
  );

  useEffect(() => {
    if (emailState?.ok) router.refresh();
  }, [emailState, router]);

  return (
    <Sheet
      open={!!member}
      onClose={onClose}
      title={member ? `Gerenciar ${member.name}` : "Membro"}
    >
      {member && (
        <div className="space-y-6">
          <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            Você pode ajudar {member.name} a recuperar o acesso redefinindo a
            senha ou o email de login. Os dados pessoais só a própria pessoa
            altera.
          </p>

          {/* Redefinir senha */}
          <form action={pwAction} className="space-y-2">
            <input type="hidden" name="targetId" value={member.id} />
            <Label htmlFor="new-pw" className="flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-primary" /> Nova senha
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-pw"
                name="password"
                type="text"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <SubmitButton variant="secondary">Salvar</SubmitButton>
            </div>
            {pwState?.error && (
              <p className="text-xs text-expense">{pwState.error}</p>
            )}
            {pwState?.ok && (
              <p className="text-xs text-income">Senha atualizada ✓</p>
            )}
          </form>

          {/* Alterar email de login */}
          <form action={emailAction} className="space-y-2">
            <input type="hidden" name="targetId" value={member.id} />
            <Label htmlFor="new-email" className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" /> Email de login
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                name="email"
                type="email"
                defaultValue={member.email}
                required
              />
              <SubmitButton variant="secondary">Salvar</SubmitButton>
            </div>
            {emailState?.error && (
              <p className="text-xs text-expense">{emailState.error}</p>
            )}
            {emailState?.ok && (
              <p className="text-xs text-income">Email atualizado ✓</p>
            )}
          </form>
        </div>
      )}
    </Sheet>
  );
}
