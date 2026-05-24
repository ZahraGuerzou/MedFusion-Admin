import { useState } from "react";
import {
  FlaskConical,
  Microscope,
  Stethoscope,
  Brain,
  Send,
  CheckCircle2,
  ChevronRight,
  Upload,
  Settings2,
  Users2,
  ClipboardList,
  Dna,
  ScanLine,
  Eye,
  HeartPulse,
  GraduationCap,
  Network,
  Cpu,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ModelUploadZone } from "./ModelUploadZone";

interface Model {
  id: string;
  name: string;
  modality: string;
  accuracy: number;
  version: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  tags: string[];
}

interface User {
  id: string;
  name: string;
  type: "doctor" | "ai-team";
  hospital: string;
  specialization?: string;
  initials: string;
}

const existingModels: Model[] = [
  {
    id: "MRI-EFF-v1.4",
    name: "Brain MRI Model",
    modality: "Brain MRI",
    accuracy: 96.8,
    version: "v1.4",
    icon: <Brain className="w-6 h-6" />,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    tags: ["Tumor", "Lesion", "MS"],
  },
  {
    id: "CXR-RES-v2.1",
    name: "Chest X-Ray Model",
    modality: "Chest X-Ray",
    accuracy: 95.4,
    version: "v2.1",
    icon: <ScanLine className="w-6 h-6" />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
    tags: ["Pneumonia", "COVID-19", "TB"],
  },
  {
    id: "OCT-VIT-v1.2",
    name: "Retinal OCT Model",
    modality: "Retinal OCT",
    accuracy: 94.2,
    version: "v1.2",
    icon: <Eye className="w-6 h-6" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    tags: ["CNV", "DME", "Drusen"],
  },
  {
    id: "SKIN-CONV-v3.0",
    name: "Skin Lesion Model",
    modality: "Dermatology",
    accuracy: 93.6,
    version: "v3.0",
    icon: <Microscope className="w-6 h-6" />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    tags: ["Melanoma", "BCC", "SCC"],
  },
];

const users: User[] = [
  { id: "1", name: "Dr. Ahmed Mohamed", type: "doctor", hospital: "CHU Alger", specialization: "Radiology", initials: "AM" },
  { id: "2", name: "Dr. Sarah Johnson", type: "doctor", hospital: "Mayo Clinic", specialization: "Neurology", initials: "SJ" },
  { id: "3", name: "AI Team · Fatima", type: "ai-team", hospital: "CHU Oran", initials: "FT" },
  { id: "4", name: "AI Team · Youssef", type: "ai-team", hospital: "Hospital Mustapha", initials: "YB" },
  { id: "5", name: "Dr. Chen Wei", type: "doctor", hospital: "Tokyo Medical", specialization: "Cardiology", initials: "CW" },
];

const STEPS = [
  { label: "Model", icon: <FlaskConical className="w-4 h-4" /> },
  { label: "Config", icon: <Settings2 className="w-4 h-4" /> },
  { label: "Team", icon: <Users2 className="w-4 h-4" /> },
  { label: "Launch", icon: <Send className="w-4 h-4" /> },
];

function AccuracyBar({ value }: { value: number }) {
  const color =
    value >= 96 ? "bg-emerald-500" : value >= 94 ? "bg-sky-500" : "bg-amber-500";
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    </div>
  );
}

export function FLTrainingWizard() {
  const [step, setStep] = useState(0);
  const [uploadMode, setUploadMode] = useState<"existing" | "new">("existing");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [rounds, setRounds] = useState("10");
  const [minClients, setMinClients] = useState("3");

  const handleCreateTraining = () => {
    toast.success(
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <BadgeCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">FL Training Launched!</p>
          <p className="text-sm text-gray-500">
            {selectedModel?.name} · {rounds} rounds · {selectedUsers.length} participants
          </p>
        </div>
      </div>
    );
    setTimeout(() => {
      setStep(0);
      setUploadMode("existing");
      setSelectedModel(null);
      setSelectedUsers([]);
      setRounds("10");
      setMinClients("3");
    }, 2000);
  };

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Network className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Federated Learning Wizard
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure &amp; launch distributed AI training
          </p>
        </div>
        <div className="ml-auto">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs font-medium px-2.5">
            Step {step + 1} of {STEPS.length}
          </Badge>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center mb-8 px-1">
        {STEPS.map((s, idx) => (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={
                  step > idx
                    ? { scale: [1, 1.15, 1] }
                    : step === idx
                    ? { scale: 1 }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step > idx
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                    : step === idx
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {step > idx ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className={step === idx ? "text-white" : "text-gray-400 dark:text-gray-500"}>
                    {s.icon}
                  </span>
                )}
                {step === idx && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <span
                className={`text-xs mt-1.5 font-medium transition-colors ${
                  step >= idx ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5">
                <div className="h-px bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: step > idx ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/60 dark:shadow-none bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Model Selection ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <FlaskConical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Select AI Model</h3>
                </div>

                {/* Source toggle */}
                <div className="flex gap-2 mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  {[
                    { key: "existing", label: "Existing Model", icon: <Brain className="w-4 h-4" /> },
                    { key: "new", label: "Upload New", icon: <Upload className="w-4 h-4" /> },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setUploadMode(opt.key as "existing" | "new")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        uploadMode === opt.key
                          ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>

                {uploadMode === "existing" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      {existingModels.map((model, i) => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          onClick={() => setSelectedModel(model)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                            selectedModel?.id === model.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/15 shadow-md shadow-blue-500/10"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                          }`}
                        >
                          {selectedModel?.id === model.id && (
                            <div className="absolute top-3 right-3">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${model.bg} ${model.color}`}>
                              {model.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                                {model.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{model.modality}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {model.tags.map((t) => (
                              <span
                                key={t}
                                className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{model.version}</span>
                            <span className={`font-bold ${model.color}`}>{model.accuracy}%</span>
                          </div>
                          <AccuracyBar value={model.accuracy} />
                        </motion.div>
                      ))}
                    </div>
                    <Button
                      onClick={() => setStep(1)}
                      disabled={!selectedModel}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 font-semibold"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <>
                    <ModelUploadZone />
                    <Button
                      onClick={() => setStep(1)}
                      className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 font-semibold"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                )}
              </motion.div>
            )}

            {/* ── STEP 1: Configuration ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Training Parameters</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rounds" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Training Rounds
                      </Label>
                      <Input
                        id="rounds"
                        type="number"
                        value={rounds}
                        onChange={(e) => setRounds(e.target.value)}
                        min="1"
                        max="100"
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
                      />
                      <p className="text-xs text-gray-400">Global aggregation cycles</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="min-clients" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Min. Clients / Round
                      </Label>
                      <Input
                        id="min-clients"
                        type="number"
                        value={minClients}
                        onChange={(e) => setMinClients(e.target.value)}
                        min="1"
                        max="100"
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
                      />
                      <p className="text-xs text-gray-400">Hospitals per round</p>
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Training Overview</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Model", value: selectedModel?.name?.split(" ")[0] || "Custom", sub: selectedModel?.version || "—" },
                        { label: "Rounds", value: rounds, sub: "iterations" },
                        { label: "Min Clients", value: minClients, sub: "hospitals" },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="text-lg font-bold text-blue-800 dark:text-blue-200 leading-tight">{item.value}</p>
                          <p className="text-xs text-blue-500 dark:text-blue-400">{item.sub}</p>
                          <p className="text-xs text-blue-400 dark:text-blue-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      All local model updates are aggregated centrally using FedAvg. Patient data never leaves participating institutions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-xl h-11 border-gray-200 dark:border-gray-700">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 font-semibold"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Participants ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Select Participants</h3>
                  </div>
                  {selectedUsers.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                      {selectedUsers.length} selected
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-5 max-h-80 overflow-y-auto pr-1">
                  {users.map((user, i) => {
                    const isSelected = !!selectedUsers.find((u) => u.id === user.id);
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => toggleUser(user)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/15 shadow-sm shadow-blue-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            user.type === "doctor"
                              ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                              : "bg-gradient-to-br from-violet-400 to-purple-600 text-white"
                          }`}
                        >
                          {user.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                                user.type === "doctor"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                              }`}
                            >
                              {user.type === "ai-team" ? (
                                <span className="flex items-center gap-1"><Dna className="w-3 h-3" /> AI Team</span>
                              ) : (
                                <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Doctor</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400 truncate">{user.hospital}</span>
                            {user.specialization && (
                              <span className="text-xs text-gray-400">· {user.specialization}</span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-11 border-gray-200 dark:border-gray-700">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedUsers.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 font-semibold"
                  >
                    Review <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Review & Launch ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Review &amp; Launch</h3>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Model summary */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {selectedModel && (
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selectedModel.bg} ${selectedModel.color} flex-shrink-0`}>
                        {selectedModel.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">AI Model</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {selectedModel?.name || "Custom uploaded model"}
                      </p>
                      {selectedModel && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {selectedModel.modality} · {selectedModel.version}
                        </p>
                      )}
                    </div>
                    {selectedModel && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedModel.accuracy}%</p>
                        <p className="text-xs text-gray-400">accuracy</p>
                      </div>
                    )}
                  </div>

                  {/* FL config */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Rounds", value: rounds, icon: <HeartPulse className="w-4 h-4" />, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
                      { label: "Min Clients", value: minClients, icon: <Network className="w-4 h-4" />, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl ${item.bg} border border-gray-100 dark:border-gray-700/50`}>
                        <div className={`${item.color}`}>{item.icon}</div>
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{item.value}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Participants */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Participants</p>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                        {selectedUsers.length} enrolled
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              user.type === "doctor"
                                ? "bg-blue-500 text-white"
                                : "bg-violet-500 text-white"
                            }`}
                          >
                            {user.initials[0]}
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{user.name.split(" ")[1] || user.name.split("·")[1]?.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl h-11 border-gray-200 dark:border-gray-700">
                    Back
                  </Button>
                  <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleCreateTraining}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 rounded-xl h-11 font-semibold"
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Launch FL Training
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}