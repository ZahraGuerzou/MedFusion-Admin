import { useState } from "react";
import {
  Send,
  Package,
  Brain,
  CheckCircle2,
  Filter,
  Calendar,
  FileText,
  Eye,
  X,
  Network,
  Microscope,
  ScanLine,
  Activity,
  TrendingUp,
  Building2,
  ChevronRight,
  Search,
  Dna,
  Stethoscope,
  FlaskConical,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { PackageTracker } from "../components/PackageTracker";
import { FLTrainingWizard } from "../components/FLTrainingWizard";

interface DistributionRecord {
  id: string;
  hospital: string;
  recipient: string;
  recipientType: "doctor" | "ai-team";
  model: string;
  modality: string;
  action: "deployed" | "updated" | "delivered";
  status: "success";
  deploymentDate: string;
  deliveryDate: string;
  packageSize: string;
  instructions: string;
}

const distributionHistory: DistributionRecord[] = [
  { id: "DIST-001", hospital: "CHU Alger", recipient: "Dr. Ahmed Mohamed", recipientType: "doctor", model: "MRI-EFF-v1.4", modality: "Brain MRI", action: "deployed", status: "success", deploymentDate: "2026-05-19 10:30", deliveryDate: "2026-05-19 10:35", packageSize: "245 MB", instructions: "Model ready for clinical diagnosis with Grad-CAM explanations enabled" },
  { id: "DIST-002", hospital: "CHU Oran", recipient: "AI Team - Fatima Hassan", recipientType: "ai-team", model: "CXR-RES-v2.1", modality: "Chest X-Ray", action: "deployed", status: "success", deploymentDate: "2026-05-19 09:15", deliveryDate: "2026-05-19 09:20", packageSize: "189 MB", instructions: "Training package with notebook and local update submission guide" },
  { id: "DIST-003", hospital: "CHU Constantine", recipient: "Dr. Sarah Benali", recipientType: "doctor", model: "OCT-VIT-v1.2", modality: "Retinal OCT", action: "delivered", status: "success", deploymentDate: "2026-05-18 16:45", deliveryDate: "2026-05-18 16:50", packageSize: "312 MB", instructions: "Retinal disease classification model with attention visualization" },
  { id: "DIST-004", hospital: "Hospital Mustapha", recipient: "AI Team - Youssef Mansour", recipientType: "ai-team", model: "MRI-EFF-v1.4", modality: "Brain MRI", action: "updated", status: "success", deploymentDate: "2026-05-17 11:00", deliveryDate: "2026-05-17 11:05", packageSize: "245 MB", instructions: "Updated weights from Round 15 with improved accuracy" },
  { id: "DIST-005", hospital: "Casablanca Medical Center", recipient: "Dr. Omar Khalil", recipientType: "doctor", model: "SKIN-CONV-v3.0", modality: "Skin Lesion", action: "deployed", status: "success", deploymentDate: "2026-05-18 14:20", deliveryDate: "2026-05-18 14:25", packageSize: "178 MB", instructions: "Skin cancer detection model using HAM10000 dataset protocol" },
  { id: "DIST-006", hospital: "Cairo University Hospital", recipient: "AI Team - Ahmed Mostafa", recipientType: "ai-team", model: "CXR-RES-v2.1", modality: "Chest X-Ray", action: "delivered", status: "success", deploymentDate: "2026-05-16 08:30", deliveryDate: "2026-05-16 08:35", packageSize: "189 MB", instructions: "Complete federated learning package with local training scripts" },
  { id: "DIST-007", hospital: "Tripoli General Hospital", recipient: "Dr. Fatima Al-Mansoori", recipientType: "doctor", model: "MRI-EFF-v1.4", modality: "Brain MRI", action: "deployed", status: "success", deploymentDate: "2026-05-15 13:45", deliveryDate: "2026-05-15 13:50", packageSize: "245 MB", instructions: "Brain tumor detection model with preprocessing requirements" },
];

const modalities = ["All Modalities", "Brain MRI", "Chest X-Ray", "Retinal OCT", "Skin Lesion"];
const actions = ["All Actions", "deployed", "updated", "delivered"];

const modalityIcon: Record<string, React.ReactNode> = {
  "Brain MRI": <Brain className="w-3.5 h-3.5" />,
  "Chest X-Ray": <ScanLine className="w-3.5 h-3.5" />,
  "Retinal OCT": <Eye className="w-3.5 h-3.5" />,
  "Skin Lesion": <Microscope className="w-3.5 h-3.5" />,
};

const actionConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  deployed: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
  updated:  { bg: "bg-sky-50 dark:bg-sky-900/20",     text: "text-sky-700 dark:text-sky-400",     border: "border-sky-200 dark:border-sky-800",     dot: "bg-sky-500" },
  delivered:{ bg: "bg-violet-50 dark:bg-violet-900/20",text: "text-violet-700 dark:text-violet-400",border: "border-violet-200 dark:border-violet-800",dot: "bg-violet-500" },
};

const WORKFLOW_STEPS = [
  { label: "Select Model",       icon: FlaskConical,  color: "from-blue-500 to-indigo-600",   shadow: "shadow-blue-500/25" },
  { label: "Choose Recipients",  icon: Building2,     color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/25" },
  { label: "Add Instructions",   icon: FileText,      color: "from-amber-500 to-orange-500",  shadow: "shadow-amber-500/25" },
  { label: "Deploy Package",     icon: Send,          color: "from-rose-500 to-pink-600",     shadow: "shadow-rose-500/25" },
  { label: "Track Delivery",     icon: Activity,      color: "from-emerald-500 to-teal-600",  shadow: "shadow-emerald-500/25" },
];

const STAT_CARDS = [
  { label: "Total Deployments", value: distributionHistory.length.toString(), icon: BadgeCheck, gradient: "from-emerald-500 to-teal-600", bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-900/20", text: "text-emerald-700 dark:text-emerald-400", val: "text-emerald-900 dark:text-emerald-200", shadow: "shadow-emerald-500/20" },
  { label: "Active Models",     value: `${new Set(distributionHistory.map((r) => r.model)).size}`,  icon: Network, gradient: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20", text: "text-blue-700 dark:text-blue-400", val: "text-blue-900 dark:text-blue-200", shadow: "shadow-blue-500/20" },
  { label: "Hospitals Served",  value: `${new Set(distributionHistory.map((r) => r.hospital)).size}`, icon: Building2, gradient: "from-violet-500 to-purple-600", bg: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-900/20", text: "text-violet-700 dark:text-violet-400", val: "text-violet-900 dark:text-violet-200", shadow: "shadow-violet-500/20" },
  { label: "Success Rate",      value: "100%", icon: TrendingUp, gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-900/20", text: "text-amber-700 dark:text-amber-400", val: "text-amber-900 dark:text-amber-200", shadow: "shadow-amber-500/20" },
];

function RecipientBadge({ type }: { type: "doctor" | "ai-team" }) {
  return type === "doctor" ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 font-medium">
      <Stethoscope className="w-3 h-3" /> Doctor
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800 font-medium">
      <Dna className="w-3 h-3" /> AI Team
    </span>
  );
}

export function ModelDistribution() {
  const [modalityFilter, setModalityFilter] = useState("All Modalities");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<DistributionRecord | null>(null);

  const filteredRecords = distributionHistory.filter((record) => {
    const matchesModality = modalityFilter === "All Modalities" || record.modality === modalityFilter;
    const matchesAction = actionFilter === "All Actions" || record.action === actionFilter;
    const matchesDate = !dateFilter || record.deploymentDate.includes(dateFilter);
    const matchesSearch =
      !searchQuery ||
      record.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesAction && matchesDate && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              FL Training &amp; Distribution
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Create federated learning sessions and track model distributions across institutions
          </p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 px-3 py-1.5 text-xs font-semibold">
          {distributionHistory.length} total records
        </Badge>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat, i) => (
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

      {/* ── Distribution Workflow Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                Distribution Workflow
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="flex items-center justify-between">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={index} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.08, type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center gap-2 group cursor-default"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg ${step.shadow} group-hover:scale-105 transition-transform duration-200`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight max-w-[72px]">
                      {step.label}
                    </p>
                  </motion.div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className="flex items-center mx-3 mb-5">
                      <div className="w-8 h-px bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700" />
                      <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 -ml-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── FL Training Wizard ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <FLTrainingWizard />
      </motion.div>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
          <CardHeader className="pb-3 pt-5 px-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Filter Records
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Modality</label>
                <Select value={modalityFilter} onValueChange={setModalityFilter}>
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modalities.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Hospital, recipient, model…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Distribution History Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 pt-5 px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Distribution History
                </CardTitle>
              </div>
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-xs">
                {filteredRecords.length} records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
                  {["ID", "Hospital", "Recipient", "Model", "Modality", "Action", "Status", "Date", ""].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide py-3 px-4 first:pl-6 last:pr-6">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, i) => {
                  const ac = actionConfig[record.action];
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                    >
                      <TableCell className="pl-6 py-3">
                        <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                          {record.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[130px]">
                            {record.hospital}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[140px]">{record.recipient}</p>
                          <RecipientBadge type={record.recipientType} />
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">
                          {record.model}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          {modalityIcon[record.modality]}
                          {record.modality}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${ac.bg} ${ac.text} ${ac.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ac.dot} flex-shrink-0`} />
                          {record.action}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Success
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{record.deploymentDate}</span>
                      </TableCell>
                      <TableCell className="py-3 pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                          className="h-7 px-2.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No records match your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Package Tracker ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <PackageTracker />
      </motion.div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.93, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-5 flex items-start justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Distribution Details</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{selectedRecord.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Hospital + Model row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-500 dark:text-blue-400 mb-1 font-medium">Hospital</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="font-bold text-blue-900 dark:text-blue-200 text-sm">{selectedRecord.hospital}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-1 font-medium">Model</p>
                    <p className="font-mono font-bold text-indigo-900 dark:text-indigo-200 text-sm">{selectedRecord.model}</p>
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 flex items-center gap-1">{modalityIcon[selectedRecord.modality]} {selectedRecord.modality}</p>
                  </div>
                </div>

                {/* Recipient */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Recipient</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedRecord.recipientType === "doctor" ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" : "bg-gradient-to-br from-violet-400 to-purple-600 text-white"}`}>
                        {selectedRecord.recipient.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedRecord.recipient}</p>
                        <RecipientBadge type={selectedRecord.recipientType} />
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${actionConfig[selectedRecord.action].bg} ${actionConfig[selectedRecord.action].text} ${actionConfig[selectedRecord.action].border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${actionConfig[selectedRecord.action].dot}`} />
                      {selectedRecord.action}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deployed</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{selectedRecord.deploymentDate}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivered</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{selectedRecord.deliveryDate}</p>
                  </div>
                </div>

                {/* Package info */}
                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <p className="text-sm font-semibold text-violet-900 dark:text-violet-300">Package Contents</p>
                    <span className="ml-auto text-xs font-bold text-violet-700 dark:text-violet-400">{selectedRecord.packageSize}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Model weights & architecture", "Training / Inference scripts", "Configuration files", "Documentation & usage guide"].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-400">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Deployment Instructions</p>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">{selectedRecord.instructions}</p>
                </div>
              </div>

              <div className="sticky bottom-0 p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl">
                <Button
                  onClick={() => setSelectedRecord(null)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 font-semibold shadow-lg shadow-blue-500/20"
                >
                  Close Details
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}