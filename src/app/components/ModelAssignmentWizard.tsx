import { useState } from "react";
import { Brain, Users, UserCheck, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
  modality: string;
  accuracy: number;
  version: string;
}

interface User {
  id: string;
  name: string;
  type: "doctor" | "ai-team";
  hospital: string;
  specialization?: string;
}

const models: Model[] = [
  { id: "MRI-EFF-v1.4", name: "Brain MRI Model", modality: "Brain MRI", accuracy: 96.8, version: "v1.4" },
  { id: "CXR-RES-v2.1", name: "Chest X-Ray Model", modality: "Chest X-Ray", accuracy: 95.4, version: "v2.1" },
  { id: "OCT-VIT-v1.2", name: "Retinal OCT Model", modality: "Retinal OCT", accuracy: 94.2, version: "v1.2" },
  { id: "SKIN-CONV-v3.0", name: "Skin Lesion Model", modality: "Skin Lesion", accuracy: 93.6, version: "v3.0" },
];

const users: User[] = [
  { id: "1", name: "Dr. Ahmed Mohamed", type: "doctor", hospital: "CHU Alger", specialization: "Radiology" },
  { id: "2", name: "Dr. Sarah Johnson", type: "doctor", hospital: "Mayo Clinic", specialization: "Neurology" },
  { id: "3", name: "AI Team - Fatima", type: "ai-team", hospital: "CHU Oran" },
  { id: "4", name: "AI Team - Youssef", type: "ai-team", hospital: "Hospital Mustapha" },
  { id: "5", name: "Dr. Chen Wei", type: "doctor", hospital: "Tokyo Medical", specialization: "Cardiology" },
];

export function ModelAssignmentWizard() {
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleAssign = () => {
    toast.success(
      <div>
        <p className="font-semibold">Model Assigned Successfully!</p>
        <p className="text-sm">
          {selectedModel?.name} sent to {selectedUsers.length} user(s)
        </p>
      </div>
    );

    // Reset wizard
    setTimeout(() => {
      setStep(1);
      setSelectedModel(null);
      setSelectedUsers([]);
    }, 2000);
  };

  const toggleUser = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Send className="w-5 h-5" />
          Model Assignment Wizard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1 ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : "1"}
              </div>
              <p className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300">Select Model</p>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400" />

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2
                    ? "bg-emerald-500 text-white"
                    : step === 2
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {step > 2 ? <CheckCircle2 className="w-6 h-6" /> : "2"}
              </div>
              <p className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300">Select Users</p>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-400" />

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === 3 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                3
              </div>
              <p className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300">Confirm & Send</p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Model */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Choose a model to assign</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {models.map((model) => (
                <motion.div
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel?.id === model.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                    </div>
                    {selectedModel?.id === model.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.modality}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {model.version}
                    </Badge>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {model.accuracy}% accuracy
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button onClick={() => setStep(2)} disabled={!selectedModel} className="w-full">
              Next: Select Users
            </Button>
          </motion.div>
        )}

        {/* Step 2: Select Users */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Select users to receive {selectedModel?.name}
            </h3>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => toggleUser(user)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedUsers.find((u) => u.id === user.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.type === "doctor"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-purple-100 dark:bg-purple-900/30"
                        }`}
                      >
                        {user.type === "doctor" ? (
                          <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {user.type === "ai-team" ? "AI Team" : user.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{user.hospital}</span>
                        </div>
                        {user.specialization && (
                          <p className="text-xs text-gray-500 mt-1">{user.specialization}</p>
                        )}
                      </div>
                    </div>
                    {selectedUsers.find((u) => u.id === user.id) && (
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={selectedUsers.length === 0} className="flex-1">
                Next: Review & Send
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Review Assignment</h3>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-1">Selected Model</p>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">{selectedModel?.name}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  {selectedModel?.modality} • {selectedModel?.version} • {selectedModel?.accuracy}% accuracy
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                  Recipients ({selectedUsers.length})
                </p>
                <div className="space-y-2">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-900 dark:text-blue-300">
                        {user.name} ({user.hospital})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Package Contents</p>
                <ul className="text-sm text-purple-900 dark:text-purple-300 space-y-1">
                  <li>• Model weights and architecture</li>
                  <li>• Training/Inference scripts</li>
                  <li>• Configuration files</li>
                  <li>• Documentation and usage guide</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleAssign} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4 mr-2" />
                Assign & Send Model
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
