import { useState } from "react";
import {
  Building2, Brain, RefreshCw, CreditCard, TrendingUp, Activity,
  Check, ChevronDown, Network, Microscope, ScanLine, Eye,
  Clock, BarChart3, Layers, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { HospitalMap } from "../components/HospitalMap";
import { FLRoundTimeline } from "../components/FLRoundTimeline";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

/* ── Data ───────────────────────────────────────────── */
const federatedModels = [
  { id: "MRI-EFF-v1.4",  modality: "Brain MRI",   round: 15, status: "Completed", accuracy: 96.8 },
  { id: "CXR-RES-v2.1",  modality: "Chest X-Ray", round: 8,  status: "Training",  accuracy: 94.2 },
  { id: "OCT-VIT-v3.0",  modality: "Retinal OCT", round: 12, status: "Completed", accuracy: 95.5 },
  { id: "SKIN-CNN-v2.3", modality: "Skin Lesion",  round: 22, status: "Pending",   accuracy: 93.1 },
];

const recentActivities = [
  { text: "CHU Alger uploaded local update for Brain MRI",    time: "2 min ago",   type: "upload" },
  { text: "Round 15 aggregation completed — 96.8% accuracy", time: "15 min ago",  type: "success" },
  { text: "New hospital CHU Oran registered",                  time: "1 hour ago",  type: "info" },
  { text: "Chest X-Ray model deployed to 5 hospitals",        time: "2 hours ago", type: "deploy" },
  { text: "Premium subscription renewed — CHU Constantine",   time: "3 hours ago", type: "subscription" },
  { text: "Retinal OCT Round 12 started with 14 hospitals",   time: "4 hours ago", type: "round" },
];

const allPerformanceData: Record<string, { round: number; accuracy: number }[]> = {
  "Brain MRI":   [{ round:1,accuracy:78.5},{round:3,accuracy:84.2},{round:5,accuracy:88.6},{round:7,accuracy:91.4},{round:9,accuracy:93.8},{round:11,accuracy:95.2},{round:13,accuracy:96.1},{round:15,accuracy:96.8}],
  "Chest X-Ray": [{ round:1,accuracy:72.0},{round:2,accuracy:79.3},{round:4,accuracy:85.1},{round:6,accuracy:89.4},{round:8,accuracy:94.2}],
  "Retinal OCT": [{ round:1,accuracy:75.0},{round:3,accuracy:82.5},{round:6,accuracy:89.0},{round:9,accuracy:93.1},{round:12,accuracy:95.5}],
  "Skin Lesion": [{ round:1,accuracy:70.2},{round:5,accuracy:78.4},{round:10,accuracy:85.7},{round:15,accuracy:90.3},{round:20,accuracy:92.5},{round:22,accuracy:93.1}],
};

const modalityDistribution = [
  { name: "Brain MRI",   count: 1 },
  { name: "Chest X-Ray", count: 1 },
  { name: "Retinal OCT", count: 1 },
  { name: "Skin Lesion", count: 1 },
];

const modelOptions = [
  { label: "Brain MRI",   Icon: Brain,      color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
  { label: "Chest X-Ray", Icon: ScanLine,   color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20",    text: "text-blue-600 dark:text-blue-400" },
  { label: "Retinal OCT", Icon: Eye,        color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
  { label: "Skin Lesion", Icon: Microscope, color: "#f97316", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500 dark:text-orange-400" },
];

/* ── Status config ───────────────────────────────────── */
const STATUS = {
  Completed: {
    badge:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    iconBg:   "bg-emerald-50 dark:bg-emerald-900/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    bar:      "bg-emerald-500",
    pct:      "100%",
  },
  Training: {
    badge:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    iconBg:   "bg-blue-50 dark:bg-blue-900/20",
    iconText: "text-blue-600 dark:text-blue-400",
    bar:      "bg-blue-500",
    pct:      "65%",
  },
  Pending: {
    badge:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    iconBg:   "bg-amber-50 dark:bg-amber-900/20",
    iconText: "text-amber-600 dark:text-amber-400",
    bar:      "bg-amber-400",
    pct:      "25%",
  },
  Failed: {
    badge:    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    iconBg:   "bg-red-50 dark:bg-red-900/20",
    iconText: "text-red-600 dark:text-red-400",
    bar:      "bg-red-500",
    pct:      "0%",
  },
} as const;
type StatusKey = keyof typeof STATUS;

const activityDot: Record<string, string> = {
  upload:       "bg-violet-400",
  success:      "bg-emerald-400",
  info:         "bg-blue-400",
  deploy:       "bg-indigo-400",
  subscription: "bg-amber-400",
  round:        "bg-sky-400",
};

/* ── Gradient Stat Card ─────────────────────────────── */
function GradientStatCard({
  title, value, subtitle, icon: Icon, gradientClass, shadowClass,
}: {
  title: string; value: string; subtitle: string;
  icon: React.ElementType; gradientClass: string; shadowClass: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg ${shadowClass} p-5 text-white relative overflow-hidden`}>
      <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold leading-none mb-1">{value}</p>
      <p className="text-xs text-white/70">{subtitle}</p>
    </div>
  );
}

/* ── Custom Chart Tooltip ────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">Round {label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value}%</p>
    </div>
  );
};

/* ── Component ──────────────────────────────────────── */
export function Dashboard() {
  const [selectedModel, setSelectedModel] = useState("Brain MRI");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedMeta = modelOptions.find((m) => m.label === selectedModel)!;
  const performanceData = allPerformanceData[selectedModel] ?? [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">
            Welcome back, Admin
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here's an overview of your federated AI ecosystem and model performance
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-md shadow-violet-200 dark:shadow-violet-900/40 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
        >
          <Shield className="w-4 h-4" />
          Admin Console
        </button>
      </motion.div>

      {/* ── Gradient Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Hospitals",     value: "18", subtitle: "↑ 2 new this month", Icon: Building2,  i: 0, g: "from-blue-500 to-blue-600",     s: "shadow-blue-200 dark:shadow-blue-900/40" },
          { title: "Active FL Models",    value: "2",  subtitle: "Running now",         Icon: Brain,      i: 1, g: "from-emerald-500 to-teal-600",  s: "shadow-emerald-200 dark:shadow-emerald-900/40" },
          { title: "Total Models",        value: "4",  subtitle: "↑ 1 new this week",  Icon: RefreshCw,  i: 2, g: "from-violet-500 to-purple-600",  s: "shadow-violet-200 dark:shadow-violet-900/40" },
          { title: "Premium Subscribers", value: "9",  subtitle: "↑ 1 new this month", Icon: CreditCard, i: 3, g: "from-orange-400 to-orange-500",  s: "shadow-orange-200 dark:shadow-orange-900/40" },
        ].map(({ title, value, subtitle, Icon, i, g, s }) => (
          <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GradientStatCard title={title} value={value} subtitle={subtitle} icon={Icon} gradientClass={g} shadowClass={s} />
          </motion.div>
        ))}
      </div>

      {/* ── Models + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Federated Models */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-2xl shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <Network className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Federated Models
                </CardTitle>
              </div>
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 text-xs">
                {federatedModels.length} models
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {federatedModels.map((model, i) => {
              const s = STATUS[model.status as StatusKey];
              const MIcon = modelOptions.find(m => m.label === model.modality)?.Icon ?? Brain;
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-sm transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                    <MIcon className={`w-5 h-5 ${s.iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{model.id}</p>
                      <Badge variant="outline" className={`text-xs border ${s.badge}`}>{model.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{model.modality}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Round {model.round}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${s.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: s.pct }}
                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 + i * 0.07 }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${s.iconText}`}>{s.pct}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${s.iconText}`}>{model.accuracy}%</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">accuracy</p>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-2xl shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">Live Feed</CardTitle>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
              {recentActivities.map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activityDot[activity.type] ?? "bg-gray-300"}`} />
                    {idx < recentActivities.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 min-h-[16px]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{activity.text}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600" />
                      <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Performance Chart ── */}
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Model Accuracy Evolution
              </CardTitle>
              <span className="text-xs text-gray-400 dark:text-gray-500">— accuracy over FL rounds</span>
            </div>

            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm font-medium hover:border-violet-300 dark:hover:border-violet-700 transition-colors min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedMeta.bg}`}>
                    <selectedMeta.Icon className={`w-3 h-3 ${selectedMeta.text}`} />
                  </div>
                  <span className="text-sm">{selectedModel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-52 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden py-1"
                  >
                    {modelOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => { setSelectedModel(opt.label); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${opt.bg}`}>
                          <opt.Icon className={`w-3.5 h-3.5 ${opt.text}`} />
                        </div>
                        <span className="flex-1 text-left text-gray-800 dark:text-gray-200 font-medium">{opt.label}</span>
                        {selectedModel === opt.label && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-5 pb-4">
          {/* Mini stats */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Latest Accuracy</p>
              <p className="text-xl font-bold" style={{ color: selectedMeta.color }}>
                {performanceData.at(-1)?.accuracy ?? "—"}%
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Rounds Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{performanceData.length}</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Improvement</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{((performanceData.at(-1)?.accuracy ?? 0) - (performanceData[0]?.accuracy ?? 0)).toFixed(1)}%
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={performanceData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="round" tick={{ fontSize: 11, fill: "#9ca3af" }} label={{ value: "FL Round", position: "insideBottom", offset: -8, fontSize: 11, fill: "#9ca3af" }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="accuracy" stroke={selectedMeta.color} strokeWidth={2.5}
                dot={{ fill: selectedMeta.color, r: 5, strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 7, fill: selectedMeta.color }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Hospital Map ── */}
      <HospitalMap />

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FLRoundTimeline />

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-2xl shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Active Models by Modality
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-4 pb-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modalityDistribution} margin={{ top: 4, right: 4, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} angle={-12} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#111",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { name: "Brain MRI",   bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400",  icon: <Brain className="w-4 h-4" /> },
                { name: "Chest X-Ray", bg: "bg-blue-50 dark:bg-blue-900/20",     text: "text-blue-600 dark:text-blue-400",      icon: <ScanLine className="w-4 h-4" /> },
                { name: "Retinal OCT", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", icon: <Eye className="w-4 h-4" /> },
                { name: "Skin Lesion", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500 dark:text-orange-400",  icon: <Microscope className="w-4 h-4" /> },
              ].map((m) => {
                const count = modalityDistribution.find(d => d.name === m.name)?.count ?? 0;
                return (
                  <div key={m.name} className={`flex items-center gap-2.5 p-3 rounded-xl ${m.bg}`}>
                    <div className={m.text}>{m.icon}</div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{m.name}</p>
                      <p className={`text-lg font-bold leading-tight ${m.text}`}>{count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}