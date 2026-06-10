import { useEffect, useState } from "react";
import {
  Building2, Brain, RefreshCw, CreditCard, TrendingUp, Activity,
  Check, ChevronDown, Network, Microscope, ScanLine, Eye,
  Clock, BarChart3, Layers, Shield, Loader2,
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
import { supabase } from "../../lib/supabaseClient";

// Types
interface Hospital {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface GlobalModel {
  id: string;
  name: string;
  modality: string;
  version: string;
  accuracy: number;
  global_accuracy: number;
  status: string;
  aggregated_at: string;
}

interface FLRound {
  id: string;
  round_number: number;
  status: string;
  created_at: string;
}

interface LocalWeight {
  id: string;
  fl_round_id: string;
  hospital_id: string;
  accuracy: number;
  status: string;
  submitted_at: string;
}

interface Activity {
  text: string;
  time: string;
  type: string;
}

// Expanded model icons to handle various modality names
const modelIcons: Record<string, { Icon: any; color: string; bg: string; text: string }> = {
  "Brain MRI": { Icon: Brain, color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
  "BRAIN": { Icon: Brain, color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
  "Brain": { Icon: Brain, color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
  "Chest X-Ray": { Icon: ScanLine, color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
  "Chest XRay": { Icon: ScanLine, color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
  "Retinal OCT": { Icon: Eye, color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
  "Skin Lesion": { Icon: Microscope, color: "#f97316", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500 dark:text-orange-400" },
  "Dermatology": { Icon: Microscope, color: "#f97316", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500 dark:text-orange-400" },
  "Unknown": { Icon: Brain, color: "#6b7280", bg: "bg-gray-50 dark:bg-gray-800/50", text: "text-gray-500 dark:text-gray-400" },
};

// Helper function to get icon for any modality
const getModalityIcon = (modality: string) => {
  if (!modality) return modelIcons["Unknown"];
  // Try exact match first
  if (modelIcons[modality]) return modelIcons[modality];
  // Try uppercase match
  if (modelIcons[modality.toUpperCase()]) return modelIcons[modality.toUpperCase()];
  // Try lowercase match
  const lowerKey = Object.keys(modelIcons).find(key => key.toLowerCase() === modality.toLowerCase());
  if (lowerKey) return modelIcons[lowerKey];
  // Return default
  return modelIcons["Unknown"];
};

const STATUS: Record<string, { badge: string; iconBg: string; iconText: string; bar: string; pct: string }> = {
  active: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    pct: "100%",
  },
  training: {
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconText: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
    pct: "65%",
  },
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
    iconText: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-400",
    pct: "25%",
  },
  completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    pct: "100%",
  },
};

const activityDot: Record<string, string> = {
  upload: "bg-violet-400",
  success: "bg-emerald-400",
  info: "bg-blue-400",
  deploy: "bg-indigo-400",
  subscription: "bg-amber-400",
  round: "bg-sky-400",
};

function GradientStatCard({ title, value, subtitle, icon: Icon, gradientClass, shadowClass }: any) {
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">Round {label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value}%</p>
    </div>
  );
};

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [globalModels, setGlobalModels] = useState<GlobalModel[]>([]);
  const [flRounds, setFlRounds] = useState<FLRound[]>([]);
  const [localWeights, setLocalWeights] = useState<LocalWeight[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [selectedModel, setSelectedModel] = useState("Brain MRI");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<{ round: number; accuracy: number }[]>([]);
  const [modalityDistribution, setModalityDistribution] = useState<{ name: string; count: number }[]>([]);
  const [federatedModels, setFederatedModels] = useState<any[]>([]);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [activeModelsCount, setActiveModelsCount] = useState(0);
  const [totalModelsCount, setTotalModelsCount] = useState(0);
  const [premiumSubscribers, setPremiumSubscribers] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Update performance data when selected model changes
    const model = globalModels.find(m => m.modality === selectedModel);
    if (model) {
      const historicalData = globalModels
        .filter(m => m.modality === selectedModel)
        .sort((a, b) => new Date(a.aggregated_at).getTime() - new Date(b.aggregated_at).getTime())
        .map((m, idx) => ({
          round: idx + 1,
          accuracy: m.global_accuracy || m.accuracy || 0,
        }));
      
      if (historicalData.length > 0) {
        setPerformanceData(historicalData);
      } else {
        const baseAccuracy = model.global_accuracy || model.accuracy || 85;
        const sampleData = [];
        for (let i = 1; i <= 8; i++) {
          sampleData.push({
            round: i,
            accuracy: Math.min(98, baseAccuracy + (i * 1.5)),
          });
        }
        setPerformanceData(sampleData);
      }
    }
  }, [selectedModel, globalModels]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch hospitals
      const { data: hospitalsData } = await supabase
        .from("hospitals")
        .select("id, name, status, created_at");
      setHospitals(hospitalsData || []);
      setTotalHospitals(hospitalsData?.length || 0);

      // Fetch global models
      const { data: modelsData } = await supabase
        .from("global_models")
        .select("*")
        .order("aggregated_at", { ascending: false });
      
      setGlobalModels(modelsData || []);
      setTotalModelsCount(modelsData?.length || 0);
      setActiveModelsCount(modelsData?.filter(m => m.status === "active").length || 0);

      // Fetch FL rounds
      const { data: roundsData } = await supabase
        .from("fl_rounds")
        .select("*")
        .order("created_at", { ascending: false });
      setFlRounds(roundsData || []);

      // Fetch local weights
      const { data: weightsData } = await supabase
        .from("local_model_weights")
        .select("*")
        .order("submitted_at", { ascending: false });
      setLocalWeights(weightsData || []);

      // Fetch premium subscribers
      const { data: premiumSubs } = await supabase
        .from("hospital_subscriptions")
        .select("hospital_id")
        .eq("plan_id", "premium")
        .eq("status", "active");
      setPremiumSubscribers(premiumSubs?.length || 0);

      // Build modality distribution - includes ALL modalities from database
      const modalityMap = new Map<string, number>();
      (modelsData || []).forEach((model: GlobalModel) => {
        let modality = model.modality || "Unknown";
        // Normalize common variations
        if (modality === "BRAIN") modality = "BRAIN";
        if (modality === "Brain") modality = "BRAIN";
        if (modality === "Chest XRay") modality = "Chest X-Ray";
        modalityMap.set(modality, (modalityMap.get(modality) || 0) + 1);
      });

      const distribution = Array.from(modalityMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setModalityDistribution(distribution);

      // Set default selected model to the first available modality
      if (distribution.length > 0 && distribution[0].name !== selectedModel) {
        setSelectedModel(distribution[0].name);
      }

      // Build federated models list
      const models = (modelsData || []).slice(0, 4).map((model: GlobalModel) => {
        const statusKey = model.status === "active" ? "active" : model.status === "pending" ? "pending" : "training";
        return {
          id: model.name || model.id,
          modality: model.modality || "Unknown",
          round: Math.floor(Math.random() * 20) + 5,
          status: model.status === "active" ? "Completed" : model.status === "pending" ? "Pending" : "Training",
          accuracy: model.global_accuracy || model.accuracy || 85,
        };
      });
      setFederatedModels(models);

      // Build recent activities
      const activities: Activity[] = [];
      
      (weightsData || []).slice(0, 3).forEach((weight: LocalWeight) => {
        const hospital = hospitalsData?.find(h => h.id === weight.hospital_id);
        if (hospital) {
          activities.push({
            text: `${hospital.name} uploaded local model update with ${weight.accuracy}% accuracy`,
            time: new Date(weight.submitted_at).toLocaleTimeString(),
            type: "upload",
          });
        }
      });
      
      (roundsData || []).slice(0, 2).forEach((round: FLRound) => {
        activities.push({
          text: `Round ${round.round_number} ${round.status === "Running" ? "started" : "completed"}`,
          time: new Date(round.created_at).toLocaleTimeString(),
          type: round.status === "Running" ? "round" : "success",
        });
      });
      
      const completedModels = (modelsData || []).filter(m => m.status === "active").slice(0, 2);
      completedModels.forEach((model: GlobalModel) => {
        activities.push({
          text: `${model.modality} model ${model.version || "v1.0"} deployed to hospitals`,
          time: new Date(model.aggregated_at).toLocaleTimeString(),
          type: "deploy",
        });
      });

      setRecentActivities(activities.slice(0, 6));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Get model options dynamically from database modalities
  const getModelOptions = () => {
    if (modalityDistribution.length > 0) {
      return modalityDistribution.map(item => {
        const iconInfo = getModalityIcon(item.name);
        return {
          label: item.name,
          Icon: iconInfo.Icon,
          color: iconInfo.color,
          bg: iconInfo.bg,
          text: iconInfo.text,
        };
      });
    }
    // Fallback
    return Object.entries(modelIcons).map(([label, config]) => ({
      label,
      Icon: config.Icon,
      color: config.color,
      bg: config.bg,
      text: config.text,
    }));
  };

  const modelOptions = getModelOptions();
  const selectedMeta = modelOptions.find((m) => m.label === selectedModel) || modelOptions[0] || { label: "Unknown", Icon: Brain, color: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" };

  const getModelIcon = (modality: string) => {
    const iconInfo = getModalityIcon(modality);
    return iconInfo.Icon;
  };

  const getModelStatusStyle = (status: string) => {
    const statusKey = status === "Completed" ? "completed" : status === "Pending" ? "pending" : "training";
    return STATUS[statusKey] || STATUS.training;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
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
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-md shadow-violet-200 dark:shadow-violet-900/40 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </motion.div>

      {/* Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Hospitals", value: totalHospitals.toString(), subtitle: "in network", Icon: Building2, i: 0, g: "from-blue-500 to-blue-600", s: "shadow-blue-200 dark:shadow-blue-900/40" },
          { title: "Active FL Models", value: activeModelsCount.toString(), subtitle: "Running now", Icon: Brain, i: 1, g: "from-emerald-500 to-teal-600", s: "shadow-emerald-200 dark:shadow-emerald-900/40" },
          { title: "Total Models", value: totalModelsCount.toString(), subtitle: "in library", Icon: Layers, i: 2, g: "from-violet-500 to-purple-600", s: "shadow-violet-200 dark:shadow-violet-900/40" },
          { title: "Premium Subscribers", value: premiumSubscribers.toString(), subtitle: "active", Icon: CreditCard, i: 3, g: "from-orange-400 to-orange-500", s: "shadow-orange-200 dark:shadow-orange-900/40" },
        ].map(({ title, value, subtitle, Icon, i, g, s }) => (
          <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <GradientStatCard title={title} value={value} subtitle={subtitle} icon={Icon} gradientClass={g} shadowClass={s} />
          </motion.div>
        ))}
      </div>

      {/* Models + Activity */}
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
              const s = getModelStatusStyle(model.status);
              const MIcon = getModelIcon(model.modality);
              const accuracy = typeof model.accuracy === 'number' ? model.accuracy : 85;
              
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
                    <p className={`text-lg font-bold ${s.iconText}`}>{accuracy}%</p>
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

      {/* Performance Chart */}
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
            {modelOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm font-medium hover:border-violet-300 dark:hover:border-violet-700 transition-colors min-w-[160px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedMeta.bg}`}>
                      <selectedMeta.Icon className={`w-3 h-3 ${selectedMeta.text}`} />
                    </div>
                    <span className="text-sm">{selectedMeta.label}</span>
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
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-5 pb-4">
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
                +{performanceData.length > 1 ? ((performanceData.at(-1)?.accuracy ?? 0) - (performanceData[0]?.accuracy ?? 0)).toFixed(1) : "0"}%
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

      {/* Hospital Map */}
      <HospitalMap />

      {/* Bottom Grid */}
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
            {modalityDistribution.length > 0 ? (
              <>
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
                  {modalityDistribution.slice(0, 4).map((item) => {
                    const iconInfo = getModalityIcon(item.name);
                    return (
                      <div key={item.name} className={`flex items-center gap-2.5 p-3 rounded-xl ${iconInfo.bg}`}>
                        <div className={iconInfo.text}><iconInfo.Icon className="w-4 h-4" /></div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.name}</p>
                          <p className={`text-lg font-bold leading-tight ${iconInfo.text}`}>{item.count}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No models found in the database
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}