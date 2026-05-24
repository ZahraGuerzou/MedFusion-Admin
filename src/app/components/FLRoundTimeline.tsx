import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface TimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending" | "failed";
  timestamp?: string;
  details?: string;
}

const steps: TimelineStep[] = [
  {
    id: "init",
    label: "Round Initialization",
    status: "completed",
    timestamp: "2026-05-19 10:00:00",
    details: "Model broadcasted to 18 hospitals",
  },
  {
    id: "training",
    label: "Local Training",
    status: "completed",
    timestamp: "2026-05-19 10:15:00",
    details: "All hospitals completed training",
  },
  {
    id: "upload",
    label: "Weight Upload",
    status: "current",
    timestamp: "2026-05-19 11:30:00",
    details: "15/18 hospitals uploaded (83%)",
  },
  {
    id: "aggregation",
    label: "Aggregation",
    status: "pending",
    details: "Waiting for all uploads",
  },
  {
    id: "validation",
    label: "Validation",
    status: "pending",
    details: "Pending aggregation",
  },
  {
    id: "deployment",
    label: "Deployment",
    status: "pending",
    details: "Pending validation",
  },
];

export function FLRoundTimeline() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">FL Round Timeline</h3>

      <div className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative pb-8 last:pb-0">
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                    step.status === "completed"
                      ? "bg-emerald-500"
                      : step.status === "current"
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}

              <div className="flex items-start gap-4">
                <div className="relative z-10">
                  {step.status === "completed" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {step.status === "current" && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <Clock className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {step.status === "pending" && (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Circle className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  {step.status === "failed" && (
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4
                      className={`font-medium ${
                        step.status === "completed"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : step.status === "current"
                          ? "text-blue-700 dark:text-blue-400"
                          : step.status === "failed"
                          ? "text-red-700 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.label}
                    </h4>
                    {step.timestamp && (
                      <span className="text-xs text-gray-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.details}</p>

                  {step.status === "current" && (
                    <div className="mt-3 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "83%" }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
