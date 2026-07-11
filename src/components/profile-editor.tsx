"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { AvatarUploader } from "@/components/avatar-uploader";
import {
  updateMyProfile,
  type ProfileState,
} from "@/app/(app)/actions/profile";

export function ProfileEditor({
  open,
  onClose,
  me,
}: {
  open: boolean;
  onClose: () => void;
  me: { name: string; phone: string | null; avatarUrl: string | null };
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ProfileState, FormData>(
    updateMyProfile,
    undefined,
  );
  const [avatar, setAvatar] = useState<string | null>(me.avatarUrl);
  const [name, setName] = useState(me.name);

  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setAvatar(me.avatarUrl);
      setName(me.name);
    }
  }

  useEffect(() => {
    if (state?.ok) {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  return (
    <Sheet open={open} onClose={onClose} title="Editar perfil">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="avatarUrl" value={avatar ?? ""} />

        <AvatarUploader value={avatar} name={name || "?"} onChange={setAvatar} />

        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone (opcional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={me.phone ?? ""}
            placeholder="(00) 00000-0000"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
            {state.error}
          </p>
        )}

        <SubmitButton className="w-full" size="lg">
          Salvar
        </SubmitButton>
      </form>
    </Sheet>
  );
}
