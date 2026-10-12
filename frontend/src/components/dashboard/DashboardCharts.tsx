"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  RiskDistribution,
  RiskTrendItem,
  TransactionStatusDistribution,
  TransactionTrendItem,
} from "@/types/fraudshield";


interface DashboardChartsProps {

  riskDistribution:
    RiskDistribution;

  transactionStatus:
    TransactionStatusDistribution;

  transactionTrend:
    TransactionTrendItem[];

  riskTrend:
    RiskTrendItem[];
}


// =====================================================
// COLORS
// =====================================================

const riskColors = [
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
];


const statusColors = [
  "#22c55e",
  "#ef4444",
  "#f97316",
  "#eab308",
];


// =====================================================
// COMPONENT
// =====================================================

export default function DashboardCharts({
  riskDistribution,
  transactionStatus,
  transactionTrend,
  riskTrend,
}: DashboardChartsProps) {


  const riskData = [

    {
      name: "Low",
      value:
        riskDistribution.LOW,
    },

    {
      name: "Medium",
      value:
        riskDistribution.MEDIUM,
    },

    {
      name: "High",
      value:
        riskDistribution.HIGH,
    },

    {
      name: "Critical",
      value:
        riskDistribution.CRITICAL,
    },
  ];


  const statusData = [

    {
      name: "Approved",
      value:
        transactionStatus.APPROVED,
    },

    {
      name: "Flagged",
      value:
        transactionStatus.FLAGGED,
    },

    {
      name: "Declined",
      value:
        transactionStatus.DECLINED,
    },

    {
      name: "Pending",
      value:
        transactionStatus.PENDING,
    },
  ];


  return (

    <div
      className="
        mt-6
        grid
        gap-6
        xl:grid-cols-2
      "
    >

      {/* =====================================================
          RISK DISTRIBUTION
      ===================================================== */}

      <ChartContainer
        title="Risk Distribution"
        description="Distribution of transaction risk levels."
      >

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <PieChart>

            <Pie
              data={
                riskData
              }
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={115}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >

              {
                riskData.map(
                  (
                    entry,
                    index
                  ) => (

                  <Cell
                    key={
                      entry.name
                    }
                    fill={
                      riskColors[
                        index %
                        riskColors.length
                      ]
                    }
                  />

                ))
              }

            </Pie>


            <Tooltip
              contentStyle={{
                background:
                  "#020617",

                border:
                  "1px solid #334155",

                borderRadius:
                  "12px",
              }}
            />


            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </ChartContainer>


      {/* =====================================================
          TRANSACTION STATUS
      ===================================================== */}

      <ChartContainer
        title="Transaction Status"
        description="Current status distribution of analyzed transactions."
      >

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <BarChart
            data={
              statusData
            }
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
            />


            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{
                fontSize: 12,
              }}
            />


            <YAxis
              allowDecimals={
                false
              }
              stroke="#64748b"
            />


            <Tooltip
              contentStyle={{
                background:
                  "#020617",

                border:
                  "1px solid #334155",

                borderRadius:
                  "12px",
              }}
            />


            <Bar
              dataKey="value"
              radius={[
                6,
                6,
                0,
                0,
              ]}
            >

              {
                statusData.map(
                  (
                    entry,
                    index
                  ) => (

                  <Cell
                    key={
                      entry.name
                    }
                    fill={
                      statusColors[
                        index %
                        statusColors.length
                      ]
                    }
                  />

                ))
              }

            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </ChartContainer>


      {/* =====================================================
          TRANSACTION ACTIVITY
      ===================================================== */}

      <ChartContainer
        title="Transaction Activity"
        description="Analyzed and flagged transactions during the last 7 days."
      >

        {
          transactionTrend.length >
          0
            ? (

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <LineChart
                data={
                  transactionTrend
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />


                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{
                    fontSize: 11,
                  }}
                />


                <YAxis
                  allowDecimals={
                    false
                  }
                  stroke="#64748b"
                />


                <Tooltip
                  contentStyle={{
                    background:
                      "#020617",

                    border:
                      "1px solid #334155",

                    borderRadius:
                      "12px",
                  }}
                />


                <Legend />


                <Line
                  type="monotone"
                  dataKey="total"
                  name="Transactions"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                />


                <Line
                  type="monotone"
                  dataKey="flagged"
                  name="Flagged"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <EmptyChart />

          )
        }

      </ChartContainer>


      {/* =====================================================
          RISK TREND
      ===================================================== */}

      <ChartContainer
        title="Average Risk Trend"
        description="Average final fraud risk score during the last 7 days."
      >

        {
          riskTrend.length >
          0
            ? (

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <LineChart
                data={
                  riskTrend
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />


                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{
                    fontSize: 11,
                  }}
                />


                <YAxis
                  domain={[
                    0,
                    100,
                  ]}
                  stroke="#64748b"
                />


                <Tooltip
                  contentStyle={{
                    background:
                      "#020617",

                    border:
                      "1px solid #334155",

                    borderRadius:
                      "12px",
                  }}
                />


                <Line
                  type="monotone"
                  dataKey="averageRisk"
                  name="Average Risk"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <EmptyChart />

          )
        }

      </ChartContainer>

    </div>
  );
}


// =====================================================
// CONTAINER
// =====================================================

function ChartContainer({
  title,
  description,
  children,
}: {
  title: string;

  description:
    string;

  children:
    React.ReactNode;
}) {

  return (

    <section
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >

      <h2
        className="
          text-xl
          font-semibold
          text-white
        "
      >
        {title}
      </h2>


      <p
        className="
          mt-1
          text-sm
          text-slate-500
        "
      >
        {description}
      </p>


      <div
        className="
          mt-6
          w-full
        "
      >
        {children}
      </div>

    </section>
  );
}


// =====================================================
// EMPTY CHART
// =====================================================

function EmptyChart() {

  return (

    <div
      className="
        flex
        h-[320px]
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-slate-800
        bg-slate-950
      "
    >

      <p
        className="
          text-sm
          text-slate-500
        "
      >
        No trend data available yet.
      </p>

    </div>
  );
}