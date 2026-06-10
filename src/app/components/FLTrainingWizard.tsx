import { useEffect, useState, type ChangeEvent } from "react";
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
  Building2,
  TrendingUp,
  RefreshCw,  // ← Add this line
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent } from "./ui/card";
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
  hospitalId?: string;
  specialization?: string;
  initials: string;
}

const STEPS = [
  { label: "Model", icon: <FlaskConical className="w-4 h-4" /> },
  { label: "Config", icon: <Settings2 className="w-4 h-4" /> },
  { label: "Team", icon: <Users2 className="w-4 h-4" /> },
  { label: "Launch", icon: <Send className="w-4 h-4" /> },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  "Brain MRI": <Brain className="w-6 h-6" />,
  "Chest X-Ray": <ScanLine className="w-6 h-6" />,
  "Retinal OCT": <Eye className="w-6 h-6" />,
  Dermatology: <Microscope className="w-6 h-6" />,
  "Skin Lesion": <Microscope className="w-6 h-6" />,
};

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  "Brain MRI": { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
  "Chest X-Ray": { color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-900/30" },
  "Retinal OCT": { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Dermatology: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  "Skin Lesion": { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
};

function modelToUI(m: any): Model {
  const modality = String(m.modality ?? "Unknown");
  return {
    id: String(m.id),
    name: String(m.name ?? "Unnamed Model"),
    modality,
    accuracy: typeof m.accuracy === "number" ? m.accuracy : typeof m.global_accuracy === "number" ? m.global_accuracy : 0,
    version: String(m.version ?? "v1.0"),
    icon: ICON_MAP[modality] ?? <Brain className="w-6 h-6" />,
    color: COLOR_MAP[modality]?.color ?? "text-violet-600 dark:text-violet-400",
    bg: COLOR_MAP[modality]?.bg ?? "bg-violet-100 dark:bg-violet-900/30",
    tags: Array.isArray(m.tags) ? m.tags : [],
  };
}

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

interface FLTrainingWizardProps {
  onTrainingLaunched?: () => void;
}

export function FLTrainingWizard({ onTrainingLaunched }: FLTrainingWizardProps = {}) {
  const [step, setStep] = useState(0);
  const [uploadMode, setUploadMode] = useState<"existing" | "new">("existing");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [rounds, setRounds] = useState("10");
  const [minClients, setMinClients] = useState("3");
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [databaseHospitals, setDatabaseHospitals] = useState(0);
  const [availableModelCount, setAvailableModelCount] = useState(0);
  const [trainingSuccessRate, setTrainingSuccessRate] = useState("0%");
  const [isLoading, setIsLoading] = useState(true);

  const loadWizardData = async () => {
    setIsLoading(true);
    try {
      const { data: hospitals, error: hospitalsError } = await supabase
        .from("hospitals")
        .select("id, name");

      if (hospitalsError) {
        console.error("Hospitals error:", hospitalsError);
      }

      const hospitalNames = Object.fromEntries(
        (hospitals ?? []).map((h: any) => [h.id, h.name])
      );
      
      console.log("Loaded hospitals:", hospitals?.length || 0);
      setDatabaseHospitals(hospitals?.length || 0);

      const { data: models, error: modelsError } = await supabase
        .from("global_models")
        .select("id, name, modality, version, accuracy, global_accuracy, status, tags");

      if (modelsError) {
        console.error("Models error:", modelsError);
      }

      if (models && models.length > 0) {
        const uniqueStatuses = [...new Set(models.map(m => m.status))];
        console.log("Unique statuses in models:", uniqueStatuses);
        console.log("Total models found:", models.length);
      }

      if (Array.isArray(models) && models.length > 0) {
        const mappedModels: Model[] = models.map(modelToUI);
        setAvailableModels(mappedModels);
        setAvailableModelCount(mappedModels.length);
        console.log("Loaded models:", mappedModels.length);
      } else {
        console.log("No models found in global_models table");
        setAvailableModels([]);
        setAvailableModelCount(0);
      }

      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id, name, hospital_id, specialty");

      if (doctorsError) {
        console.error("Doctors error:", doctorsError);
      }

      const doctorUsers: User[] = Array.isArray(doctors)
        ? doctors.map((d: any) => ({
            id: String(d.id),
            name: String(d.name ?? "Doctor"),
            type: "doctor" as const,
            hospital: hospitalNames[d.hospital_id] ?? "Unknown Hospital",
            hospitalId: d.hospital_id,
            specialization: d.specialty ?? undefined,
            initials: String(d.name ?? "DR")
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          }))
        : [];

      const { data: aiMembers, error: aiError } = await supabase
        .from("ai_team")
        .select("id, name, role, email");

      if (aiError) {
        console.error("AI Team error:", aiError);
      }

      const aiTeamUsers: User[] = Array.isArray(aiMembers)
        ? aiMembers.map((m: any) => ({
            id: String(m.id),
            name: String(m.name ?? "AI Team"),
            type: "ai-team" as const,
            hospital: m.role ?? "AI Team",
            initials: String(m.name ?? "AT")
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          }))
        : [];

      const allUsers = [...doctorUsers, ...aiTeamUsers];
      setAvailableUsers(allUsers);
      console.log("Total available users:", allUsers.length);

      const { count: sessionCount, error: sessionError } = await supabase
        .from("fl_rounds")
        .select("id", { count: "exact", head: true });

      if (sessionError) {
        console.error("Session count error:", sessionError);
      }
      
      setTotalSessions(sessionCount ?? 0);
      
      const { data: packageRows, error: packageError } = await supabase
        .from("model_packages")
        .select("id, status");

      if (packageError) {
        console.error("Package error:", packageError);
      }

      const successPackages = (packageRows ?? []).filter((pkg: any) => {
        const status = String(pkg.status).toLowerCase();
        return status === "success" || status === "sent" || status === "delivered";
      }).length;

      setTrainingSuccessRate(
        packageRows && packageRows.length > 0
          ? `${Math.round((successPackages / packageRows.length) * 100)}%`
          : "0%"
      );
      
      console.log("Data loaded successfully:", {
        hospitals: hospitals?.length,
        models: models?.length,
        doctors: doctors?.length,
        aiMembers: aiMembers?.length,
        flRounds: sessionCount,
        modelPackages: packageRows?.length
      });
      
    } catch (error) {
      console.error("Failed to load FL training wizard data:", error);
      toast.error("Failed to load wizard data from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWizardData();
  }, []);

  const handleModelUploaded = async () => {
    await loadWizardData();
    setUploadMode("existing");
  };

  const handleCreateTraining = async () => {
    try {
      const { data: roundsData, error: roundsError } = await supabase
        .from("fl_rounds")
        .select("round_number")
        .order("round_number", { ascending: false })
        .limit(1);

      if (roundsError) throw roundsError;

      const nextRound = (roundsData?.[0]?.round_number ?? 0) + 1;

      const aiTeamMembers = selectedUsers.filter((u) => u.type === "ai-team");
      const doctorMembers = selectedUsers.filter((u) => u.type === "doctor");

      let insertedRoundId: string | null = null;
      const createdAt = new Date().toISOString();
      const selectedModelName = selectedModel?.name ?? "Federated Model";
      const selectedModalityName = selectedModel?.modality ?? "Unknown";
      const selectedModelVersion = selectedModel?.version ?? "v1.0";

      let hospitalId: string | null = null;
      
      if (doctorMembers.length > 0) {
        const { data: doctorData } = await supabase
          .from("doctors")
          .select("hospital_id")
          .eq("id", doctorMembers[0].id)
          .single();
        hospitalId = doctorData?.hospital_id ?? null;
      }

      if (!hospitalId) {
        const { data: anyHospital } = await supabase
          .from("hospitals")
          .select("id")
          .limit(1);
        hospitalId = anyHospital?.[0]?.id ?? null;
      }

      let aiTeamId: string | null = null;
      if (aiTeamMembers.length > 0) {
        aiTeamId = aiTeamMembers[0].id;
      } else {
        const { data: anyAi } = await supabase
          .from("ai_team")
          .select("id")
          .limit(1);
        aiTeamId = anyAi?.[0]?.id ?? null;
      }

      if (!aiTeamId) {
        toast.error("No AI team member found. Please add one to the database.");
        return;
      }

      if (!hospitalId) {
        toast.error("No hospital found. Please add a hospital to the database.");
        return;
      }

      const { data: flRound, error: insertRoundError } = await supabase
        .from("fl_rounds")
        .insert({
          ai_team_id: aiTeamId,
          hospital_id: hospitalId,
          round_number: nextRound,
          status: "Pending",
          created_at: createdAt,
        })
        .select("id")
        .single();

      if (insertRoundError) throw insertRoundError;
      insertedRoundId = flRound.id;

      if (insertedRoundId) {
        await supabase.from("global_models").insert({
          fl_round_id: insertedRoundId,
          name: selectedModelName,
          modality: selectedModalityName,
          version: selectedModelVersion,
          accuracy: selectedModel?.accuracy ?? 0,
          status: "active",
          created_at: createdAt,
        });

        const doctorHospitalMap: Record<string, string> = {};
        if (doctorMembers.length > 0) {
          const { data: doctorDetails } = await supabase
            .from("doctors")
            .select("id, hospital_id")
            .in("id", doctorMembers.map(d => d.id));
          
          (doctorDetails ?? []).forEach((d: any) => {
            doctorHospitalMap[String(d.id)] = d.hospital_id;
          });
        }

        const packagesToInsert = selectedUsers.map((user) => ({
          fl_round_id: insertedRoundId,
          ai_team_id: aiTeamId,
          hospital_id: user.type === "doctor" 
            ? (doctorHospitalMap[user.id] ?? hospitalId)
            : hospitalId,
          recipient_name: user.name,
          recipient_role: user.type === "doctor" ? "Doctor" : "AI Team",
          model_code: selectedModelName,
          modality: selectedModalityName,
          action: "deployed",
          status: "pending",
          sent_at: createdAt,
          package_size_mb: 12,
          instructions: `Launch round ${nextRound} for ${selectedModelName}`,
        }));

        const { error: pkgError } = await supabase
          .from("model_packages")
          .insert(packagesToInsert);

        if (pkgError) {
          console.error("model_packages insert error:", pkgError);
          throw pkgError;
        }
      }

      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">FL Training Launched!</p>
            <p className="text-sm text-gray-500">
              {selectedModelName} · {rounds} rounds · {selectedUsers.length} participants
            </p>
          </div>
        </div>
      );

      await loadWizardData();

      if (onTrainingLaunched) {
        onTrainingLaunched();
      }

      setTimeout(() => {
        setStep(0);
        setUploadMode("existing");
        setSelectedModel(null);
        setSelectedUsers([]);
        setRounds("10");
        setMinClients("3");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to create FL round:", err);
      toast.error(`Failed to launch training: ${err?.message ?? "Unknown error"}`);
    }
  };

  const toggleUser = (user: User) => {
    setSelectedUsers((prev: User[]) =>
      prev.find((u: User) => u.id === user.id)
        ? prev.filter((u: User) => u.id !== user.id)
        : [...prev, user]
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full"
              />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading wizard data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header with Stats Integrated */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
        </div>
        
        {/* Stats Badges - Integrated into header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">FL Sessions</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{totalSessions}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Dna className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Models</span>
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">{availableModelCount}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Building2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-medium text-violet-700 dark:text-violet-400">Hospitals</span>
            <span className="text-sm font-bold text-violet-800 dark:text-violet-300">{databaseHospitals}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Success</span>
            <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{trainingSuccessRate}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadWizardData}
            className="text-xs rounded-lg border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          
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
                animate={step > idx ? { scale: [1, 1.15, 1] } : { scale: 1 }}
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
                className={`text-xs mt-1.5 font-medium ${
                  step === idx
                    ? "text-blue-600 dark:text-blue-400"
                    : step > idx
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${
                  step > idx ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
        <CardContent className="pt-6 pb-6 px-6">
          <AnimatePresence mode="wait">

            {/* STEP 0: Select Model */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  {(["existing", "new"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setUploadMode(mode)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                        uploadMode === mode
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {mode === "existing" ? (
                        <><Brain className="w-4 h-4" /> Existing Model</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Upload New</>
                      )}
                    </button>
                  ))}
                </div>

                {uploadMode === "existing" ? (
                  <>
                    {availableModels.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                          {availableModels.map((model) => (
                            <motion.div
                              key={model.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedModel(model)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedModel?.id === model.id
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/15 shadow-sm shadow-blue-500/10"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${model.bg} ${model.color} flex-shrink-0`}>
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
                                {model.tags.map((t: string) => (
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
                      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6 text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">No existing models found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No models in your database. Upload a new model to get started.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <ModelUploadZone onModelSaved={handleModelUploaded} />
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 1: Configuration */}
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setRounds(e.target.value)}
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setMinClients(e.target.value)}
                        min="1"
                        max="100"
                        className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
                      />
                      <p className="text-xs text-gray-400">Hospitals per round</p>
                    </div>
                  </div>

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

            {/* STEP 2: Participants */}
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

                {availableUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6 text-center mb-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No doctors or AI team members found in the database.</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-5 max-h-80 overflow-y-auto pr-1">
                    {availableUsers.map((user: User, i: number) => {
                      const isSelected = !!selectedUsers.find((u: User) => u.id === user.id);
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
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
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
                              isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

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

            {/* STEP 3: Review & Launch */}
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

                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Participants</p>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                        {selectedUsers.length} enrolled
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user: User) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              user.type === "doctor" ? "bg-blue-500 text-white" : "bg-violet-500 text-white"
                            }`}
                          >
                            {user.initials[0]}
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {user.name.split(" ")[1] || user.name.split("·")[1]?.trim() || user.name}
                          </span>
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