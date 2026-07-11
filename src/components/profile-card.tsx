"use client";

import { useState } from "react";
import { Home, Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ProfileEditor } from "@/components/profile-editor";
import type { CurrentUser } from "@/lib/queries";

export function ProfileCard({
  me,
  householdName,
}: {
  me: CurrentUser;
  householdName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-gradient relative flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
      <Avatar
        src={me.avatarUrl}
        name={me.name}
        className="h-16 w-16 rounded-2xl text-2xl shadow-lg shadow-primary/20"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold">{me.name}</p>
        <p className="truncate text-sm text-muted-foreground">{me.email}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Home className="h-3 w-3" />
          {householdName}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Editar perfil"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition hover:text-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <ProfileEditor open={open} onClose={() => setOpen(false)} me={me} />
    </div>
  );
}
