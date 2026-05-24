import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const contributionData = [
  { hospital: "CHU Alger", weight: 0.18, samples: 4200 },
  { hospital: "CHU Oran", weight: 0.15, samples: 3800 },
  { hospital: "CHU Constantine", weight: 0.13, samples: 3200 },
  { hospital: "Hôpital Tunis", weight: 0.12, samples: 3500 },
  { hospital: "Casablanca MC", weight: 0.11, samples: 2900 },
  { hospital: "Cairo UH", weight: 0.10, samples: 2800 },
  { hospital: "Tripoli GH", weight: 0.09, samples: 2400 },
  { hospital: "Others", weight: 0.12, samples: 4200 },
];

const accuracyData = [
  { hospital: "CHU Alger", accuracy: 96.8 },
  { hospital: "CHU Oran", accuracy: 95.4 },
  { hospital: "CHU Constantine", accuracy: 94.2 },
  { hospital: "Casablanca MC", accuracy: 93.6 },
  { hospital: "Tripoli GH", accuracy: 92.1 },
];

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#6366f1"];

export function ContributionAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Contribution Weights</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contributionData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="hospital" angle={-45} textAnchor="end" height={100} className="text-xs" />
            <YAxis domain={[0, 0.2]} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(31 41 55)",
                border: "1px solid rgb(75 85 99)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="weight" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Total Samples</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {contributionData.reduce((sum, d) => sum + d.samples, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Active Contributors</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{contributionData.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sample Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={contributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ hospital, percent }) => `${hospital}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="samples"
            >
              {contributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(31 41 55)",
                border: "1px solid rgb(75 85 99)",
                borderRadius: "0.5rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Local Model Accuracies</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={accuracyData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis type="number" domain={[0, 100]} className="text-xs" />
            <YAxis dataKey="hospital" type="category" width={150} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(31 41 55)",
                border: "1px solid rgb(75 85 99)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="accuracy" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
