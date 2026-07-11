"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatBRL } from "@/lib/money";

export type CategorySlice = {
  name: string;
  value: number;
  color: string;
};

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-52 w-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="font-bold tabular-nums">{formatBRL(total)}</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
            <span className="w-24 text-right font-medium tabular-nums">
              {formatBRL(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
