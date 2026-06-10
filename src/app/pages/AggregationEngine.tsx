import { useEffect, useState } from "react";
import { 
  Settings, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  Activity, 
  Database, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { toast } from "sonner";

// Types
interface GlobalModel {
  id: string;
  name: string;
  modality: string;
  version: string;
  accuracy: number;
  global_accuracy: number;
  status: string;
  fl_round_id: string;
  aggregated_at: string;
}

interface AggregationConfig {
  id?: string;
  modality: string;
  min_clients: number;
  max_clients: number;
  ssl_weight: number;
  acc_weight: number;
  size_weight: number;
  p60_percentile: number;
  updated_at?: string;
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const defaultConfig = (modality: string): AggregationConfig => ({
  modality: modality,
  min_clients: 3,
  max_clients: 18,
  ssl_weight: 0.5,
  acc_weight: 0.3,
  size_weight: 0.2,
  p60_percentile: 60,
});

export function AggregationEngine() {
  const [selectedModality, setSelectedModality] = useState<string>("");
  const [modalities, setModalities] = useState<{ id: string; name: string; model: string }[]>([]);
  const [trainingRounds, setTrainingRounds] = useState<number>(0);
  const [divergenceHistory, setDivergenceHistory] = useState<{ round: number; divergence: number; updated: boolean }[]>([]);
  const [clientScores, setClientScores] = useState<{ hospital: string; ssl: number; acc: number; size: number; total: number; weight: number }[]>([]);
  const [config, setConfig] = useState<AggregationConfig>(defaultConfig(""));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Loading aggregation engine data...");
      
      const { data: globalModels, error: modelsError } = await supabase
        .from("global_models")
        .select("id, name, modality, version, accuracy, global_accuracy, status, fl_round_id, aggregated_at");

      if (modelsError) throw new Error(`Failed to fetch global models: ${modelsError.message}`);
      console.log("Global models loaded:", globalModels?.length || 0);

      const { data: hospitals, error: hospitalsError } = await supabase
        .from("hospitals")
        .select("id, name");

      if (hospitalsError) throw new Error(`Failed to fetch hospitals: ${hospitalsError.message}`);

      const { data: configs, error: configsError } = await supabase
        .from("aggregation_engine_configs")
        .select("*");

      if (configsError) console.warn("Could not load aggregation configs, using defaults");

      const uniqueModalities = new Map();
      (globalModels || []).forEach((model: any) => {
        const modality = model.modality || "Unknown";
        const id = slugify(modality);
        if (!uniqueModalities.has(id)) {
          uniqueModalities.set(id, {
            id,
            name: modality,
            model: model.name || model.version || "Model",
          });
        }
      });

      const modalitiesList = Array.from(uniqueModalities.values());
      setModalities(modalitiesList);

      if (modalitiesList.length > 0 && !selectedModality) {
        setSelectedModality(modalitiesList[0].id);
      }

      if (selectedModality && configs && configs.length > 0) {
        const modalityName = modalitiesList.find(m => m.id === selectedModality)?.name || selectedModality;
        const selectedConfig = configs?.find((c: any) => c.modality === modalityName);
        if (selectedConfig) {
          setConfig({
            modality: selectedConfig.modality,
            min_clients: selectedConfig.min_clients,
            max_clients: selectedConfig.max_clients,
            ssl_weight: selectedConfig.ssl_weight,
            acc_weight: selectedConfig.acc_weight,
            size_weight: selectedConfig.size_weight,
            p60_percentile: selectedConfig.p60_percentile,
          });
        }
      }

    } catch (error: any) {
      console.error("Failed to load data:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModalityData = async () => {
    if (!selectedModality) return;
    
    const modalityInfo = modalities.find(m => m.id === selectedModality);
    if (!modalityInfo) return;
    
    try {
      const modalityName = modalityInfo.name;
      console.log("Loading modality data for:", modalityName);
      
      const { data: globalModelForModality, error: globalError } = await supabase
        .from("global_models")
        .select("id, fl_round_id, name, modality, accuracy, aggregated_at")
        .eq("modality", modalityName);

      if (globalError) console.error("Error fetching global model:", globalError);

      let relevantRoundIds: string[] = [];
      if (globalModelForModality && globalModelForModality.length > 0) {
        relevantRoundIds = globalModelForModality.map(gm => gm.fl_round_id).filter(Boolean);
      }
      
      let roundsForModality: any[] = [];
      if (relevantRoundIds.length > 0) {
        const { data: rounds, error: roundsError } = await supabase
          .from("fl_rounds")
          .select("*")
          .in("id", relevantRoundIds)
          .order("round_number", { ascending: true });
        
        if (!roundsError && rounds) {
          roundsForModality = rounds;
        }
      }

      const maxRound = roundsForModality.length > 0 
        ? Math.max(...roundsForModality.map(r => r.round_number)) 
        : 0;
      setTrainingRounds(maxRound);

      const history = roundsForModality.map(round => {
        let divergence = 0.5;
        if (round.status === "Deployed") divergence = 0.1;
        else if (round.status === "Running") divergence = 0.25;
        else if (round.status === "pending") divergence = 0.4;
        
        divergence = Math.max(0.05, Math.min(0.5, divergence * (1 - (round.round_number * 0.02))));
        
        return {
          round: round.round_number,
          divergence: Number(divergence.toFixed(3)),
          updated: round.status === "Deployed" || round.status === "Running",
        };
      });

      setDivergenceHistory(history);

      const { data: allWeights, error: weightsError } = await supabase
        .from("local_model_weights")
        .select("id, fl_round_id, hospital_id, accuracy, status, submitted_at");

      if (weightsError) console.error("Error fetching weights:", weightsError);

      const { data: hospitals } = await supabase.from("hospitals").select("id, name");
      const hospitalMap = Object.fromEntries((hospitals || []).map((h: any) => [h.id, h.name]));

      const { data: doctors } = await supabase.from("doctors").select("hospital_id");
      const uniqueHospitalIds = new Set();
      (doctors || []).forEach((d: any) => {
        if (d.hospital_id) uniqueHospitalIds.add(d.hospital_id);
      });

      const scores = Array.from(uniqueHospitalIds).map((hospitalId: any) => {
        const hospitalWeights = (allWeights || []).filter((w: any) => w.hospital_id === hospitalId);
        const avgAccuracy = hospitalWeights.length > 0 
          ? hospitalWeights.reduce((sum, w) => sum + (w.accuracy || 0), 0) / hospitalWeights.length 
          : 50 + Math.random() * 30;
        
        const ssl = Math.min(1, Math.max(0.3, avgAccuracy / 100));
        const acc = Math.min(1, Math.max(0.4, avgAccuracy / 100));
        const size = Math.min(1, Math.max(0.2, (hospitalWeights.length * 0.1)));
        
        const total = (config.ssl_weight * ssl + config.acc_weight * acc + config.size_weight * size);
        
        return {
          hospital: hospitalMap[hospitalId] || "Unknown Hospital",
          ssl: Number(ssl.toFixed(2)),
          acc: Number(acc.toFixed(2)),
          size: Number(size.toFixed(2)),
          total: Number(total.toFixed(3)),
          weight: uniqueHospitalIds.size > 0 ? Number((1 / uniqueHospitalIds.size).toFixed(2)) : 0,
        };
      });

      setClientScores(scores);

    } catch (error) {
      console.error("Failed to load modality data:", error);
      toast.error("Failed to load modality data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedModality && modalities.length > 0) {
      loadModalityData();
    }
  }, [selectedModality, config.ssl_weight, config.acc_weight, config.size_weight]);

  const selectedModalityInfo = modalities.find((m) => m.id === selectedModality);
  
  const sortedDivs = [...divergenceHistory].map(h => h.divergence).sort((a, b) => a - b);
  const pIdx = Math.floor((config.p60_percentile / 100) * sortedDivs.length);
  const deltaThreshold = sortedDivs[Math.min(pIdx, sortedDivs.length - 1)] || 0.3;

  const chartData = divergenceHistory.map(h => ({
    round: h.round,
    divergence: h.divergence,
    threshold: deltaThreshold,
    updated: h.divergence > deltaThreshold,
  }));

  const projectorUpdates = chartData.filter(d => d.updated).length;
  const totalWeight = config.ssl_weight + config.acc_weight + config.size_weight;
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01;

  const updateConfig = (updates: Partial<AggregationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSaveConfig = async () => {
    if (!isWeightValid) {
      toast.error("Weight configuration invalid!", {
        description: `Weights must sum to 1.0. Current total: ${totalWeight.toFixed(2)}`,
      });
      return;
    }

    setIsSaving(true);
    try {
      const configData = {
        modality: selectedModalityInfo?.name || selectedModality,
        min_clients: config.min_clients,
        max_clients: config.max_clients,
        ssl_weight: config.ssl_weight,
        acc_weight: config.acc_weight,
        size_weight: config.size_weight,
        p60_percentile: config.p60_percentile,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("aggregation_engine_configs")
        .upsert(configData, { onConflict: "modality" });

      if (upsertError) throw upsertError;

      toast.success(`${selectedModalityInfo?.name} configuration saved!`, {
        description: `SSL:${config.ssl_weight} Acc:${config.acc_weight} Size:${config.size_weight} | P${config.p60_percentile} threshold`,
      });

    } catch (error: any) {
      console.error("Failed to save config:", error);
      toast.error("Unable to save configuration.", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWeights = () => {
    setConfig(defaultConfig(selectedModalityInfo?.name || selectedModality));
    toast.info(`${selectedModalityInfo?.name} reset to default values`);
  };

  if (isLoading && modalities.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-500">Loading aggregation engine...</p>
        </div>
      </div>
    );
  }

  if (error && modalities.length === 0) {
    return (
      <div className="p-6">
        <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-600 dark:text-red-400 font-semibold">Error Loading Data</p>
            </div>
            <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <Button onClick={loadData} variant="outline" className="rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Aggregation Engine Control Center
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Monitor and control federated aggregation by modality
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="rounded-xl">
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={selectedModality} onValueChange={setSelectedModality}>
              <SelectTrigger className="w-64 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-10">
                <SelectValue placeholder="Select modality" />
              </SelectTrigger>
              <SelectContent>
                {modalities.map((modality) => (
                  <SelectItem key={modality.id} value={modality.id}>
                    {modality.name} - {modality.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedModalityInfo ? (
        <>
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Aggregation Configuration — {selectedModalityInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Round & Client Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Number of Rounds</Label>
                      <Input type="number" value={trainingRounds} className="w-full bg-gray-50 dark:bg-gray-800" readOnly />
                      <p className="text-xs text-gray-500 mt-1">Total FL rounds completed</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Minimum Clients</Label>
                      <Input
                        type="number"
                        value={config.min_clients}
                        onChange={(e) => updateConfig({ min_clients: parseInt(e.target.value) })}
                        className="w-full"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Min hospitals/round</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Maximum Clients</Label>
                    <Input
                      type="number"
                      value={config.max_clients}
                      onChange={(e) => updateConfig({ max_clients: parseInt(e.target.value) })}
                      className="w-full"
                      min={config.min_clients}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max hospitals per round</p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-orange-900 dark:text-orange-300">
                        Projector Update Threshold (P{config.p60_percentile})
                      </Label>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        δ* = {deltaThreshold.toFixed(3)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="80"
                      step="5"
                      value={config.p60_percentile}
                      onChange={(e) => updateConfig({ p60_percentile: parseInt(e.target.value) })}
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 mt-1">
                      <span>P40 — more updates</span>
                      <span>P80 — fewer updates</span>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
                      Projector updates when δ̄(t) &gt; δ* (divergence exceeds threshold)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Aggregation Score Weights</h3>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-purple-900 dark:text-purple-300">SSL Quality Score (w<sub>ssl</sub>)</Label>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{config.ssl_weight.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.ssl_weight}
                      onChange={(e) => updateConfig({ ssl_weight: parseFloat(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Representation quality weight</p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-blue-900 dark:text-blue-300">Accuracy Score (w<sub>acc</sub>)</Label>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{config.acc_weight.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.acc_weight}
                      onChange={(e) => updateConfig({ acc_weight: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Classification performance weight</p>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Dataset Size Score (w<sub>size</sub>)</Label>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{config.size_weight.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.size_weight}
                      onChange={(e) => updateConfig({ size_weight: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-600"
                    />
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Statistical significance weight</p>
                  </div>

                  <div className={`p-3 rounded-lg border ${isWeightValid
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-semibold ${isWeightValid ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>
                        Total Weight:
                      </span>
                      <span className={`text-lg font-bold ${isWeightValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {totalWeight.toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isWeightValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {isWeightValid ? '✓ Weights sum to 1.0' : '✗ Weights must sum to 1.0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSaving || isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl h-11"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
                <Button variant="outline" onClick={handleResetWeights} className="flex-1 rounded-xl h-11">
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Projector Update History — {selectedModalityInfo.name}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {projectorUpdates} updates triggered
                  </Badge>
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                    δ* = {deltaThreshold.toFixed(3)} (P{config.p60_percentile})
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Rounds where δ̄(t) exceeds δ* trigger a global projector update.
              </p>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="round" label={{ value: "Round", position: "insideBottom", offset: -2, fontSize: 12 }} />
                    <YAxis domain={[0, 0.55]} tickFormatter={(v) => v.toFixed(2)} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={deltaThreshold} stroke="#f97316" strokeDasharray="6 3" strokeWidth={2} />
                    <Line type="monotone" dataKey="divergence" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No round data available for {selectedModalityInfo.name}.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                Client Score Breakdown — {selectedModalityInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {clientScores.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={clientScores} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="hospital" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ssl" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="acc" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="size" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3">Hospital</th>
                          <th className="text-center py-2 px-3 text-purple-600">SSL</th>
                          <th className="text-center py-2 px-3 text-blue-600">Accuracy</th>
                          <th className="text-center py-2 px-3 text-emerald-600">Size</th>
                          <th className="text-center py-2 px-3">Total</th>
                          <th className="text-center py-2 px-3">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientScores.map((client, idx) => (
                          <tr key={client.hospital} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 font-medium">{client.hospital}</td>
                            <td className="text-center py-2 px-3 text-purple-700">{client.ssl.toFixed(2)}</td>
                            <td className="text-center py-2 px-3 text-blue-700">{client.acc.toFixed(2)}</td>
                            <td className="text-center py-2 px-3 text-emerald-700">{client.size.toFixed(2)}</td>
                            <td className="text-center py-2 px-3 font-semibold">{client.total.toFixed(3)}</td>
                            <td className="text-center py-2 px-3">{(client.weight * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No client data available.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No modalities found in the database</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}