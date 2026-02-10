"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

interface ChartProps {
  monthlyData: { name: string; total: number }[];
  statusData: { name: string; value: number; color: string }[];
}

export function AdminCharts({ monthlyData, statusData }: ChartProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* 1. 월별 가입자 추이 (막대 그래프) */}
      <div className="col-span-4 bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="font-semibold mb-4">📈 월별 신규 가입자</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}명`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
                cursor={{ fill: "#f4f4f5" }}
              />
              <Bar dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 회원 상태 비율 (파이 차트) */}
      <div className="col-span-3 bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="font-semibold mb-4">🍰 회원 현황 비율</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
