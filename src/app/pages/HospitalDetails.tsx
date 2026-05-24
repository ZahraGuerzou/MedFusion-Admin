import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Calendar, CreditCard, Users, Activity, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const participationData = [
  { round: 1, participation: 45 },
  { round: 3, participation: 62 },
  { round: 5, participation: 71 },
  { round: 7, participation: 78 },
  { round: 9, participation: 85 },
  { round: 11, participation: 89 },
  { round: 13, participation: 92 },
  { round: 15, participation: 94 },
];

const assignedModels = [
  { id: "MRI-EFF-v1.4", modality: "Brain MRI", architecture: "EfficientNetV2", version: "v1.4", status: "Active" },
  { id: "CXR-RES-v2.1", modality: "Chest X-Ray", architecture: "ResNet50", version: "v2.1", status: "Active" },
  { id: "CT-DENSE-v1.0", modality: "CT Scan", architecture: "DenseNet121", version: "v1.0", status: "Training" },
];

export function HospitalDetails() {
  const { id } = useParams();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/hospitals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CHU Alger</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Hospital Details & Performance</p>
        </div>
        <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
          Premium Plan
        </Badge>
      </div>

      {/* General Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                <p className="font-semibold text-gray-900 dark:text-white">Algeria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registered</p>
                <p className="font-semibold text-gray-900 dark:text-white">Jan 2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">16 Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Participation</p>
                <p className="font-semibold text-gray-900 dark:text-white">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Information */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Doctors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">AI Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Researchers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participation Statistics */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Participation Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="round" stroke="#9ca3af" label={{ value: 'FL Round', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#9ca3af" label={{ value: 'Participation %', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line type="monotone" dataKey="participation" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Assigned Models */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Assigned Models ({assignedModels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedModels.map((model) => (
              <Card key={model.id} className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                      {model.status}
                    </Badge>
                  </div>
                  <h3 className="font-mono font-bold text-gray-900 dark:text-white mb-1">{model.id}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{model.modality}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-500 dark:text-gray-400">Architecture: {model.architecture}</p>
                    <p className="text-gray-500 dark:text-gray-400">Version: {model.version}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
