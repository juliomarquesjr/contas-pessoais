import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";

/**
 * Ícone da categoria sobre a tinta da própria cor — o "swatch" que aparece
 * nas linhas de lançamento, no dashboard e nos seletores.
 *
 * O `22` no fim do hex é ~13% de alpha: o handoff especifica a tinta assim
 * (ex.: #c98a1222). Estava repetido em quatro telas.
 */
const SIZES = {
  sm: { box: "h-[38px] w-[38px] rounded-[11px]", icon: "h-4.75 w-4.75" },
  md: { box: "h-10.5 w-10.5 rounded-[13px]", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-[14px]", icon: "h-6 w-6" },
} as const;

export function CategorySwatch({
  color,
  icon,
  size = "md",
  className,
}: {
  color: string;
  icon: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        s.box,
        className,
      )}
      style={{ backgroundColor: `${color}22`, color }}
    >
      <CategoryIcon name={icon} className={s.icon} />
    </span>
  );
}
