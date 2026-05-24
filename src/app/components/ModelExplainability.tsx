import { useState } from "react";
import { Eye, Brain, Layers, Zap } from "lucide-react";
import { motion } from "motion/react";

interface ExplainabilityView {
  id: string;
  name: string;
  icon: typeof Eye;
  color: string;
}

const views: ExplainabilityView[] = [
  { id: "gradcam", name: "Grad-CAM", icon: Eye, color: "emerald" },
  { id: "attention", name: "Attention Map", icon: Brain, color: "blue" },
  { id: "saliency", name: "Saliency Map", icon: Layers, color: "purple" },
  { id: "integrated", name: "Integrated Gradients", icon: Zap, color: "orange" },
];

export function ModelExplainability() {
  const [selectedView, setSelectedView] = useState("gradcam");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Model Explainability</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Visualize what the model is focusing on for diagnosis
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {views.map((view) => {
          const Icon = view.icon;
          const isSelected = selectedView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isSelected
                  ? `bg-${view.color}-500 text-white shadow-lg`
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{view.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Original Image</p>
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Brain MRI Scan</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {views.find((v) => v.id === selectedView)?.name}
          </p>
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden"
          >
            <div className="absolute inset-0">
              <svg className="w-full h-full">
                <defs>
                  <radialGradient id="heatmap" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.7" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                  </radialGradient>
                </defs>
                <motion.circle
                  cx="50%"
                  cy="45%"
                  r="30%"
                  fill="url(#heatmap)"
                  initial={{ r: "0%" }}
                  animate={{ r: "30%" }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-lg mx-auto mb-2" />
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">High Attention Region</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Prediction</p>
            <p className="font-semibold text-blue-900 dark:text-blue-300">Tumor Detected</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Confidence</p>
            <p className="font-semibold text-blue-900 dark:text-blue-300">96.8%</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Focus Area</p>
            <p className="font-semibold text-blue-900 dark:text-blue-300">Frontal Lobe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
