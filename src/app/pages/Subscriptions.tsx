import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Check, X, CreditCard, TrendingUp, AlertTriangle, Ban,
  Cpu, ArrowUpRight, Building2, RefreshCw, Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// Types
interface SubscriptionPlan {
  id: string;
  name: string;
  price_dzd: number;
  max_diagnoses: number | null;
  max_storage_mb: number | null;
  max_ai_models: number | null;
  ai_team_access: boolean;
  explainability: boolean;
  fl_participation: string;
  support_level: string;
  custom_model_training: boolean;
  allowed_models: string[] | null;
}

interface HospitalSubscription {
  id: string;
  hospital_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  hospital?: {
    id: string;
    name: string;
  };
  plan?: SubscriptionPlan;
}

interface SubscriptionUsage {
  id: string;
  hospital_id: string;
  period_start: string;
  diagnoses_used: number;
  storage_used_mb: number;
}

interface Hospital {
  id: string;
  name: string;
  status: string;
  plan: string;
  created_at: string;
}

interface ToastMsg { id: number; title: string; description: string }

const planBadgeConfig: Record<string, string> = {
  premium:  "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  standard: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  free:     "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const planGradient: Record<string, { card: string; icon: string; btn: string; outline: string; bar: string }> = {
  premium: {
    card:    "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20",
    icon:    "from-purple-500 to-violet-600",
    btn:     "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-md shadow-purple-500/20",
    outline: "border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    bar:     "bg-purple-500",
  },
  standard: {
    card:    "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20",
    icon:    "from-blue-500 to-indigo-600",
    btn:     "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md shadow-blue-500/20",
    outline: "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    bar:     "bg-blue-500",
  },
  free: {
    card:    "from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800/50",
    icon:    "from-gray-500 to-slate-600",
    btn:     "bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white border-0 shadow-md shadow-gray-500/20",
    outline: "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
    bar:     "bg-gray-400",
  },
};

function ToastStack({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[280px] max-w-xs border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/30"
          >
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">{t.title}</p>
              <p className="text-xs mt-0.5 opacity-80 text-amber-800 dark:text-amber-200">{t.description}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Subscriptions() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<HospitalSubscription[]>([]);
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [usage, setUsage] = useState<SubscriptionUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; hospital: string; subscriptionId: string }>({
    isOpen: false, hospital: "", subscriptionId: "",
  });

  const addToast = (title: string, description: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("=== LOADING SUBSCRIPTIONS DATA ===");
      
      // Load plans from subscription_plans
      console.log("Fetching subscription_plans...");
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_dzd", { ascending: true });

      if (plansError) {
        console.error("Plans error:", plansError);
        throw new Error(`Plans error: ${plansError.message}`);
      }
      console.log("Plans loaded:", plansData?.length || 0);
      setPlans(plansData || []);

      // Load ALL hospitals (not just those with subscriptions)
      console.log("Fetching all hospitals...");
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from("hospitals")
        .select("id, name, status, plan, created_at")
        .order("name", { ascending: true });

      if (hospitalsError) {
        console.error("Hospitals error:", hospitalsError);
        throw new Error(`Hospitals error: ${hospitalsError.message}`);
      }
      console.log("All hospitals loaded:", hospitalsData?.length || 0);
      setAllHospitals(hospitalsData || []);

      // Load hospital subscriptions
      console.log("Fetching hospital_subscriptions...");
      const { data: subscriptionsData, error: subsError } = await supabase
        .from("hospital_subscriptions")
        .select("*");

      if (subsError) {
        console.error("Subscriptions error:", subsError);
        throw new Error(`Subscriptions error: ${subsError.message}`);
      }
      console.log("Raw subscriptions data:", subscriptionsData);

      // Load plans for mapping
      const { data: plansMapData, error: plansMapError } = await supabase
        .from("subscription_plans")
        .select("*");

      if (plansMapError) {
        console.error("Plans map error:", plansMapError);
      }
      
      const plansMap = new Map();
      (plansMapData || []).forEach((p: any) => plansMap.set(p.id, p));

      // Build the enhanced subscriptions array
      const enhancedSubscriptions = (subscriptionsData || []).map((sub: any) => ({
        ...sub,
        hospital: hospitalsData?.find((h: any) => h.id === sub.hospital_id),
        plan: plansMap.get(sub.plan_id)
      }));
      
      console.log("Enhanced subscriptions:", enhancedSubscriptions);
      setSubscriptions(enhancedSubscriptions);

      // Load usage data
      console.log("Fetching subscription_usage...");
      const { data: usageData, error: usageError } = await supabase
        .from("subscription_usage")
        .select("*")
        .order("period_start", { ascending: false });

      if (usageError) {
        console.error("Usage error:", usageError);
      }
      console.log("Usage data loaded:", usageData?.length || 0);
      setUsage(usageData || []);

      console.log("=== DATA LOAD COMPLETE ===");
      
    } catch (error: any) {
      console.error("Failed to load subscriptions data:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSuspend = async () => {
    const { error } = await supabase
      .from("hospital_subscriptions")
      .update({ status: "suspended" })
      .eq("id", suspendModal.subscriptionId);

    if (error) {
      toast.error("Failed to suspend subscription");
      return;
    }

    addToast(
      "Subscription suspended",
      `Access for "${suspendModal.hospital}" has been disabled.`,
    );
    loadData();
  };

  const handleActivate = async (subscriptionId: string, hospitalName: string) => {
    const { error } = await supabase
      .from("hospital_subscriptions")
      .update({ status: "active" })
      .eq("id", subscriptionId);

    if (error) {
      toast.error("Failed to activate subscription");
      return;
    }

    toast.success(`Subscription for ${hospitalName} activated`);
    loadData();
  };

  // Get active subscriptions count
  const activeSubscriptionsCount = subscriptions.filter(s => s.status === "active").length;
  const totalHospitals = allHospitals.length;
  
  const totalRevenue = subscriptions.reduce((sum, sub) => {
    if (sub.status === "active" && sub.plan) {
      return sum + sub.plan.price_dzd;
    }
    return sum;
  }, 0);

  const expiringSoon = subscriptions.filter(s => {
    if (!s.expires_at) return false;
    const expireDate = new Date(s.expires_at);
    const now = new Date();
    const daysUntilExpire = (expireDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return daysUntilExpire <= 30 && daysUntilExpire > 0;
  });

  const statCards = [
    {
      label: "Active Subscribers", value: `${activeSubscriptionsCount}/${totalHospitals}`,
      icon: CreditCard,
      gradient: "from-purple-500 to-violet-600",
      bg: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20",
      text: "text-purple-700 dark:text-purple-400",
      val: "text-purple-900 dark:text-purple-200",
      shadow: "shadow-purple-500/20",
    },
    {
      label: "Monthly Revenue", value: `${(totalRevenue / 1000).toFixed(0)}K DZD`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-900/20",
      text: "text-emerald-700 dark:text-emerald-400",
      val: "text-emerald-900 dark:text-emerald-200",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Expiring Soon", value: expiringSoon.length.toString(),
      icon: AlertTriangle,
      gradient: "from-orange-500 to-amber-500",
      bg: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-900/20",
      text: "text-orange-700 dark:text-orange-400",
      val: "text-orange-900 dark:text-orange-200",
      shadow: "shadow-orange-500/20",
    },
  ];

  const getHospitalUsage = (hospitalId: string) => {
    const currentUsage = usage.find(u => u.hospital_id === hospitalId);
    return currentUsage || { diagnoses_used: 0, storage_used_mb: 0 };
  };

  // Get or create a subscription record for hospitals without one
  const getHospitalSubscription = (hospital: Hospital) => {
    const existingSub = subscriptions.find(s => s.hospital_id === hospital.id);
    if (existingSub) return existingSub;
    
    // Create a virtual subscription for hospitals without one
    const planId = hospital.plan === "premium" ? "premium" : hospital.plan === "standard" ? "standard" : "free";
    return {
      id: `virtual-${hospital.id}`,
      hospital_id: hospital.id,
      plan_id: planId,
      status: hospital.status === "active" ? "active" : "inactive",
      started_at: hospital.created_at,
      expires_at: null,
      hospital: hospital,
      plan: plans.find(p => p.id === planId)
    };
  };

  // Create a combined list of all hospitals with their subscription info
  const allHospitalSubscriptions = allHospitals.map(hospital => getHospitalSubscription(hospital));

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-500">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <ToastStack toasts={toasts} />

      <DeleteConfirmModal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, hospital: "", subscriptionId: "" })}
        onConfirm={handleSuspend}
        title="Suspend Subscription"
        message="Suspending this subscription will disable access to all premium features."
        itemName={suspendModal.hospital}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Subscriptions
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Manage SaaS plans and monetization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              Total Monthly Revenue
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalRevenue.toLocaleString()} DZD
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className={`border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${stat.bg}`}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md ${stat.shadow}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className={`w-4 h-4 ${stat.text} opacity-50`} />
                </div>
                <p className={`text-2xl font-bold ${stat.val} leading-none mb-1`}>{stat.value}</p>
                <p className={`text-xs font-medium ${stat.text}`}>{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Plan Cards */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, idx) => {
            const pg = planGradient[plan.id] || planGradient.free;
            const activeCount = allHospitalSubscriptions.filter(s => s.plan_id === plan.id && s.status === "active").length;
            
            // Get sample hospital for this plan to show usage
            const sampleHospital = allHospitalSubscriptions.find(s => s.plan_id === plan.id);
            const hospitalUsage = sampleHospital ? getHospitalUsage(sampleHospital.hospital_id) : { diagnoses_used: 0, storage_used_mb: 0 };
            
            const diagnosesPercent = plan.max_diagnoses && hospitalUsage.diagnoses_used 
              ? (hospitalUsage.diagnoses_used / plan.max_diagnoses) * 100 
              : 0;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
              >
                <Card className={`border ${
                  plan.id === "standard"
                    ? "border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/15"
                    : "border-gray-100 dark:border-gray-800"
                } bg-gradient-to-br ${pg.card} relative overflow-hidden hover:shadow-xl transition-all duration-300 h-full`}>

                  {plan.id === "standard" && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs shadow-md">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3 pt-5 px-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pg.icon} flex items-center justify-center shadow-md`}>
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                        {plan.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {plan.price_dzd.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">DZD/month</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{activeCount} active subscribers</p>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 space-y-5">
                    {/* Usage bar for diagnoses */}
                    {plan.max_diagnoses && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Current Usage</span>
                          <span className={`font-semibold ${diagnosesPercent > 80 ? "text-orange-600" : "text-emerald-600"}`}>
                            {hospitalUsage.diagnoses_used}/{plan.max_diagnoses}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(diagnosesPercent, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + idx * 0.08 }}
                            className={`h-full rounded-full ${diagnosesPercent > 80 ? "bg-orange-500" : pg.bar}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {plan.max_diagnoses ? `${plan.max_diagnoses} diagnoses/month` : "Unlimited diagnoses"}
                          </span>
                          {plan.max_diagnoses && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {hospitalUsage.diagnoses_used}/{plan.max_diagnoses} used
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {plan.max_ai_models ? `${plan.max_ai_models} AI models access` : "All AI models"}
                          </span>
                          {plan.allowed_models && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {plan.allowed_models.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        {plan.ai_team_access ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-2.5 h-2.5 text-red-500" />
                          </div>
                        )}
                        <span className={`text-sm font-medium ${plan.ai_team_access ? "text-gray-800" : "text-gray-400 line-through"}`}>
                          AI team access
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        {plan.explainability ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-2.5 h-2.5 text-red-500" />
                          </div>
                        )}
                        <div>
                          <span className={`text-sm font-medium ${plan.explainability ? "text-gray-800" : "text-gray-400 line-through"}`}>
                            Explainability features
                          </span>
                          {plan.explainability && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              Grad-CAM, Attention maps
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            FL Participation: {plan.fl_participation}
                          </span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                            {plan.fl_participation === "active" ? "Active contributor" :
                             plan.fl_participation === "observer" ? "Observer mode" : "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {plan.max_storage_mb ? `${plan.max_storage_mb} MB storage` : "Unlimited storage"}
                          </span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {plan.max_storage_mb ? `${hospitalUsage.storage_used_mb} MB used` : `${(hospitalUsage.storage_used_mb / 1024).toFixed(1)} GB used`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                          {plan.support_level} support
                        </span>
                      </div>

                      {plan.custom_model_training && (
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Custom model training
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Buttons - BOTH buttons restored */}
                    <div className="space-y-2 pt-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className={`w-full rounded-xl h-9 text-sm font-semibold border ${pg.outline}`}
                          onClick={() => navigate(`/plans/${plan.id}`)}
                        >
                          Review Plan Details
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className={`w-full rounded-xl h-9 text-sm font-semibold ${pg.btn}`}
                          onClick={() => navigate(`/plan-settings/${plan.id}`)}
                        >
                          <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                          Update Plan Settings
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No subscription plans found</p>
            <Button onClick={loadData} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Hospitals Subscriptions Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hospital Subscriptions
                </CardTitle>
              </div>
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 text-xs">
                {activeSubscriptionsCount} active / {totalHospitals} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {allHospitalSubscriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/60">
                    {["Hospital", "Plan", "Status", "Expiration", "Diagnoses Usage", "Monthly Revenue", "Actions"].map((h) => (
                      <TableHead key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 first:pl-6 last:pr-6">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allHospitalSubscriptions.map((sub, idx) => {
                    const hospitalUsage = getHospitalUsage(sub.hospital_id);
                    const plan = sub.plan;
                    const diagnosesPercent = plan?.max_diagnoses && hospitalUsage.diagnoses_used 
                      ? (hospitalUsage.diagnoses_used / plan.max_diagnoses) * 100 
                      : 0;
                    const isVirtual = sub.id?.startsWith("virtual-");
                    
                    return (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-gray-50 hover:bg-purple-50/20 transition-colors"
                      >
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                              <Building2 className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {sub.hospital?.name || "Unknown Hospital"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="outline" className={`text-xs font-semibold border ${planBadgeConfig[sub.plan_id] || planBadgeConfig.free}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                              sub.plan_id === "premium" ? "bg-purple-500" :
                              sub.plan_id === "standard" ? "bg-blue-500" : "bg-gray-400"
                            }`} />
                            {sub.plan?.name || sub.plan_id}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <Badge variant="outline" className={`text-xs ${
                            sub.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            sub.status === "suspended" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                          }`}>
                            {sub.status === "inactive" ? "pending" : sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-600">
                          {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : isVirtual ? "No subscription" : "N/A"}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(diagnosesPercent, 100)}%` }}
                                className={`h-full rounded-full ${diagnosesPercent > 80 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-violet-600"}`}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${diagnosesPercent > 80 ? "text-red-600" : "text-gray-600"}`}>
                              {hospitalUsage.diagnoses_used}/{plan?.max_diagnoses || "∞"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {sub.plan?.price_dzd > 0 ? (
                            <span className="font-semibold text-sm text-emerald-600">
                              {sub.plan.price_dzd.toLocaleString()} DZD
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Free</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 pr-6">
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg h-7 px-2.5 text-xs font-semibold"
                              onClick={() => navigate(`/subscriptions/upgrade/${idx}`)}
                              disabled={sub.plan_id === "premium" || isVirtual}
                            >
                              Upgrade
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg h-7 px-2.5 text-xs font-semibold"
                              onClick={() => navigate(`/subscriptions/renew/${idx}`)}
                              disabled={isVirtual}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Renew
                            </Button>
                            {sub.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2.5 text-xs font-semibold"
                                onClick={() => setSuspendModal({ isOpen: true, hospital: sub.hospital?.name || "Hospital", subscriptionId: sub.id })}
                                disabled={isVirtual}
                              >
                                <Ban className="w-3 h-3 mr-1" />
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 h-7 px-2.5 text-xs font-semibold"
                                onClick={() => handleActivate(sub.id, sub.hospital?.name || "Hospital")}
                                disabled={isVirtual}
                              >
                                Activate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No hospitals found</p>
                <Button onClick={loadData} variant="outline" className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}