import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Check, X, CreditCard, TrendingUp, AlertTriangle, Ban,
  Cpu, ArrowUpRight, Building2, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { motion, AnimatePresence } from "motion/react";

// ── Data ──────────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free Plan",
    price: "0 DZD",
    priceNumeric: 0,
    usage: {
      diagnoses: { used: 4, total: 5 },
      models: { used: 1, total: 2 },
      storage: { used: 120, total: 500 },
    },
    features: [
      { text: "5 diagnoses/month", included: true, limit: "4/5 used" },
      { text: "2 basic models only", included: true, limit: "Brain MRI, Chest X-Ray" },
      { text: "No AI team access", included: false },
      { text: "500 MB storage", included: true, limit: "120 MB used" },
      { text: "Email support only", included: true },
    ],
    color: "gray",
  },
  {
    name: "Standard Plan",
    price: "2,000 DZD",
    priceNumeric: 2000,
    usage: {
      diagnoses: { used: 67, total: 100 },
      models: { used: 4, total: 6 },
      storage: { used: 3200, total: 10000 },
    },
    features: [
      { text: "100 diagnoses/month", included: true, limit: "67/100 used" },
      { text: "6 AI models access", included: true, limit: "All except experimental" },
      { text: "Explainability features", included: true, limit: "Grad-CAM, Attention" },
      { text: "Partial FL participation", included: true, limit: "Observer mode" },
      { text: "10 GB storage", included: true, limit: "3.2 GB used" },
      { text: "Priority email support", included: true },
    ],
    color: "blue",
    popular: true,
  },
  {
    name: "Premium Plan",
    price: "4,000 DZD",
    priceNumeric: 4000,
    usage: {
      diagnoses: { used: 847, total: null },
      models: { used: 12, total: 12 },
      storage: { used: 15400, total: null },
    },
    features: [
      { text: "Unlimited diagnoses", included: true, limit: "847 this month" },
      { text: "All 12 AI models", included: true, limit: "Including experimental" },
      { text: "Full explainability suite", included: true, limit: "All methods enabled" },
      { text: "Full FL participation", included: true, limit: "Active contributor" },
      { text: "Unlimited storage", included: true, limit: "15.4 GB used" },
      { text: "24/7 dedicated support", included: true },
      { text: "Custom model training", included: true },
    ],
    color: "purple",
  },
];

const subscriptions = [
  { hospital: "CHU Alger",            plan: "Premium",  expiration: "June 2026",   usage: 78, revenue: 4000 },
  { hospital: "CHU Oran",             plan: "Premium",  expiration: "July 2026",   usage: 65, revenue: 4000 },
  { hospital: "CHU Constantine",      plan: "Standard", expiration: "May 2026",    usage: 92, revenue: 2000 },
  { hospital: "Hôpital Central Tunis",plan: "Premium",  expiration: "August 2026", usage: 45, revenue: 4000 },
  { hospital: "Casablanca Medical",   plan: "Standard", expiration: "June 2026",   usage: 88, revenue: 2000 },
  { hospital: "Cairo University",     plan: "Free",     expiration: "-",           usage: 95, revenue: 0    },
];

// ── Configs ───────────────────────────────────────────────────────────────────

const planBadgeConfig: Record<string, string> = {
  Premium:  "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  Standard: "bg-blue-50   dark:bg-blue-900/20   text-blue-700   dark:text-blue-400   border-blue-200   dark:border-blue-800",
  Free:     "bg-gray-50   dark:bg-gray-800/50   text-gray-600   dark:text-gray-400   border-gray-200   dark:border-gray-700",
};

const planGradient: Record<string, { card: string; icon: string; btn: string; outline: string; bar: string }> = {
  purple: {
    card:    "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20",
    icon:    "from-purple-500 to-violet-600",
    btn:     "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-md shadow-purple-500/20",
    outline: "border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    bar:     "bg-purple-500",
  },
  blue: {
    card:    "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20",
    icon:    "from-blue-500 to-indigo-600",
    btn:     "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-md shadow-blue-500/20",
    outline: "border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    bar:     "bg-blue-500",
  },
  gray: {
    card:    "from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800/50",
    icon:    "from-gray-500 to-slate-600",
    btn:     "bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white border-0 shadow-md shadow-gray-500/20",
    outline: "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
    bar:     "bg-gray-400",
  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastMsg { id: number; title: string; description: string }

function ToastStack({ toasts }: { toasts: ToastMsg[] }) {
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

// ── Main Component ────────────────────────────────────────────────────────────

export function Subscriptions() {
  const navigate = useNavigate();
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.revenue, 0);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; hospital: string }>({
    isOpen: false, hospital: "",
  });

  const addToast = (title: string, description: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const handleSuspend = () => {
    addToast(
      "Subscription suspended",
      `Access for "${suspendModal.hospital}" has been disabled.`,
    );
  };

  // ── Stat cards ──
  const statCards = [
    {
      label: "Premium Subscribers", value: "9",
      icon: CreditCard,
      gradient: "from-purple-500 to-violet-600",
      bg:       "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20",
      text:     "text-purple-700 dark:text-purple-400",
      val:      "text-purple-900 dark:text-purple-200",
      shadow:   "shadow-purple-500/20",
    },
    {
      label: "Revenue Growth", value: "+18%",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bg:       "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-900/20",
      text:     "text-emerald-700 dark:text-emerald-400",
      val:      "text-emerald-900 dark:text-emerald-200",
      shadow:   "shadow-emerald-500/20",
    },
    {
      label: "Expiring Soon", value: "2",
      icon: AlertTriangle,
      gradient: "from-orange-500 to-amber-500",
      bg:       "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-900/20",
      text:     "text-orange-700 dark:text-orange-400",
      val:      "text-orange-900 dark:text-orange-200",
      shadow:   "shadow-orange-500/20",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      <ToastStack toasts={toasts} />

      <DeleteConfirmModal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, hospital: "" })}
        onConfirm={handleSuspend}
        title="Suspend Subscription"
        message="Suspending this subscription will disable access to all premium features. The hospital will not be able to participate in FL rounds until the subscription is reactivated."
        itemName={suspendModal.hospital}
      />

      {/* ── Header ── */}
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
              Subscriptions
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Manage SaaS plans and monetization
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5">
            Total Monthly Revenue
          </p>
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
          >
            {totalRevenue.toLocaleString()} DZD
          </motion.p>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
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
                <p className={`text-2xl font-bold ${stat.val} leading-none mb-1`}>{stat.value}</p>
                <p className={`text-xs font-medium ${stat.text}`}>{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, idx) => {
          const pg = planGradient[plan.color];
          const usagePct = plan.usage.diagnoses.total
            ? (plan.usage.diagnoses.used / plan.usage.diagnoses.total) * 100
            : 30;
          const isHigh = usagePct > 80;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
            >
              <Card className={`border ${
                plan.popular
                  ? "border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/15"
                  : "border-gray-100 dark:border-gray-800"
              } bg-gradient-to-br ${pg.card} relative overflow-hidden hover:shadow-xl transition-all duration-300 h-full`}>

                {plan.popular && (
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
                      {plan.priceNumeric.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">DZD/month</span>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 space-y-5">
                  {/* Usage bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Current Usage
                      </span>
                      <span className={`font-semibold ${isHigh ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {plan.usage.diagnoses.total
                          ? `${plan.usage.diagnoses.used}/${plan.usage.diagnoses.total}`
                          : `${plan.usage.diagnoses.used} used`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(usagePct, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + idx * 0.08 }}
                        className={`h-full rounded-full ${isHigh ? "bg-orange-500" : pg.bar}`}
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {plan.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        {feature.included ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-2.5 h-2.5 text-red-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${
                            feature.included
                              ? "text-gray-800 dark:text-gray-200"
                              : "text-gray-400 dark:text-gray-500 line-through"
                          }`}>
                            {feature.text}
                          </span>
                          {feature.included && feature.limit && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{feature.limit}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className={`w-full rounded-xl h-9 text-sm font-semibold border ${pg.outline}`}
                        onClick={() => navigate(`/plans/${idx}`)}
                      >
                        Review Plan Details
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className={`w-full rounded-xl h-9 text-sm font-semibold ${pg.btn}`}
                        onClick={() => navigate(`/plans/${idx}`)}
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

      {/* ── Active Subscriptions Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Active Subscriptions
                </CardTitle>
              </div>
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-xs">
                {subscriptions.length} hospitals
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
                  {["Hospital", "Plan", "Expiration", "Usage", "Monthly Revenue", "Actions"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide py-3 px-4 first:pl-6 last:pr-6">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub, idx) => (
                  <motion.tr
                    key={idx}
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
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{sub.hospital}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge variant="outline" className={`text-xs font-semibold border ${planBadgeConfig[sub.plan]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                          sub.plan === "Premium" ? "bg-purple-500" :
                          sub.plan === "Standard" ? "bg-blue-500" : "bg-gray-400"
                        }`} />
                        {sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {sub.expiration}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sub.usage}%` }}
                            transition={{ duration: 0.7, delay: idx * 0.05 }}
                            className={`h-full rounded-full ${sub.usage > 90 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-violet-600"}`}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${sub.usage > 90 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                          {sub.usage}%
                        </span>
                        {sub.usage > 90 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {sub.revenue > 0 ? (
                        <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                          {sub.revenue.toLocaleString()} DZD
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 pr-6">
                      <div className="flex gap-1.5">
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 h-7 px-2.5 text-xs font-semibold"
                            onClick={() => navigate(`/subscriptions/upgrade/${idx}`)}
                          >
                            Upgrade
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 h-7 px-2.5 text-xs font-semibold"
                            onClick={() => navigate(`/subscriptions/renew/${idx}`)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Renew
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2.5 text-xs font-semibold"
                            onClick={() => setSuspendModal({ isOpen: true, hospital: sub.hospital })}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}