// HoldingsChart.js
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#FF6F91",
  "#A28BFF",
  "#FF9472",
];

export default function HoldingsChart({ holdings, onSelectStock }) {
  const data = useMemo(() => {
    if (!Array.isArray(holdings)) return [];
    return holdings
      .map((h) => {
        const price = Number(h.currentPrice ?? h.averagePrice ?? 0);
        const qty = Number(h.quantity ?? 0);
        return { name: h.symbol || "N/A", value: qty * price };
      })
      .filter((d) => d.value > 0);
  }, [holdings]);

  if (!data.length)
    return <div style={{ padding: 12 }}>No holdings to display.</div>;

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(1)}%`
            }
            onClick={(_, index) => {
              if (onSelectStock) onSelectStock(data[index].name);
            }}
            cursor="pointer"
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Value",
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
