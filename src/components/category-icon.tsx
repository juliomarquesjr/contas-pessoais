import {
  Home,
  ShoppingCart,
  Car,
  Heart,
  Smile,
  Book,
  FileText,
  Wallet,
  Plus,
  TrendingUp,
  Tag,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  home: Home,
  "shopping-cart": ShoppingCart,
  car: Car,
  heart: Heart,
  smile: Smile,
  book: Book,
  "file-text": FileText,
  wallet: Wallet,
  plus: Plus,
  "trending-up": TrendingUp,
  tag: Tag,
};

export const ICON_OPTIONS = Object.keys(MAP);

export function CategoryIcon({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) {
  const Icon = (name && MAP[name]) || Tag;
  return <Icon className={className} />;
}
