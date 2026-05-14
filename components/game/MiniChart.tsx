"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface MiniChartProps {
  data: Array<{ label: string; value: number }>;
  colour?: string;
  height?: number;
}

export function MiniChart({ data, colour = "#22c55e", height = 60 }: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={colour}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: colour }}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(224 71.4% 6.5%)",
            border: "1px solid hsl(215 27.9% 16.9%)",
            borderRadius: "6px",
            fontSize: "11px",
            padding: "4px 8px",
          }}
          labelStyle={{ color: "hsl(210 20% 98%)", fontSize: "11px" }}
          itemStyle={{ color: colour }}
          formatter={(value: number) => [value.toFixed(1), ""]}
          labelFormatter={(label) => String(label)}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
