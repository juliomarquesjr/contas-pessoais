"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallCard() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    const ua = window.navigator.userAgent.toLowerCase();
    // Detecção única do ambiente do navegador (client-only) no mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    /* eslint-enable react-hooks/set-state-in-effect */

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-income-soft text-income">
            <Check className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium">App instalado neste dispositivo 🎉</p>
        </CardContent>
      </Card>
    );
  }

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">Instalar aplicativo</p>
            <p className="text-xs text-muted-foreground">
              Acesso rápido pela tela inicial do celular.
            </p>
          </div>
        </div>

        {deferred ? (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground transition active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            Instalar agora
          </button>
        ) : isIOS ? (
          <div className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            No iPhone/iPad: toque em{" "}
            <Share className="inline h-4 w-4 -translate-y-0.5 text-primary" />{" "}
            <strong>Compartilhar</strong> e depois em{" "}
            <span className="whitespace-nowrap">
              <Plus className="inline h-4 w-4 -translate-y-0.5 text-primary" />{" "}
              <strong>Adicionar à Tela de Início</strong>
            </span>
            .
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            Abra pelo navegador do celular (Chrome/Safari). A opção de instalar
            aparece aqui ou no menu do navegador.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
