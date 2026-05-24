import { useState } from "react";
import {
  Play,
  Square,
  GitMerge,
  Rocket,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Brain,
  Activity,
  Filter,
  ArrowUpRight,
  Building2,
  Layers,
  TrendingUp,
  Users,
  Cpu,
  Zap,
  Pause,
  RefreshCw,
  CheckCheck,
  Loader2,
  Ban,
  CloudUpload,
  ShieldCheck,
  PackageCheck,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { FLRoundTimeline } from "../components/FLRoundTimeline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────────────────

type RoundStatus = "Idle" | "Running" | "Paused" | "Aggregating" | "Deploying" | "Deployed" | "Stopped" | "Pending";

interface ToastMessage {
  id: number;
  type: "success" | "info" | "warning" | "error";
  title: string;
  description: string;
  icon: React.ElementType;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const modalities = [
  { id: "brain-mri",   name: "Brain MRI",   model: "MRI-EFF-v1.4" },
  { id: "chest-xray",  name: "Chest X-Ray", model: "CXR-RES-v2.1" },
  { id: "retinal-oct", name: "Retinal OCT", model: "OCT-VIT-v3.0"  },
  { id: "skin-lesion", name: "Skin Lesion", model: "SKIN-CNN-v2.3" },
];

const initialRoundsData: Record<string, any> = {
  "brain-mri": {
    currentRound: 15, status: "Running" as RoundStatus, startedAt: "10:30 AM", participants: 18,
    hospitals: [
      { name: "CHU Alger",                 uploadStatus: "Uploaded",    accuracy: 96.8, samples: 4200 },
      { name: "CHU Oran",                  uploadStatus: "Uploaded",    accuracy: 95.4, samples: 3800 },
      { name: "CHU Constantine",           uploadStatus: "Uploaded",    accuracy: 94.2, samples: 3200 },
      { name: "Hôpital Central Tunis",     uploadStatus: "Pending",     accuracy: null, samples: 3500 },
      { name: "Casablanca Medical Center", uploadStatus: "Uploaded",    accuracy: 93.6, samples: 2900 },
      { name: "Cairo University Hospital", uploadStatus: "Failed",      accuracy: null, samples: 0    },
    ],
    convergence: [
      { round: 10, accuracy: 92.5 }, { round: 11, accuracy: 93.8 },
      { round: 12, accuracy: 94.6 }, { round: 13, accuracy: 95.4 },
      { round: 14, accuracy: 96.1 }, { round: 15, accuracy: 96.8 },
    ],
  },
  "chest-xray": {
    currentRound: 8, status: "Aggregating" as RoundStatus, startedAt: "09:15 AM", participants: 12,
    hospitals: [
      { name: "CHU Alger",                  uploadStatus: "Uploaded", accuracy: 94.2, samples: 3100 },
      { name: "CHU Oran",                   uploadStatus: "Uploaded", accuracy: 93.1, samples: 2800 },
      { name: "Cairo University Hospital",  uploadStatus: "Uploaded", accuracy: 92.5, samples: 2600 },
      { name: "Tripoli General Hospital",   uploadStatus: "Pending",  accuracy: null, samples: 2200 },
    ],
    convergence: [
      { round: 3, accuracy: 87.2 }, { round: 4, accuracy: 89.5 },
      { round: 5, accuracy: 91.0 }, { round: 6, accuracy: 92.3 },
      { round: 7, accuracy: 93.5 }, { round: 8, accuracy: 94.2 },
    ],
  },
  "retinal-oct": {
    currentRound: 12, status: "Running" as RoundStatus, startedAt: "11:00 AM", participants: 14,
    hospitals: [
      { name: "CHU Alger",          uploadStatus: "Uploaded", accuracy: 95.5, samples: 2900 },
      { name: "Hospital Mustapha",  uploadStatus: "Uploaded", accuracy: 94.8, samples: 2500 },
      { name: "Casablanca Medical", uploadStatus: "Pending",  accuracy: null, samples: 2100 },
    ],
    convergence: [
      { round: 7,  accuracy: 89.5 }, { round: 8,  accuracy: 91.2 },
      { round: 9,  accuracy: 92.8 }, { round: 10, accuracy: 93.9 },
      { round: 11, accuracy: 94.7 }, { round: 12, accuracy: 95.5 },
    ],
  },
  "skin-lesion": {
    currentRound: 22, status: "Pending" as RoundStatus, startedAt: "Not started", participants: 8,
    hospitals: [
      { name: "CHU Alger",       uploadStatus: "Not Started", accuracy: null, samples: 0 },
      { name: "CHU Constantine", uploadStatus: "Not Started", accuracy: null, samples: 0 },
    ],
    convergence: [
      { round: 17, accuracy: 88.2 }, { round: 18, accuracy: 89.5 },
      { round: 19, accuracy: 90.8 }, { round: 20, accuracy: 91.9 },
      { round: 21, accuracy: 92.7 }, { round: 22, accuracy: 93.1 },
    ],
  },
};

// ── Configs ───────────────────────────────────────────────────────────────────

const uploadStatusConfig = {
  Uploaded:     { color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500",  icon: CheckCircle2 },
  Pending:      { color: "bg-orange-50  dark:bg-orange-900/20  text-orange-700  dark:text-orange-400  border-orange-200  dark:border-orange-800",  dot: "bg-orange-500",   icon: AlertCircle  },
  Failed:       { color: "bg-red-50     dark:bg-red-900/20     text-red-700     dark:text-red-400     border-red-200     dark:border-red-800",      dot: "bg-red-500",      icon: XCircle      },
  "Not Started":{ color: "bg-gray-50    dark:bg-gray-800/50    text-gray-600    dark:text-gray-400    border-gray-200    dark:border-gray-700",     dot: "bg-gray-400",     icon: Clock        },
};

const statusBadgeConfig: Record<string, string> = {
  Running:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Aggregating: "bg-blue-50    dark:bg-blue-900/20    text-blue-700    dark:text-blue-400    border-blue-200    dark:border-blue-800",
  Pending:     "bg-amber-50   dark:bg-amber-900/20   text-amber-700   dark:text-amber-400   border-amber-200   dark:border-amber-800",
  Paused:      "bg-yellow-50  dark:bg-yellow-900/20  text-yellow-700  dark:text-yellow-400  border-yellow-200  dark:border-yellow-800",
  Deploying:   "bg-violet-50  dark:bg-violet-900/20  text-violet-700  dark:text-violet-400  border-violet-200  dark:border-violet-800",
  Deployed:    "bg-teal-50    dark:bg-teal-900/20    text-teal-700    dark:text-teal-400    border-teal-200    dark:border-teal-800",
  Stopped:     "bg-red-50     dark:bg-red-900/20     text-red-700     dark:text-red-400     border-red-200     dark:border-red-800",
  Idle:        "bg-gray-50    dark:bg-gray-800/50    text-gray-600    dark:text-gray-400    border-gray-200    dark:border-gray-700",
};

const modalityGradients: Record<string, { gradient: string; bg: string; text: string; val: string; shadow: string }> = {
  "brain-mri":   { gradient: "from-purple-500 to-violet-600",  bg: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20",   text: "text-purple-700 dark:text-purple-400",   val: "text-purple-900 dark:text-purple-200",   shadow: "shadow-purple-500/20"  },
  "chest-xray":  { gradient: "from-blue-500   to-indigo-600",  bg: "from-blue-50   to-indigo-50  dark:from-blue-950/20   dark:to-indigo-900/20",   text: "text-blue-700   dark:text-blue-400",     val: "text-blue-900   dark:text-blue-200",     shadow: "shadow-blue-500/20"    },
  "retinal-oct": { gradient: "from-emerald-500 to-teal-600",   bg: "from-emerald-50 to-teal-50  dark:from-emerald-950/20 dark:to-teal-900/20",     text: "text-emerald-700 dark:text-emerald-400", val: "text-emerald-900 dark:text-emerald-200", shadow: "shadow-emerald-500/20" },
  "skin-lesion": { gradient: "from-amber-500  to-orange-500",  bg: "from-amber-50   to-orange-50 dark:from-amber-950/20  dark:to-orange-900/20",   text: "text-amber-700  dark:text-amber-400",    val: "text-amber-900  dark:text-amber-200",   shadow: "shadow-amber-500/20"   },
};

const toastColors = {
  success: "border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30",
  info:    "border-l-4 border-blue-500    bg-blue-50    dark:bg-blue-900/30",
  warning: "border-l-4 border-amber-500   bg-amber-50   dark:bg-amber-900/30",
  error:   "border-l-4 border-red-500     bg-red-50     dark:bg-red-900/30",
};

const toastTextColors = {
  success: "text-emerald-800 dark:text-emerald-200",
  info:    "text-blue-800    dark:text-blue-200",
  warning: "text-amber-800   dark:text-amber-200",
  error:   "text-red-800     dark:text-red-200",
};

const toastIconColors = {
  success: "text-emerald-500",
  info:    "text-blue-500",
  warning: "text-amber-500",
  error:   "text-red-500",
};

// ── Toast Component ───────────────────────────────────────────────────────────

function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0,  scale: 1     }}
            exit={{   opacity: 0, x: 60,  scale: 0.92  }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[280px] max-w-xs ${toastColors[t.type]}`}
          >
            <t.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${toastIconColors[t.type]}`} />
            <div>
              <p className={`text-xs font-bold ${toastTextColors[t.type]}`}>{t.title}</p>
              <p className={`text-xs mt-0.5 opacity-80 ${toastTextColors[t.type]}`}>{t.description}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  icon: React.ElementType;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ open, title, description, confirmLabel, confirmClass, icon: Icon, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.92, opacity: 0, y: 12  }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-sm w-full p-6"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-9 text-sm">
                Cancel
              </Button>
              <Button onClick={onConfirm} className={`flex-1 rounded-xl h-9 text-sm font-semibold ${confirmClass}`}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Progress Overlay ──────────────────────────────────────────────────────────

function ProgressOverlay({ active, label, sub }: { active: boolean; label: string; sub: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{   scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 px-10 py-8 flex flex-col items-center gap-4 min-w-[280px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-purple-500" />
            </motion.div>
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white text-base">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
            </div>
            {/* Animated progress bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function FLRounds() {
  const [selectedModality, setSelectedModality] = useState("brain-mri");
  const [roundsData, setRoundsData] = useState(initialRoundsData);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; action: string; title: string; description: string;
    confirmLabel: string; confirmClass: string; icon: React.ElementType;
  }>({ open: false, action: "", title: "", description: "", confirmLabel: "", confirmClass: "", icon: Ban });

  const roundData = roundsData[selectedModality];
  const selectedModalityInfo = modalities.find((m) => m.id === selectedModality)!;
  const mg = modalityGradients[selectedModality];
  const currentStatus: RoundStatus = roundData.status;

  // ── Toast helper ──
  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ── Status updater ──
  const updateStatus = (status: RoundStatus, extra?: Partial<typeof roundData>) => {
    setRoundsData((prev) => ({
      ...prev,
      [selectedModality]: { ...prev[selectedModality], status, ...extra },
    }));
  };

  // ── Action handlers ──
  const handleStartRound = () => {
    if (currentStatus === "Running") {
      addToast({ type: "warning", title: "Already Running", description: `${selectedModalityInfo.name} round is already in progress.`, icon: AlertCircle });
      return;
    }
    const nextRound = roundData.currentRound + (currentStatus === "Idle" || currentStatus === "Deployed" || currentStatus === "Stopped" ? 1 : 0);
    setLoadingAction("starting");
    setTimeout(() => {
      setLoadingAction(null);
      updateStatus("Running", {
        startedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        currentRound: nextRound,
        hospitals: roundData.hospitals.map((h: any) => ({
          ...h,
          uploadStatus: h.uploadStatus === "Failed" ? "Pending" : h.uploadStatus === "Not Started" ? "Pending" : h.uploadStatus,
        })),
      });
      addToast({ type: "success", title: "Round Started", description: `Round #${nextRound} for ${selectedModalityInfo.name} is now running.`, icon: Play });
    }, 2400);
  };

  const handlePauseResume = () => {
    if (currentStatus === "Paused") {
      // Resume
      setLoadingAction("resuming");
      setTimeout(() => {
        setLoadingAction(null);
        updateStatus("Running");
        addToast({ type: "info", title: "Round Resumed", description: `${selectedModalityInfo.name} training has resumed.`, icon: Play });
      }, 1200);
    } else if (currentStatus === "Running") {
      // Pause
      updateStatus("Paused");
      addToast({ type: "warning", title: "Round Paused", description: `${selectedModalityInfo.name} training paused. Hospitals can still upload.`, icon: Pause });
    }
  };

  const confirmStop = () => {
    setConfirmModal({
      open: true, action: "stop",
      title: "Stop Round?",
      description: `This will terminate the current round for ${selectedModalityInfo.name}. Local updates already uploaded will be preserved.`,
      confirmLabel: "Yes, Stop",
      confirmClass: "bg-red-500 hover:bg-red-600 text-white border-0",
      icon: Ban,
    });
  };

  const handleStopConfirmed = () => {
    setConfirmModal((p) => ({ ...p, open: false }));
    setLoadingAction("stopping");
    setTimeout(() => {
      setLoadingAction(null);
      updateStatus("Stopped");
      addToast({ type: "error", title: "Round Stopped", description: `Round #${roundData.currentRound} for ${selectedModalityInfo.name} was terminated.`, icon: Ban });
    }, 1600);
  };

  const handleAggregate = () => {
    if (currentStatus !== "Running" && currentStatus !== "Paused") {
      addToast({ type: "warning", title: "Cannot Aggregate", description: "Start a round first before aggregating.", icon: AlertCircle });
      return;
    }
    const uploaded = roundData.hospitals.filter((h: any) => h.uploadStatus === "Uploaded");
    if (uploaded.length === 0) {
      addToast({ type: "warning", title: "No Uploads", description: "No hospital has uploaded updates yet.", icon: AlertCircle });
      return;
    }
    setLoadingAction("aggregating");
    updateStatus("Aggregating");
    setTimeout(() => {
      // Simulate new accuracy point
      const last = roundData.convergence[roundData.convergence.length - 1];
      const newAcc = Math.min(+(last.accuracy + (Math.random() * 0.8 + 0.3)).toFixed(1), 99.9);
      const newConvergence = [...roundData.convergence, { round: roundData.currentRound + 1, accuracy: newAcc }].slice(-8);
      setLoadingAction(null);
      updateStatus("Running", { convergence: newConvergence });
      addToast({ type: "success", title: "Aggregation Complete", description: `${uploaded.length} hospital updates merged. New global accuracy: ${newAcc}%.`, icon: CheckCheck });
    }, 2800);
  };

  const confirmDeploy = () => {
    if (currentStatus === "Deploying" || currentStatus === "Deployed") {
      addToast({ type: "warning", title: "Already Deployed", description: "Global model is already deployed.", icon: AlertCircle });
      return;
    }
    setConfirmModal({
      open: true, action: "deploy",
      title: "Deploy Global Model?",
      description: `This will push the aggregated ${selectedModalityInfo.model} model to all ${roundData.participants} participating hospitals.`,
      confirmLabel: "Deploy Now",
      confirmClass: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0",
      icon: Rocket,
    });
  };

  const handleDeployConfirmed = () => {
    setConfirmModal((p) => ({ ...p, open: false }));
    setLoadingAction("deploying");
    updateStatus("Deploying");
    // Step 1: packaging
    setTimeout(() => {
      addToast({ type: "info", title: "Packaging Model", description: "Bundling weights, configs and inference scripts…", icon: PackageCheck });
    }, 600);
    // Step 2: sending
    setTimeout(() => {
      addToast({ type: "info", title: "Transmitting", description: `Sending ${selectedModalityInfo.model} to ${roundData.participants} hospitals…`, icon: Send });
    }, 1800);
    // Step 3: done
    setTimeout(() => {
      setLoadingAction(null);
      updateStatus("Deployed", {
        hospitals: roundData.hospitals.map((h: any) => ({
          ...h,
          uploadStatus: h.uploadStatus === "Uploaded" ? "Uploaded" : h.uploadStatus,
        })),
      });
      addToast({ type: "success", title: "Model Deployed!", description: `${selectedModalityInfo.model} successfully deployed to all hospitals.`, icon: ShieldCheck });
    }, 3200);
  };

  const onConfirmAction = () => {
    if (confirmModal.action === "stop")   handleStopConfirmed();
    if (confirmModal.action === "deploy") handleDeployConfirmed();
  };

  // ── Derived stats ──
  const uploadedCount  = roundData.hospitals.filter((h: any) => h.uploadStatus === "Uploaded").length;
  const latestAccuracy = roundData.convergence[roundData.convergence.length - 1]?.accuracy ?? 0;

  const statCards = [
    { label: "Current Round",  value: `#${roundData.currentRound}`,               icon: Layers,      gradient: "from-purple-500 to-violet-600",  bg: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20",   text: "text-purple-700 dark:text-purple-400",   val: "text-purple-900 dark:text-purple-200",   shadow: "shadow-purple-500/20"  },
    { label: "Participants",   value: String(roundData.participants),              icon: Users,       gradient: "from-blue-500   to-indigo-600",  bg: "from-blue-50   to-indigo-50  dark:from-blue-950/20   dark:to-indigo-900/20",   text: "text-blue-700   dark:text-blue-400",     val: "text-blue-900   dark:text-blue-200",     shadow: "shadow-blue-500/20"    },
    { label: "Uploads Ready",  value: `${uploadedCount}/${roundData.hospitals.length}`, icon: CloudUpload, gradient: "from-emerald-500 to-teal-600",   bg: "from-emerald-50 to-teal-50  dark:from-emerald-950/20 dark:to-teal-900/20",   text: "text-emerald-700 dark:text-emerald-400", val: "text-emerald-900 dark:text-emerald-200", shadow: "shadow-emerald-500/20" },
    { label: "Best Accuracy",  value: `${latestAccuracy}%`,                       icon: TrendingUp,  gradient: "from-amber-500  to-orange-500",  bg: "from-amber-50   to-orange-50 dark:from-amber-950/20  dark:to-orange-900/20",  text: "text-amber-700  dark:text-amber-400",    val: "text-amber-900  dark:text-amber-200",   shadow: "shadow-amber-500/20"   },
  ];

  // ── Button state logic ──
  const isRunning    = currentStatus === "Running";
  const isPaused     = currentStatus === "Paused";
  const isStopped    = currentStatus === "Stopped" || currentStatus === "Idle" || currentStatus === "Pending" || currentStatus === "Deployed";
  const isAggregating= currentStatus === "Aggregating";
  const isDeploying  = currentStatus === "Deploying";
  const isDeployed   = currentStatus === "Deployed";
  const isBusy       = !!loadingAction;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Toast Stack ── */}
      <ToastStack toasts={toasts} />

      {/* ── Progress Overlay ── */}
      <ProgressOverlay
        active={!!loadingAction}
        label={
          loadingAction === "starting"    ? "Starting Round…"      :
          loadingAction === "stopping"    ? "Stopping Round…"      :
          loadingAction === "aggregating" ? "Aggregating Updates…" :
          loadingAction === "deploying"   ? "Deploying Model…"     :
          loadingAction === "resuming"    ? "Resuming Training…"   : "Processing…"
        }
        sub={
          loadingAction === "starting"    ? `Initialising round #${roundData.currentRound} for ${selectedModalityInfo.name}` :
          loadingAction === "stopping"    ? "Preserving uploaded updates from hospitals"  :
          loadingAction === "aggregating" ? `Merging ${uploadedCount} hospital gradients via FedGRA` :
          loadingAction === "deploying"   ? `Pushing ${selectedModalityInfo.model} to ${roundData.participants} hospitals`     :
          loadingAction === "resuming"    ? "Restoring training state" : ""
        }
      />

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        confirmClass={confirmModal.confirmClass}
        icon={confirmModal.icon}
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmModal((p) => ({ ...p, open: false }))}
      />

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Federated Learning Rounds
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Manage communication rounds and training cycles by modality
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={selectedModality} onValueChange={setSelectedModality}>
            <SelectTrigger className="w-52 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-9 text-sm shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modalities.map((modality) => (
                <SelectItem key={modality.id} value={modality.id}>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    {modality.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ── Modality Banner ── */}
      <motion.div
        key={selectedModality}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className={`border border-gray-100 dark:border-gray-800 bg-gradient-to-r ${mg.bg} overflow-hidden`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={isRunning ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={`w-12 h-12 bg-gradient-to-br ${mg.gradient} rounded-2xl flex items-center justify-center shadow-lg ${mg.shadow}`}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className={`text-lg font-bold ${mg.val}`}>{selectedModalityInfo.name}</h3>
                  <p className={`text-sm ${mg.text} font-mono`}>{selectedModalityInfo.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`text-xs ${mg.text} font-medium mb-0.5`}>Status</p>
                  <motion.div key={currentStatus} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Badge variant="outline" className={`text-xs font-semibold border ${statusBadgeConfig[currentStatus] ?? statusBadgeConfig["Pending"]}`}>
                      {(isAggregating || isDeploying) ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block mr-1">
                          <RefreshCw className="w-3 h-3" />
                        </motion.span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />
                      )}
                      {currentStatus}
                    </Badge>
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${mg.text} font-medium`}>Started</p>
                  <p className={`text-sm font-semibold ${mg.val}`}>{roundData.startedAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={`${selectedModality}-${stat.label}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className={`border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${stat.bg} hover:shadow-lg transition-shadow duration-200`}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md ${stat.shadow}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className={`w-4 h-4 ${stat.text} opacity-50`} />
                </div>
                <motion.p
                  key={stat.value}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1,    opacity: 1 }}
                  className={`text-2xl font-bold ${stat.val} leading-none mb-1`}
                >
                  {stat.value}
                </motion.p>
                <p className={`text-xs font-medium ${stat.text}`}>{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Round Control ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border border-gray-100 dark:border-gray-800 bg-gradient-to-r from-slate-50 via-purple-50/40 to-violet-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-violet-950/20 overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                  Round Control — {selectedModalityInfo.name}
                </CardTitle>
              </div>
              {/* Live pulse when running */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1  }}
                    exit={{   opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                      className="w-2 h-2 rounded-full bg-emerald-500 inline-block"
                    />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live Training</span>
                  </motion.div>
                )}
                {isPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{   opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Paused</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="flex flex-wrap gap-3">

              {/* Start / Restart */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  disabled={isBusy || isRunning || isAggregating || isDeploying}
                  onClick={handleStartRound}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-500/20 border-0 h-9 px-4 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  {isStopped && !isRunning ? "Start Round" : "Start Round"}
                </Button>
              </motion.div>

              {/* Pause / Resume */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  disabled={isBusy || (!isRunning && !isPaused)}
                  onClick={handlePauseResume}
                  className="rounded-xl border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 h-9 px-4 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 mr-1.5" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
              </motion.div>

              {/* Stop */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  disabled={isBusy || isStopped}
                  onClick={confirmStop}
                  className="rounded-xl border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 h-9 px-4 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Square className="w-3.5 h-3.5 mr-1.5" />
                  Stop
                </Button>
              </motion.div>

              {/* Aggregate */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  disabled={isBusy || (!isRunning && !isPaused)}
                  onClick={handleAggregate}
                  className="rounded-xl border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 h-9 px-4 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <GitMerge className="w-3.5 h-3.5 mr-1.5" />
                  Aggregate
                </Button>
              </motion.div>

              {/* Deploy */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  disabled={isBusy || isDeployed || isDeploying}
                  onClick={confirmDeploy}
                  className="rounded-xl border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 h-9 px-4 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeployed
                    ? <><CheckCheck className="w-3.5 h-3.5 mr-1.5 text-teal-500" />Deployed</>
                    : <><Rocket className="w-3.5 h-3.5 mr-1.5" />Deploy Global Model</>
                  }
                </Button>
              </motion.div>

            </div>

            {/* Helper hint */}
            <AnimatePresence>
              {isPaused && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{   opacity: 0, height: 0 }}
                  className="text-xs text-yellow-600 dark:text-yellow-400 mt-3"
                >
                  ⏸ Training is paused. Hospitals can still upload updates. Press <strong>Resume</strong> to continue or <strong>Aggregate</strong> to merge current uploads.
                </motion.p>
              )}
              {isDeployed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{   opacity: 0, height: 0 }}
                  className="text-xs text-teal-600 dark:text-teal-400 mt-3"
                >
                  ✅ Global model deployed to all hospitals. Start a new round to continue improving.
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Participating Hospitals Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Participating Hospitals — {selectedModalityInfo.name}
                </CardTitle>
              </div>
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-xs">
                {roundData.hospitals.length} hospitals
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
                  {["Hospital", "Upload Status", "Local Accuracy", "Training Samples"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide py-3 px-4 first:pl-6 last:pr-6">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roundData.hospitals.map((hospital: any, idx: number) => {
                  const sc = uploadStatusConfig[hospital.uploadStatus as keyof typeof uploadStatusConfig];
                  const StatusIcon = sc.icon;
                  return (
                    <motion.tr
                      key={`${selectedModality}-${idx}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-purple-50/20 dark:hover:bg-purple-900/10 transition-colors"
                    >
                      <TableCell className="pl-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{hospital.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <motion.span
                          key={hospital.uploadStatus}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1,    opacity: 1 }}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${sc.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} flex-shrink-0`} />
                          <StatusIcon className="w-3 h-3" />
                          {hospital.uploadStatus}
                        </motion.span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {hospital.accuracy != null ? (
                          <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                            {hospital.accuracy}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {hospital.samples > 0 ? (
                          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                            {hospital.samples.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Timeline + Convergence Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <FLRoundTimeline />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl h-full">
            <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Convergence Progress — {selectedModalityInfo.name}
                  </CardTitle>
                </div>
                <motion.div key={roundData.currentRound} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 text-xs">
                    Round {roundData.currentRound}
                  </Badge>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-5 pt-4">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={roundData.convergence} margin={{ top: 4, right: 8, left: -10, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-gray-500 dark:text-gray-400"
                    label={{ value: "Round", position: "insideBottom", offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    domain={[85, 100]}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-gray-500 dark:text-gray-400"
                    label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft", offset: 16, fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(17 24 39)",
                      border: "1px solid rgb(55 65 81)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "rgb(156 163 175)" }}
                    itemStyle={{ color: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}  