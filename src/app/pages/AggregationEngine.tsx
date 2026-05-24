import { useState } from "react";
import { Settings, CheckCircle2, Filter, RefreshCw, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Cell
} from "recharts";
import { toast } from "sonner";

const modalities = [
  { id: "brain-mri",    name: "Brain MRI",    model: "EfficientNetV2" },
  { id: "chest-xray",   name: "Chest X-Ray",  model: "ResNet18" },
  { id: "retinal-oct",  name: "Retinal OCT",  model: "ViT" },
  { id: "skin-lesion",  name: "Skin Lesion",  model: "ConvNeXt" },
];

const trainingRounds: Record<string, number> = {
  "brain-mri": 9, "chest-xray": 8, "retinal-oct": 12, "skin-lesion": 7,
};

// Mock divergence history per modality (round, avgDivergence)
const divergenceHistory: Record<string, { round: number; divergence: number; updated: boolean }[]> = {
  "brain-mri": [
    { round: 1, divergence: 0.38, updated: true  },
    { round: 2, divergence: 0.31, updated: false },
    { round: 3, divergence: 0.29, updated: false },
    { round: 4, divergence: 0.26, updated: false },
    { round: 5, divergence: 0.33, updated: true  },
    { round: 6, divergence: 0.22, updated: false },
    { round: 7, divergence: 0.19, updated: false },
    { round: 8, divergence: 0.24, updated: true  },
    { round: 9, divergence: 0.12, updated: false },
  ],
  "chest-xray": [
    { round: 1, divergence: 0.42, updated: true  },
    { round: 2, divergence: 0.35, updated: true  },
    { round: 3, divergence: 0.28, updated: false },
    { round: 4, divergence: 0.30, updated: true  },
    { round: 5, divergence: 0.21, updated: false },
    { round: 6, divergence: 0.18, updated: false },
    { round: 7, divergence: 0.20, updated: false },
    { round: 8, divergence: 0.15, updated: false },
  ],
  "retinal-oct": [
    { round: 1,  divergence: 0.45, updated: true  },
    { round: 2,  divergence: 0.40, updated: true  },
    { round: 3,  divergence: 0.36, updated: true  },
    { round: 4,  divergence: 0.30, updated: false },
    { round: 5,  divergence: 0.27, updated: false },
    { round: 6,  divergence: 0.31, updated: true  },
    { round: 7,  divergence: 0.23, updated: false },
    { round: 8,  divergence: 0.19, updated: false },
    { round: 9,  divergence: 0.22, updated: false },
    { round: 10, divergence: 0.16, updated: false },
    { round: 11, divergence: 0.13, updated: false },
    { round: 12, divergence: 0.10, updated: false },
  ],
  "skin-lesion": [
    { round: 1, divergence: 0.36, updated: true  },
    { round: 2, divergence: 0.28, updated: false },
    { round: 3, divergence: 0.32, updated: true  },
    { round: 4, divergence: 0.25, updated: false },
    { round: 5, divergence: 0.20, updated: false },
    { round: 6, divergence: 0.18, updated: false },
    { round: 7, divergence: 0.14, updated: false },
  ],
};

// Mock client scores per modality
const clientScores: Record<string, { hospital: string; ssl: number; acc: number; size: number; total: number; weight: number }[]> = {
  "brain-mri": [
    { hospital: "CHU Alger",       ssl: 0.82, acc: 0.91, size: 0.88, total: 0.868, weight: 0.31 },
    { hospital: "CHU Oran",        ssl: 0.74, acc: 0.87, size: 0.75, total: 0.775, weight: 0.24 },
    { hospital: "Hosp. Mustapha",  ssl: 0.68, acc: 0.83, size: 0.92, total: 0.762, weight: 0.23 },
    { hospital: "Mayo Clinic",     ssl: 0.55, acc: 0.79, size: 0.61, total: 0.632, weight: 0.13 },
    { hospital: "Tokyo Medical",   ssl: 0.48, acc: 0.76, size: 0.54, total: 0.574, weight: 0.09 },
  ],
  "chest-xray": [
    { hospital: "CHU Alger",       ssl: 0.79, acc: 0.88, size: 0.84, total: 0.832, weight: 0.29 },
    { hospital: "CHU Oran",        ssl: 0.71, acc: 0.85, size: 0.79, total: 0.772, weight: 0.25 },
    { hospital: "Hosp. Mustapha",  ssl: 0.65, acc: 0.80, size: 0.90, total: 0.748, weight: 0.23 },
    { hospital: "Mayo Clinic",     ssl: 0.58, acc: 0.77, size: 0.65, total: 0.648, weight: 0.15 },
    { hospital: "Tokyo Medical",   ssl: 0.42, acc: 0.72, size: 0.50, total: 0.540, weight: 0.08 },
  ],
  "retinal-oct": [
    { hospital: "CHU Alger",       ssl: 0.85, acc: 0.93, size: 0.80, total: 0.870, weight: 0.33 },
    { hospital: "CHU Oran",        ssl: 0.76, acc: 0.89, size: 0.72, total: 0.790, weight: 0.26 },
    { hospital: "Hosp. Mustapha",  ssl: 0.63, acc: 0.81, size: 0.88, total: 0.748, weight: 0.22 },
    { hospital: "Mayo Clinic",     ssl: 0.52, acc: 0.75, size: 0.60, total: 0.622, weight: 0.12 },
    { hospital: "Tokyo Medical",   ssl: 0.44, acc: 0.70, size: 0.48, total: 0.554, weight: 0.07 },
  ],
  "skin-lesion": [
    { hospital: "CHU Alger",       ssl: 0.80, acc: 0.90, size: 0.85, total: 0.850, weight: 0.30 },
    { hospital: "CHU Oran",        ssl: 0.72, acc: 0.86, size: 0.76, total: 0.778, weight: 0.25 },
    { hospital: "Hosp. Mustapha",  ssl: 0.66, acc: 0.82, size: 0.91, total: 0.758, weight: 0.23 },
    { hospital: "Mayo Clinic",     ssl: 0.56, acc: 0.78, size: 0.62, total: 0.638, weight: 0.14 },
    { hospital: "Tokyo Medical",   ssl: 0.46, acc: 0.74, size: 0.52, total: 0.564, weight: 0.08 },
  ],
};

const BAR_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

interface ModalityConfig {
  minClients: string;
  maxClients: string;
  sslWeight: number;
  accWeight: number;
  sizeWeight: number;
  p60Percentile: number;
}

const defaultConfig = (): ModalityConfig => ({
  minClients: "3",
  maxClients: "18",
  sslWeight: 0.5,
  accWeight: 0.3,
  sizeWeight: 0.2,
  p60Percentile: 60,
});

const initialConfigs: Record<string, ModalityConfig> = {
  "brain-mri":   defaultConfig(),
  "chest-xray":  defaultConfig(),
  "retinal-oct": defaultConfig(),
  "skin-lesion": defaultConfig(),
};

// Custom tooltip for divergence chart
const DivergenceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const updated = divergenceHistory["brain-mri"].find(d => d.round === label)?.updated;
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm">
        <p className="text-white font-semibold mb-1">Round {label}</p>
        <p className="text-emerald-400">δ̄ = {payload[0]?.value?.toFixed(3)}</p>
        {payload[1] && <p className="text-orange-400">δ* = {payload[1]?.value?.toFixed(3)}</p>}
      </div>
    );
  }
  return null;
};

export function AggregationEngine() {
  const [selectedModality, setSelectedModality] = useState("brain-mri");
  const [configs, setConfigs] = useState<Record<string, ModalityConfig>>(initialConfigs);

  const cfg = configs[selectedModality];
  const selectedModalityInfo = modalities.find((m) => m.id === selectedModality)!;
  const history = divergenceHistory[selectedModality];
  const clients = clientScores[selectedModality];

  // Compute δ* from percentile setting
  const sortedDivs = [...history].map(h => h.divergence).sort((a, b) => a - b);
  const pIdx = Math.floor((cfg.p60Percentile / 100) * sortedDivs.length);
  const deltaThreshold = sortedDivs[Math.min(pIdx, sortedDivs.length - 1)];

  // Chart data: add threshold line
  const chartData = history.map(h => ({
    round: h.round,
    divergence: h.divergence,
    threshold: deltaThreshold,
    updated: h.divergence > deltaThreshold,
  }));

  const projectorUpdates = chartData.filter(d => d.updated).length;

  const updateCfg = (patch: Partial<ModalityConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [selectedModality]: { ...prev[selectedModality], ...patch },
    }));
  };

  const totalWeight = cfg.sslWeight + cfg.accWeight + cfg.sizeWeight;
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.01;

  const handleSaveConfig = () => {
    if (!isWeightValid) {
      toast.error("Weight configuration invalid!", {
        description: `Weights must sum to 1.0. Current total: ${totalWeight.toFixed(2)}`,
      });
      return;
    }
    toast.success(`${selectedModalityInfo.name} configuration saved!`, {
      description: `SSL:${cfg.sslWeight} Acc:${cfg.accWeight} Size:${cfg.sizeWeight} | P${cfg.p60Percentile} threshold`,
    });
  };

  const handleResetWeights = () => {
    updateCfg(defaultConfig());
    toast.info(`${selectedModalityInfo.name} reset to default values`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aggregation Engine Control Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and control federated aggregation by modality</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={selectedModality} onValueChange={setSelectedModality}>
            <SelectTrigger className="w-56 bg-white dark:bg-gray-900">
              <SelectValue />
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

      {/* ── Config Card ── */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Aggregation Configuration — {selectedModalityInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Round & Client + P60 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Round & Client Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rounds" className="text-sm font-medium mb-2 block">Number of Rounds</Label>
                  <Input id="rounds" type="number" value={trainingRounds[selectedModality]} className="w-full" min="1" readOnly />
                  <p className="text-xs text-gray-500 mt-1">Total FL rounds</p>
                </div>
                <div>
                  <Label htmlFor="min-clients" className="text-sm font-medium mb-2 block">Minimum Clients</Label>
                  <Input
                    id="min-clients" type="number" value={cfg.minClients}
                    onChange={(e) => updateCfg({ minClients: e.target.value })}
                    className="w-full" min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min hospitals/round</p>
                </div>
              </div>
              <div>
                <Label htmlFor="max-clients" className="text-sm font-medium mb-2 block">Maximum Clients</Label>
                <Input
                  id="max-clients" type="number" value={cfg.maxClients}
                  onChange={(e) => updateCfg({ maxClients: e.target.value })}
                  className="w-full" min={cfg.minClients}
                />
                <p className="text-xs text-gray-500 mt-1">Max hospitals per round</p>
              </div>

              {/* P60 Divergence Threshold */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium text-orange-900 dark:text-orange-300">
                    Projector Update Threshold (P<sub>{cfg.p60Percentile}</sub>)
                  </Label>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    δ* = {deltaThreshold.toFixed(3)}
                  </span>
                </div>
                <input
                  type="range" min="40" max="80" step="5"
                  value={cfg.p60Percentile}
                  onChange={(e) => updateCfg({ p60Percentile: parseInt(e.target.value) })}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 mt-1">
                  <span>P40 — more updates</span>
                  <span>P80 — fewer updates</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
                  Projector updates when δ̄(t) &gt; δ*  
                </p>
              </div>
            </div>

            {/* Right: Weights */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Aggregation Score Weights</h3>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium text-purple-900 dark:text-purple-300">SSL Quality Score (w<sub>ssl</sub>)</Label>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{cfg.sslWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={cfg.sslWeight}
                  onChange={(e) => updateCfg({ sslWeight: parseFloat(e.target.value) })}
                  className="w-full accent-purple-600" />
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Representation quality weight</p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium text-blue-900 dark:text-blue-300">Accuracy Score (w<sub>acc</sub>)</Label>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{cfg.accWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={cfg.accWeight}
                  onChange={(e) => updateCfg({ accWeight: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600" />
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Classification performance weight</p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Dataset Size Score (w<sub>size</sub>)</Label>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{cfg.sizeWeight.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={cfg.sizeWeight}
                  onChange={(e) => updateCfg({ sizeWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Statistical significance weight</p>
              </div>

              <div className={`p-3 rounded-lg border ${isWeightValid
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-semibold ${isWeightValid ? 'text-emerald-900 dark:text-emerald-300' : 'text-red-900 dark:text-red-300'}`}>Total Weight:</span>
                  <span className={`text-lg font-bold ${isWeightValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{totalWeight.toFixed(2)}</span>
                </div>
                <p className={`text-xs mt-1 ${isWeightValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {isWeightValid ? '✓ Weights sum to 1.0' : '✗ Weights must sum to 1.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleSaveConfig} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleResetWeights}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Projector Update History Chart ── */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
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
                δ* = {deltaThreshold.toFixed(3)} (P{cfg.p60Percentile})
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Rounds where δ̄(t) exceeds δ* trigger a global projector update. Adjust the P threshold above to see the impact.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="round" label={{ value: "Round", position: "insideBottom", offset: -2, fontSize: 12 }} />
              <YAxis domain={[0, 0.55]} tickFormatter={(v) => v.toFixed(2)} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgb(31 41 55)", border: "1px solid rgb(75 85 99)", borderRadius: "0.5rem" }}
                formatter={(value: number, name: string) => [value.toFixed(3), name === "divergence" ? "δ̄(t)" : "δ* threshold"]}
                labelFormatter={(label) => `Round ${label}`}
              />
              <Legend formatter={(value) => value === "divergence" ? "Avg Client Divergence δ̄(t)" : `δ* Threshold (P${cfg.p60Percentile})`} />
              {/* Highlight updated rounds */}
              {chartData.filter(d => d.updated).map(d => (
                <ReferenceLine key={d.round} x={d.round} stroke="#f97316" strokeDasharray="4 2" strokeWidth={1.5} />
              ))}
              <ReferenceLine y={deltaThreshold} stroke="#f97316" strokeDasharray="6 3" strokeWidth={2} />
              <Line type="monotone" dataKey="divergence" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="threshold" stroke="#f97316" strokeWidth={0} dot={false} legendType="line" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Orange dashed vertical lines = rounds where projector was updated · Orange horizontal line = current δ* threshold
          </p>
        </CardContent>
      </Card>

      {/* ── Client Score Breakdown ── */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Client Score Breakdown — {selectedModalityInfo.name}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Per-hospital aggregation scores: s<sub>i</sub> = w<sub>ssl</sub>·Q̃<sub>i</sub> + w<sub>acc</sub>·ã<sub>i</sub> + w<sub>size</sub>·ñ<sub>i</sub>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grouped bar chart */}
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={clients} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="hospital" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgb(31 41 55)", border: "1px solid rgb(75 85 99)", borderRadius: "0.5rem" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { ssl: "SSL Q̃ᵢ", acc: "Accuracy ãᵢ", size: "Dataset ñᵢ" };
                  return [value.toFixed(3), labels[name] ?? name];
                }}
              />
              <Legend formatter={(v) => ({ ssl: "SSL Score Q̃ᵢ", acc: "Accuracy ãᵢ", size: "Dataset Size ñᵢ" }[v] ?? v)} />
              <Bar dataKey="ssl"  fill="#8b5cf6" radius={[3,3,0,0]} />
              <Bar dataKey="acc"  fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="size" fill="#10b981" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Hospital</th>
                  <th className="text-center py-2 px-3 text-purple-600 dark:text-purple-400 font-medium">Q̃ᵢ (SSL)</th>
                  <th className="text-center py-2 px-3 text-blue-600 dark:text-blue-400 font-medium">ãᵢ (Acc)</th>
                  <th className="text-center py-2 px-3 text-emerald-600 dark:text-emerald-400 font-medium">ñᵢ (Size)</th>
                  <th className="text-center py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">sᵢ (Total)</th>
                  <th className="text-center py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">wᵢ (Weight)</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, idx) => (
                  <tr key={client.hospital} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: BAR_COLORS[idx] }} />
                      {client.hospital}
                    </td>
                    <td className="text-center py-2 px-3 text-purple-700 dark:text-purple-400">{client.ssl.toFixed(2)}</td>
                    <td className="text-center py-2 px-3 text-blue-700 dark:text-blue-400">{client.acc.toFixed(2)}</td>
                    <td className="text-center py-2 px-3 text-emerald-700 dark:text-emerald-400">{client.size.toFixed(2)}</td>
                    <td className="text-center py-2 px-3 font-semibold text-gray-900 dark:text-white">{client.total.toFixed(3)}</td>
                    <td className="text-center py-2 px-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${client.weight * 100}%` }} />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{(client.weight * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}