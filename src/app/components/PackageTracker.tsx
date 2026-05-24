import { useState } from "react";
import { Package, CheckCircle2, Clock, Send, Download, FileCode, Database, Brain } from "lucide-react";
import { motion } from "motion/react";

interface PackageStep {
  id: string;
  label: string;
  description: string;
  status: "completed" | "current" | "pending";
  timestamp?: string;
}

const steps: PackageStep[] = [
  {
    id: "requested",
    label: "Request Received",
    description: "User submitted model request",
    status: "completed",
    timestamp: "2026-05-19 10:30:00",
  },
  {
    id: "approved",
    label: "Admin Approved",
    description: "Request verified and approved",
    status: "completed",
    timestamp: "2026-05-19 10:35:00",
  },
  {
    id: "packaging",
    label: "Creating Package",
    description: "Bundling model files and dependencies",
    status: "current",
    timestamp: "2026-05-19 10:40:00",
  },
  {
    id: "sending",
    label: "Sending Package",
    description: "Transmitting to hospital network",
    status: "pending",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Available for download",
    status: "pending",
  },
];

const packageContents = [
  { icon: Brain, name: "model_weights.pth", size: "245 MB", type: "Model Weights" },
  { icon: FileCode, name: "training_notebook.ipynb", size: "1.2 MB", type: "Training Script" },
  { icon: Database, name: "config.json", size: "4 KB", type: "Configuration" },
  { icon: FileCode, name: "inference.py", size: "18 KB", type: "Inference Script" },
  { icon: Database, name: "requirements.txt", size: "2 KB", type: "Dependencies" },
];

export function PackageTracker() {
  const currentStepIndex = steps.findIndex((s) => s.status === "current");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Package Delivery Tracker</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Model: MRI-EFF-v1.4 → Dr. Ahmed (CHU Alger)</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 -z-10" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step.status === "completed"
                      ? "bg-emerald-500"
                      : step.status === "current"
                      ? "bg-blue-500 ring-4 ring-blue-200 dark:ring-blue-900 animate-pulse"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : step.status === "current" ? (
                    <Clock className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Details */}
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border ${
              step.status === "current"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                : step.status === "completed"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-semibold ${
                      step.status === "current"
                        ? "text-blue-900 dark:text-blue-300"
                        : step.status === "completed"
                        ? "text-emerald-900 dark:text-emerald-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.status === "current" && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      In Progress
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
              {step.timestamp && (
                <span className="text-xs text-gray-500 ml-4">{new Date(step.timestamp).toLocaleTimeString()}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Package Contents */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Package Contents</h4>
        <div className="space-y-2">
          {packageContents.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
                <span className="text-xs text-gray-500">{item.size}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">Total Package Size</p>
              <p className="text-xs text-purple-700 dark:text-purple-400">Compressed for transfer</p>
            </div>
            <span className="text-lg font-bold text-purple-900 dark:text-purple-300">246.2 MB</span>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="mt-4 flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
            Estimated delivery time: 2-3 minutes
          </span>
        </div>
      </div>
    </div>
  );
}
