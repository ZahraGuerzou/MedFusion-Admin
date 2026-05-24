import { useState } from "react";
import { Upload, Check, X, Download, Trash2, PlayCircle, Eye } from "lucide-react";
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
import { ModelUploadZone } from "../components/ModelUploadZone";
import { ModelComparison } from "../components/ModelComparison";
import { toast } from "sonner";

const models = [
  { 
    id: "MRI-EFF-v1.4", 
    modality: "Brain MRI", 
    backbone: "EfficientNetV2", 
    version: "v1.4", 
    status: "Clinical Approved",
    hospitals: 8,
    lastUpdate: "2 days ago"
  },
  { 
    id: "CXR-RES-v2.1", 
    modality: "Chest X-Ray", 
    backbone: "ResNet50", 
    version: "v2.1", 
    status: "Clinical Approved",
    hospitals: 12,
    lastUpdate: "5 days ago"
  },
  { 
    id: "CT-DENSE-v1.0", 
    modality: "CT Scan", 
    backbone: "DenseNet121", 
    version: "v1.0", 
    status: "Validation",
    hospitals: 5,
    lastUpdate: "1 week ago"
  },
  { 
    id: "PATH-VIT-v3.2", 
    modality: "Pathology", 
    backbone: "Vision Transformer", 
    version: "v3.2", 
    status: "Experimental",
    hospitals: 2,
    lastUpdate: "3 days ago"
  },
];

const statusColors = {
  "Experimental": "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  "Validation": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  "Clinical Approved": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "Deprecated": "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export function FederatedModels() {
  const [selectedModel, setSelectedModel] = useState<typeof models[0] | null>(null);

  const handleValidate = (modelId: string) => {
    toast.success(`Model ${modelId} validated successfully!`);
  };

  const handleDeploy = (modelId: string) => {
    toast.info(`Deploying ${modelId} to hospitals...`);
  };

  const handleDelete = (modelId: string) => {
    toast.error(`Model ${modelId} marked for deletion`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Federated Models</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Central model registry and management</p>
      </div>

      {/* Upload Section */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Upload Federated Model</CardTitle>
        </CardHeader>
        <CardContent>
          <ModelUploadZone />
        </CardContent>
      </Card>

      {/* Extracted Model Information */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Latest Upload - Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Model ID</p>
              <p className="font-mono font-semibold text-gray-900 dark:text-white">MRI-EFF-v1.4</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Modality</p>
              <p className="font-semibold text-gray-900 dark:text-white">Brain MRI</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Backbone</p>
              <p className="font-semibold text-gray-900 dark:text-white">EfficientNetV2</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Version</p>
              <p className="font-semibold text-gray-900 dark:text-white">v1.4</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Aggregation Method</p>
              <p className="font-semibold text-gray-900 dark:text-white">SSL Adaptive</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Explainability</p>
              <p className="font-semibold text-gray-900 dark:text-white">Grad-CAM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Registry */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Model Registry ({models.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model ID</TableHead>
                <TableHead>Modality</TableHead>
                <TableHead>Backbone</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hospitals</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-mono font-medium">{model.id}</TableCell>
                  <TableCell>{model.modality}</TableCell>
                  <TableCell>{model.backbone}</TableCell>
                  <TableCell>{model.version}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[model.status as keyof typeof statusColors]}>
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{model.hospitals}</TableCell>
                  <TableCell className="text-gray-500">{model.lastUpdate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidate(model.id)}
                      >
                        <Check className="w-4 h-4 mr-1 text-emerald-600" />
                        Validate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeploy(model.id)}
                      >
                        <PlayCircle className="w-4 h-4 mr-1 text-blue-600" />
                        Deploy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(model.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Model Comparison */}
      <ModelComparison />
    </div>
  );
}
