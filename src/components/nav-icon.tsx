import {
  Home,
  CalendarDays,
  PieChart,
  ShoppingCart,
  Car,
  Settings,
  type LucideIcon,
} from "lucide-react";

/** Ícones da navegação — os nomes vêm de lib/dock.ts. */
const MAP: Record<string, LucideIcon> = {
  home: Home,
  calendar: CalendarDays,
  chart: PieChart,
  cart: ShoppingCart,
  car: Car,
  settings: Settings,
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Home;
  return <Icon className={className} />;
}
