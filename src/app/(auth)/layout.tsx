import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-gradient flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Finanças da Casa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O controle financeiro da família, mês a mês.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
