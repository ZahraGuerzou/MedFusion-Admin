import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const comparisonData = [
  { metric: "Accuracy", modelA: 94.2, modelB: 96.8 },
  { metric: "Precision", modelA: 92.5, modelB: 95.1 },
  { metric: "Recall", modelA: 91.8, modelB: 94.3 },
  { metric: "F1 Score", modelA: 92.1, modelB: 94.7 },
];

interface Model {
  id: string;
  name: string;
  version: string;
  architecture: string;
  accuracy: number;
  parameters: string;
  trainingTime: string;
  hospitals: number;
}

const modelA: Model = {
  id: "1",
  name: "Brain MRI",
  version: "v1.3",
  architecture: "ResNet18",
  accuracy: 94.2,
  parameters: "11.7M",
  trainingTime: "4.5 hrs",
  hospitals: 15,
};

const modelB: Model = {
  id: "2",
  name: "Brain MRI",
  version: "v1.4",
  architecture: "EfficientNetV2",
  accuracy: 96.8,
  parameters: "21.5M",
  trainingTime: "6.2 hrs",
  hospitals: 18,
};

export function ModelComparison() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Model Comparison</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Model A</p>
          <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">{modelA.version}</p>
          <p className="text-xs text-blue-700 dark:text-blue-400">{modelA.architecture}</p>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-gray-400" />
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-2">Model B</p>
          <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">{modelB.version}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">{modelB.architecture}</p>
        </div>
      </div>

      <div className="mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="metric" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(31 41 55)",
                border: "1px solid rgb(75 85 99)",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="modelA" fill="#3b82f6" name="Model A (v1.3)" />
            <Bar dataKey="modelB" fill="#10b981" name="Model B (v1.4)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
            <span className="font-semibold text-gray-900 dark:text-white">{modelA.accuracy}%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Parameters</span>
            <span className="font-semibold text-gray-900 dark:text-white">{modelA.parameters}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Training Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">{modelA.trainingTime}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Hospitals</span>
            <span className="font-semibold text-gray-900 dark:text-white">{modelA.hospitals}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <span className="text-sm text-emerald-600 dark:text-emerald-400">Accuracy</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">{modelB.accuracy}%</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Parameters</span>
            <span className="font-semibold text-gray-900 dark:text-white">{modelB.parameters}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Training Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">{modelB.trainingTime}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <span className="text-sm text-emerald-600 dark:text-emerald-400">Hospitals</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-900 dark:text-emerald-300">{modelB.hospitals}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-300 mb-1">
              Model B ({modelB.version}) Recommended
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Higher accuracy (+2.6%) with broader hospital participation. Suitable for production deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
