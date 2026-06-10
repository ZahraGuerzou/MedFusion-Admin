import { useEffect, useState } from "react";
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
  Database,
  Hospital,
  Microscope,
  ScanLine,
  Eye,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
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
import * as Recharts from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const LineChart = Recharts.LineChart as any;
const Line = Recharts.Line as any;
const XAxis = Recharts.XAxis as any;
const YAxis = Recharts.YAxis as any;
const CartesianGrid = Recharts.CartesianGrid as any;
const Tooltip = Recharts.Tooltip as any;
const ResponsiveContainer = Recharts.ResponsiveContainer as any;

// Types - MATCHING YOUR ACTUAL SCHEMA
type RoundStatus = "Idle" | "Running" | "Paused" | "Aggregating" | "Deploying" | "Deployed" | "Stopped" | "Pending";

interface GlobalModel {
  id: string;
  fl_round_id: string;
  name: string | null;
  modality: string | null;
  version: string | null;
  accuracy: number | null;
  global_accuracy: number | null;
  global_f1: number | null;
  global_loss: number | null;
  status: string | null;
  tags: any;
  weights_url: string | null;
  aggregated_at: string | null;
}

interface LocalWeight {
  id: string;
  fl_round_id: string;
  hospital_id: string;
  accuracy: number | null;
  loss: number | null;
  f1_score: number | null;
  precision: number | null;
  recall: number | null;
  auc: number | null;
  status: string;
  submitted_at: string;
  samples?: number;
}

interface ModelRoundData {
  modelId: string;
  modelName: string;
  modality: string;
  version: string;
  currentRound: number;
  status: RoundStatus;
  globalAccuracy: number;
  participants: number;
  hospitals: {
    id: string;
    name: string;
    accuracy: number | null;
    loss: number | null;
    samples: number;
    status: string;
    submitted_at: string | null;
  }[];
  convergenceHistory: { round: number; accuracy: number; date: string }[];
  localWeights: LocalWeight[];
  flRoundId: string | null;
  roundNumber: number;
}

// Status configurations
const statusBadgeConfig: Record<string, string> = {
  Running:     "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Aggregating: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Pending:     "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Paused:      "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  Deploying:   "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  Deployed:    "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  Stopped:     "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  Idle:        "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const getModalityGradient = (modality: string) => {
  const gradients: Record<string, any> = {
    "Brain MRI": { gradient: "from-purple-500 to-violet-600", bg: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20", text: "text-purple-700 dark:text-purple-400", val: "text-purple-900 dark:text-purple-200", shadow: "shadow-purple-500/20", icon: Brain },
    "Chest X-Ray": { gradient: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20", text: "text-blue-700 dark:text-blue-400", val: "text-blue-900 dark:text-blue-200", shadow: "shadow-blue-500/20", icon: ScanLine },
    "Retinal OCT": { gradient: "from-emerald-500 to-teal-600", bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-900/20", text: "text-emerald-700 dark:text-emerald-400", val: "text-emerald-900 dark:text-emerald-200", shadow: "shadow-emerald-500/20", icon: Eye },
    "Skin Lesion": { gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-900/20", text: "text-amber-700 dark:text-amber-400", val: "text-amber-900 dark:text-amber-200", shadow: "shadow-amber-500/20", icon: Microscope },
  };
  return gradients[modality] || { gradient: "from-gray-500 to-gray-600", bg: "from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800", text: "text-gray-700 dark:text-gray-400", val: "text-gray-900 dark:text-gray-200", shadow: "shadow-gray-500/20", icon: FlaskConical };
};

// Confirm Modal Component
function ConfirmModal({ open, title, description, confirmLabel, confirmClass, icon: Icon, onConfirm, onCancel }: any) {
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
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
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
              <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-9 text-sm">Cancel</Button>
              <Button onClick={onConfirm} className={`flex-1 rounded-xl h-9 text-sm font-semibold ${confirmClass}`}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress Overlay
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
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 px-10 py-8 flex flex-col items-center gap-4 min-w-[280px]"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Loader2 className="w-10 h-10 text-purple-500" />
            </motion.div>
            <div className="text-center">
              <p className="font-bold text-gray-900 dark:text-white text-base">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
            </div>
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

// Main Component
export function FLRounds() {
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [globalModels, setGlobalModels] = useState<GlobalModel[]>([]);
  const [modelRoundData, setModelRoundData] = useState<ModelRoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false, action: "", title: "", description: "",
    confirmLabel: "", confirmClass: "", icon: Ban,
  });

  // Load all global models from database
  const loadGlobalModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching global models from Supabase...");
      
      // Use correct column names from your schema
      const { data: models, error: modelsError } = await supabase
        .from("global_models")
        .select("*")
        .order("aggregated_at", { ascending: false }); // Using aggregated_at instead of created_at

      if (modelsError) {
        console.error("Supabase error:", modelsError);
        throw new Error(`Database error: ${modelsError.message}`);
      }

      console.log("Raw models data:", models);
      console.log("Number of models found:", models?.length || 0);

      if (!models || models.length === 0) {
        console.log("No models found in global_models table");
        setGlobalModels([]);
        setError("No models found. Please upload a model from the FL Training & Distribution page first.");
        setIsLoading(false);
        return;
      }

      setGlobalModels(models || []);
      
      // Automatically select the first model if available and no model selected
      if (models && models.length > 0 && !selectedModelId) {
        console.log("Auto-selecting first model:", models[0].name);
        setSelectedModelId(models[0].id);
      }
      
    } catch (error: any) {
      console.error("Failed to load global models:", error);
      setError(error.message || "Failed to load models from database");
      toast.error(error.message || "Failed to load models from database");
    } finally {
      setIsLoading(false);
    }
  };

  // Load round data for selected model
  const loadModelRoundData = async (modelId: string) => {
    const model = globalModels.find(m => m.id === modelId);
    if (!model) {
      console.log("Model not found in globalModels:", modelId);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Loading data for model:", model.name, model.id);
      
      // Find the FL round associated with this model
      let flRoundId = model.fl_round_id;
      let flRound: any = null;
      let roundNumber = 1;
      
      if (flRoundId) {
        const { data: roundData, error: roundError } = await supabase
          .from("fl_rounds")
          .select("*")
          .eq("id", flRoundId)
          .maybeSingle();
        
        if (roundError) {
          console.error("Error fetching FL round:", roundError);
        } else {
          flRound = roundData;
          roundNumber = flRound?.round_number || 1;
          console.log("Found existing FL round:", flRound);
        }
      }

      // If no FL round exists, create one for this model
      if (!flRoundId) {
        console.log("No FL round found, creating one...");
        
        // Get a hospital and AI team member
        const { data: hospitals, error: hospError } = await supabase.from("hospitals").select("id").limit(1);
        const { data: aiTeam, error: aiError } = await supabase.from("ai_team").select("id").limit(1);
        
        console.log("Hospitals found:", hospitals?.length || 0);
        console.log("AI Team found:", aiTeam?.length || 0);
        
        if (hospitals && hospitals.length > 0 && aiTeam && aiTeam.length > 0) {
          const { data: newRound, error: createError } = await supabase
            .from("fl_rounds")
            .insert({
              hospital_id: hospitals[0].id,
              ai_team_id: aiTeam[0].id,
              round_number: 1,
              status: "Idle",
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating FL round:", createError);
          } else if (newRound) {
            flRoundId = newRound.id;
            flRound = newRound;
            roundNumber = 1;
            console.log("Created new FL round:", newRound);
            
            // Update the global model with the FL round ID
            const { error: updateError } = await supabase
              .from("global_models")
              .update({ fl_round_id: flRoundId })
              .eq("id", modelId);
            
            if (updateError) {
              console.error("Error updating global model with fl_round_id:", updateError);
            }
          }
        } else {
          console.log("Missing required data - Hospitals:", hospitals, "AI Team:", aiTeam);
        }
      }

      // Load local model weights for this round
      let localWeights: LocalWeight[] = [];
      if (flRoundId) {
        const { data: weights, error: weightsError } = await supabase
          .from("local_model_weights")
          .select("*")
          .eq("fl_round_id", flRoundId);

        if (weightsError) {
          console.error("Error loading local weights:", weightsError);
        } else {
          localWeights = weights || [];
        }
        console.log("Loaded local weights:", localWeights.length);
      }

      // Load hospitals for displaying names
      const { data: hospitalsList } = await supabase
        .from("hospitals")
        .select("id, name");
      
      const hospitalMap = Object.fromEntries((hospitalsList || []).map((h: any) => [h.id, h.name]));

      // Get all unique hospitals from doctors
      const { data: doctors } = await supabase
        .from("doctors")
        .select("hospital_id");

      const uniqueHospitalIds = new Set();
      (doctors || []).forEach((d: any) => {
        if (d.hospital_id) uniqueHospitalIds.add(d.hospital_id);
      });

      // Also add hospitals that have submitted weights
      localWeights.forEach((w: any) => {
        if (w.hospital_id) uniqueHospitalIds.add(w.hospital_id);
      });

      // Build hospitals list with their submission status
      const hospitals = Array.from(uniqueHospitalIds).map((hospitalId: any) => {
        const weight = localWeights.find((w: any) => w.hospital_id === hospitalId);
        return {
          id: hospitalId,
          name: hospitalMap[hospitalId] || "Unknown Hospital",
          accuracy: weight?.accuracy || null,
          loss: weight?.loss || null,
          samples: weight?.samples || 0,
          status: weight?.status === "completed" ? "Uploaded" : (weight?.status || "Pending"),
          submitted_at: weight?.submitted_at || null,
        };
      });

      // Build convergence history from global models for this FL round
      let convergenceHistory: { round: number; accuracy: number; date: string }[] = [];
      
      if (flRoundId) {
        const { data: globalModelsForRound } = await supabase
          .from("global_models")
          .select("*")
          .eq("fl_round_id", flRoundId)
          .order("aggregated_at", { ascending: true });

        if (globalModelsForRound && globalModelsForRound.length > 0) {
          convergenceHistory = globalModelsForRound.map((gm: any, idx: number) => ({
            round: idx + 1,
            accuracy: gm.global_accuracy || gm.accuracy || 0,
            date: gm.aggregated_at,
          }));
        } else if (localWeights.length > 0) {
          // Calculate average accuracy from local weights
          const completedWeights = localWeights.filter(w => w.status === "completed");
          if (completedWeights.length > 0) {
            const avgAccuracy = completedWeights.reduce((sum, w) => sum + (w.accuracy || 0), 0) / completedWeights.length;
            convergenceHistory = [{
              round: roundNumber,
              accuracy: Number(avgAccuracy.toFixed(2)),
              date: new Date().toISOString(),
            }];
          }
        }
      }

      // If no convergence history, use the model's own accuracy
      if (convergenceHistory.length === 0 && (model.global_accuracy || model.accuracy)) {
        convergenceHistory = [{
          round: 1,
          accuracy: model.global_accuracy || model.accuracy || 0,
          date: model.aggregated_at || new Date().toISOString(),
        }];
      }

      const roundData: ModelRoundData = {
        modelId: model.id,
        modelName: model.name || "Unnamed Model",
        modality: model.modality || "Unknown",
        version: model.version || "v1.0",
        currentRound: roundNumber,
        status: (flRound?.status as RoundStatus) || "Idle",
        globalAccuracy: model.global_accuracy || model.accuracy || 0,
        participants: hospitals.length,
        hospitals: hospitals,
        convergenceHistory: convergenceHistory,
        localWeights: localWeights,
        flRoundId: flRoundId,
        roundNumber: roundNumber,
      };

      console.log("Setting model round data:", roundData);
      setModelRoundData(roundData);

    } catch (error) {
      console.error("Failed to load model round data:", error);
      toast.error("Failed to load model data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of models
  useEffect(() => {
    loadGlobalModels();
  }, []);

  // Load round data when selected model changes
  useEffect(() => {
    if (selectedModelId && globalModels.length > 0) {
      loadModelRoundData(selectedModelId);
    }
  }, [selectedModelId, globalModels]);

  const roundData = modelRoundData;
  const mg = getModalityGradient(roundData?.modality || "Default");
  const currentStatus = roundData?.status || "Idle";
  const ModalityIcon = mg.icon;
  
  const uploadedCount = roundData?.hospitals?.filter(h => h.status === "Uploaded").length || 0;
  const latestAccuracy = roundData?.convergenceHistory?.[roundData.convergenceHistory.length - 1]?.accuracy || roundData?.globalAccuracy || 0;

  // Action Handlers
  const handleStartRound = async () => {
    if (!roundData?.flRoundId) {
      toast.error("No FL round associated with this model");
      return;
    }

    setLoadingAction("starting");
    
    const nextRound = roundData.currentRound + (currentStatus === "Idle" || currentStatus === "Deployed" ? 1 : 0);
    
    const { error } = await supabase
      .from("fl_rounds")
      .update({ 
        status: "Running", 
        round_number: nextRound
      })
      .eq("id", roundData.flRoundId);

    setLoadingAction(null);

    if (error) {
      toast.error("Could not start the round");
      return;
    }

    await loadModelRoundData(selectedModelId);
    toast.success(`Round #${nextRound} started for ${roundData.modelName}`);
  };

  const handlePauseResume = async () => {
    if (!roundData?.flRoundId) return;

    const newStatus = currentStatus === "Paused" ? "Running" : "Paused";
    setLoadingAction(newStatus === "Running" ? "resuming" : "pausing");

    const { error } = await supabase
      .from("fl_rounds")
      .update({ status: newStatus })
      .eq("id", roundData.flRoundId);

    setLoadingAction(null);

    if (error) {
      toast.error(`Could not ${newStatus === "Running" ? "resume" : "pause"} the round`);
      return;
    }

    await loadModelRoundData(selectedModelId);
    toast.success(`Round ${newStatus === "Running" ? "resumed" : "paused"}`);
  };

  const handleStopRound = async () => {
    if (!roundData?.flRoundId) return;

    setLoadingAction("stopping");

    const { error } = await supabase
      .from("fl_rounds")
      .update({ status: "Stopped" })
      .eq("id", roundData.flRoundId);

    setLoadingAction(null);

    if (error) {
      toast.error("Could not stop the round");
      return;
    }

    await loadModelRoundData(selectedModelId);
    toast.success("Round stopped");
  };

  const handleAggregate = async () => {
    if (!roundData?.flRoundId) {
      toast.error("No active round found. Start a round first.");
      return;
    }

    if (currentStatus !== "Running" && currentStatus !== "Paused") {
      toast.warning("Start a round first before aggregating");
      return;
    }

    const completedUploads = roundData.localWeights.filter(w => w.status === "completed");
    
    if (completedUploads.length === 0) {
      toast.warning("No hospitals have uploaded updates yet");
      return;
    }

    setLoadingAction("aggregating");

    try {
      // Update round status
      await supabase
        .from("fl_rounds")
        .update({ status: "Aggregating" })
        .eq("id", roundData.flRoundId);

      // Calculate aggregated metrics
      const avgAccuracy = completedUploads.reduce((sum, w) => sum + (w.accuracy || 0), 0) / completedUploads.length;
      const avgLoss = completedUploads.reduce((sum, w) => sum + (w.loss || 0), 0) / completedUploads.length;
      const avgF1 = completedUploads.reduce((sum, w) => sum + (w.f1_score || 0), 0) / completedUploads.length;
      const avgPrecision = completedUploads.reduce((sum, w) => sum + (w.precision || 0), 0) / completedUploads.length;
      const avgRecall = completedUploads.reduce((sum, w) => sum + (w.recall || 0), 0) / completedUploads.length;
      const avgAuc = completedUploads.reduce((sum, w) => sum + (w.auc || 0), 0) / completedUploads.length;

      // Insert new global model
      const { error: globalError } = await supabase
        .from("global_models")
        .insert({
          fl_round_id: roundData.flRoundId,
          name: `${roundData.modelName} - Round ${roundData.currentRound + 1}`,
          modality: roundData.modality,
          version: `v${roundData.currentRound + 1}`,
          global_accuracy: Number(avgAccuracy.toFixed(2)),
          global_f1: Number(avgF1.toFixed(4)),
          global_loss: Number(avgLoss.toFixed(4)),
          accuracy: Number(avgAccuracy.toFixed(2)),
          status: "active",
          aggregated_at: new Date().toISOString(),
        });

      if (globalError) throw globalError;

      // Update round status
      await supabase
        .from("fl_rounds")
        .update({ 
          status: "Running",
          round_number: roundData.currentRound + 1
        })
        .eq("id", roundData.flRoundId);

      await loadModelRoundData(selectedModelId);
      await loadGlobalModels(); // Refresh global models list
      toast.success(`Aggregated ${completedUploads.length} hospital updates. New accuracy: ${avgAccuracy.toFixed(2)}%`);

    } catch (error) {
      console.error("Aggregation failed:", error);
      toast.error("Failed to aggregate model updates");
      
      await supabase
        .from("fl_rounds")
        .update({ status: "Running" })
        .eq("id", roundData.flRoundId);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeploy = async () => {
    if (!roundData?.flRoundId) return;

    setLoadingAction("deploying");

    try {
      await supabase
        .from("fl_rounds")
        .update({ status: "Deploying" })
        .eq("id", roundData.flRoundId);

      // Get latest global model
      const { data: latestGlobal } = await supabase
        .from("global_models")
        .select("*")
        .eq("fl_round_id", roundData.flRoundId)
        .order("aggregated_at", { ascending: false })
        .limit(1);

      if (latestGlobal && latestGlobal.length > 0) {
        await supabase
          .from("global_models")
          .update({ status: "deployed" })
          .eq("id", latestGlobal[0].id);
      }

      // Create deployment packages for each hospital
      const deploymentPackages = roundData.hospitals.map(hospital => ({
        fl_round_id: roundData.flRoundId,
        hospital_id: hospital.id,
        recipient_name: hospital.name,
        recipient_role: "Doctor",
        model_code: roundData.modelName,
        modality: roundData.modality,
        action: "deployed",
        status: "sent",
        sent_at: new Date().toISOString(),
        package_size_mb: 25,
        instructions: `Deployed global model after round ${roundData.currentRound}`,
      }));

      if (deploymentPackages.length > 0) {
        await supabase.from("model_packages").insert(deploymentPackages);
      }

      await supabase
        .from("fl_rounds")
        .update({ 
          status: "Deployed"
        })
        .eq("id", roundData.flRoundId);

      await loadModelRoundData(selectedModelId);
      toast.success(`Model deployed to ${roundData.hospitals.length} hospitals`);

    } catch (error) {
      console.error("Deployment failed:", error);
      toast.error("Failed to deploy model");
      
      await supabase
        .from("fl_rounds")
        .update({ status: "Running" })
        .eq("id", roundData.flRoundId);
    } finally {
      setLoadingAction(null);
    }
  };

  const confirmStop = () => {
    setConfirmModal({
      open: true, action: "stop",
      title: "Stop Round?",
      description: `This will terminate the current round for ${roundData?.modelName}.`,
      confirmLabel: "Yes, Stop",
      confirmClass: "bg-red-500 hover:bg-red-600 text-white",
      icon: Ban,
    });
  };

  const confirmDeploy = () => {
    setConfirmModal({
      open: true, action: "deploy",
      title: "Deploy Global Model?",
      description: `This will push the aggregated model to all participating hospitals.`,
      confirmLabel: "Deploy Now",
      confirmClass: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white",
      icon: Rocket,
    });
  };

  const onConfirmAction = () => {
    if (confirmModal.action === "stop") handleStopRound();
    if (confirmModal.action === "deploy") handleDeploy();
    setConfirmModal(prev => ({ ...prev, open: false }));
  };

  const isRunning = currentStatus === "Running";
  const isPaused = currentStatus === "Paused";
  const isStopped = currentStatus === "Stopped" || currentStatus === "Idle" || currentStatus === "Pending";
  const isDeployed = currentStatus === "Deployed";
  const isBusy = !!loadingAction || isLoading;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <ProgressOverlay
        active={!!loadingAction}
        label={
          loadingAction === "starting" ? "Starting Round..." :
          loadingAction === "stopping" ? "Stopping Round..." :
          loadingAction === "aggregating" ? "Aggregating Updates..." :
          loadingAction === "deploying" ? "Deploying Model..." :
          loadingAction === "resuming" ? "Resuming Training..." : "Processing..."
        }
        sub={
          loadingAction === "starting" ? `Initialising round for ${roundData?.modelName}` :
          loadingAction === "aggregating" ? `Merging ${uploadedCount} hospital updates` :
          loadingAction === "deploying" ? `Pushing model to ${roundData?.participants} hospitals` :
          "Please wait..."
        }
      />

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        confirmClass={confirmModal.confirmClass}
        icon={confirmModal.icon}
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Model Training Rounds
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Select a model to view its training history and manage aggregation rounds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadGlobalModels} disabled={isBusy} className="rounded-xl">
            <RefreshCw className={`w-4 h-4 mr-1 ${isBusy ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
              <SelectTrigger className="w-80 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-10">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {globalModels.map((model) => {
                  const grad = getModalityGradient(model.modality || "Default");
                  const IconComp = grad.icon;
                  return (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{model.name || "Unnamed"}</span>
                        <Badge variant="outline" className="text-xs ml-2">{model.version || "v1.0"}</Badge>
                        <span className="text-xs text-gray-400 ml-1">{model.modality || "Unknown"}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-6 flex items-center gap-3 justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </CardContent>
        </Card>
      ) : roundData ? (
        <>
          {/* Model Overview Card */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`border border-gray-100 dark:border-gray-800 bg-gradient-to-r ${mg.bg} overflow-hidden`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${mg.gradient} rounded-2xl flex items-center justify-center shadow-lg ${mg.shadow}`}>
                      <ModalityIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${mg.val}`}>{roundData.modelName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{roundData.modality}</Badge>
                        <Badge variant="outline" className="text-xs">{roundData.version}</Badge>
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                          {roundData.globalAccuracy}% accuracy
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-xs ${mg.text} font-medium mb-0.5`}>Status</p>
                      <Badge className={`text-xs font-semibold border ${statusBadgeConfig[currentStatus] || statusBadgeConfig["Idle"]}`}>
                        {(currentStatus === "Aggregating" || currentStatus === "Deploying") ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />
                        )}
                        {currentStatus}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${mg.text} font-medium`}>Global Accuracy</p>
                      <p className={`text-2xl font-bold ${mg.val}`}>{roundData.globalAccuracy}%</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${mg.text} font-medium`}>Current Round</p>
                      <p className={`text-2xl font-bold ${mg.val}`}>#{roundData.currentRound}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Current Round", value: `#${roundData.currentRound}`, icon: Layers },
              { label: "Participating Hospitals", value: String(roundData.participants), icon: Hospital },
              { label: "Uploads Ready", value: `${uploadedCount}/${roundData.hospitals.length}`, icon: CloudUpload },
              { label: "Best Accuracy", value: `${latestAccuracy}%`, icon: TrendingUp },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card className={`border border-gray-100 dark:border-gray-800 bg-gradient-to-br ${mg.bg}`}>
                    <CardContent className="pt-5 pb-4 px-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mg.gradient} flex items-center justify-center shadow-md ${mg.shadow}`}>
                          <StatIcon className="w-5 h-5 text-white" />
                        </div>
                        <ArrowUpRight className={`w-4 h-4 ${mg.text} opacity-50`} />
                      </div>
                      <p className={`text-2xl font-bold ${mg.val} leading-none mb-1`}>{stat.value}</p>
                      <p className={`text-xs font-medium ${mg.text}`}>{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Round Control Buttons */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-gray-100 dark:border-gray-800">
              <CardHeader className="pb-3 pt-5 px-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Round Control — {roundData.modelName}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={isBusy || isRunning}
                    onClick={handleStartRound}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl h-9 px-4 text-sm font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Start Round
                  </Button>

                  <Button
                    variant="outline"
                    disabled={isBusy || (!isRunning && !isPaused)}
                    onClick={handlePauseResume}
                    className="rounded-xl border-yellow-300 text-yellow-700 hover:bg-yellow-50 h-9 px-4 text-sm font-semibold"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5 mr-1.5" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>

                  <Button
                    variant="outline"
                    disabled={isBusy || isStopped}
                    onClick={confirmStop}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-9 px-4 text-sm font-semibold"
                  >
                    <Square className="w-3.5 h-3.5 mr-1.5" />
                    Stop
                  </Button>

                  <Button
                    variant="outline"
                    disabled={isBusy || (!isRunning && !isPaused)}
                    onClick={handleAggregate}
                    className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-9 px-4 text-sm font-semibold"
                  >
                    <GitMerge className="w-3.5 h-3.5 mr-1.5" />
                    Aggregate
                  </Button>

                  <Button
                    variant="outline"
                    disabled={isBusy || isDeployed}
                    onClick={confirmDeploy}
                    className="rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 h-9 px-4 text-sm font-semibold"
                  >
                    {isDeployed ? (
                      <><CheckCheck className="w-3.5 h-3.5 mr-1.5" />Deployed</>
                    ) : (
                      <><Rocket className="w-3.5 h-3.5 mr-1.5" />Deploy Model</>
                    )}
                  </Button>
                </div>
                
                {/* Help text */}
                {roundData.localWeights.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                    ⚡ No local weights found. Hospitals need to upload their trained weights first.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Participating Hospitals Table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 pt-5 px-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <CardTitle className="text-sm font-semibold text-gray-700">Participating Hospitals</CardTitle>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600 text-xs">{roundData.hospitals.length} hospitals</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {roundData.hospitals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/60">
                        <TableHead className="pl-6">Hospital</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Local Accuracy</TableHead>
                        <TableHead>Loss</TableHead>
                        <TableHead>Samples</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roundData.hospitals.map((hospital, idx) => (
                        <TableRow key={idx} className="hover:bg-purple-50/20">
                          <TableCell className="pl-6 font-medium">{hospital.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${
                              hospital.status === "Uploaded" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {hospital.status === "Uploaded" ? "✅ Uploaded" : "⏳ Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>{hospital.accuracy ? `${hospital.accuracy}%` : "—"}</TableCell>
                          <TableCell>{hospital.loss ? hospital.loss.toFixed(4) : "—"}</TableCell>
                          <TableCell>{hospital.samples?.toLocaleString() || "—"}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {hospital.submitted_at ? new Date(hospital.submitted_at).toLocaleDateString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No participating hospitals found. Add doctors to hospitals first.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Convergence Chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl">
              <CardHeader className="pb-3 pt-5 px-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <CardTitle className="text-sm font-semibold text-gray-700">Convergence Progress</CardTitle>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 text-xs">Round {roundData.currentRound}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-5 pt-4">
                {roundData.convergenceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={roundData.convergenceHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                      <XAxis dataKey="round" label={{ value: "Round Number", position: "insideBottom", offset: -10 }} />
                      <YAxis domain={[70, 100]} label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft", offset: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#10b981" 
                        strokeWidth={2.5}
                        dot={{ fill: "#10b981", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Global Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No convergence data yet. Complete an aggregation round to see progress.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No models found in the database</p>
            <p className="text-sm text-gray-400">Go to FL Training & Distribution page to upload or create models first.</p>
          </CardContent>
        </Card>
      )}

      {/* Show count of models */}
      {globalModels.length > 0 && !isLoading && !error && (
        <div className="text-center text-xs text-gray-400">
          {globalModels.length} model(s) available in database
        </div>
      )}
    </div>
  );
}