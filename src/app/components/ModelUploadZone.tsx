import { useState, useCallback } from "react";
import { Upload, FileCheck, AlertCircle, X, FileText, ChevronRight, Edit2, Check } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

interface UploadedModel {
  name: string;
  size: number;
  modality: string;
  architecture: string;
  version: string;
  instructions: string;
}

const DEFAULT_UPLOAD_STEPS = [
  "Download and extract the package on your local machine",
  "Install dependencies: pip install -r requirements.txt",
  "Open notebook.ipynb in Jupyter Lab",
  "Load your local dataset (medical images)",
  "Run training cells to fine-tune the global model",
  "Generate submission package using the final cell",
  "Upload the submission_package.zip back to the platform",
];

function StepsWizard({ onComplete }: { onComplete: () => void }) {
  const [steps, setSteps] = useState<string[]>(DEFAULT_UPLOAD_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingValue, setEditingValue] = useState(DEFAULT_UPLOAD_STEPS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [done, setDone] = useState(false);

  const advance = (saveEdit: boolean) => {
    const updated = [...steps];
    if (saveEdit) updated[currentStep] = editingValue;
    setSteps(updated);
    setIsEditing(false);

    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setEditingValue(updated[next]);
    } else {
      setDone(true);
      onComplete();
    }
  };

  if (done) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
        Next Steps
        <span className="text-xs font-normal text-gray-400">{currentStep + 1} / {steps.length}</span>
      </p>

      {steps.slice(0, currentStep).map((step, idx) => (
        <div key={idx} className="flex items-start gap-3 p-2 mb-1 rounded-lg opacity-60">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">{step}</p>
        </div>
      ))}

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-3 mb-2 rounded-lg border-2 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">{currentStep + 1}</span>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <textarea
                className="w-full text-sm bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-md px-2 py-1 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={2}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                autoFocus
              />
            ) : (
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">{editingValue}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2 ml-9">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Modify
              </button>
              <button
                onClick={() => advance(false)}
                className="text-xs px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
              >
                {currentStep < steps.length - 1 ? <>Leave as is <ChevronRight className="w-3 h-3" /></> : <>Complete <Check className="w-3 h-3" /></>}
              </button>
            </>
          ) : (
            <button
              onClick={() => advance(true)}
              className="text-xs px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
            >
              {currentStep < steps.length - 1 ? <>Save & Next <ChevronRight className="w-3 h-3" /></> : <>Save & Complete <Check className="w-3 h-3" /></>}
            </button>
          )}
        </div>
      </motion.div>

      {steps.slice(currentStep + 1).map((step, idx) => (
        <div key={idx} className="flex items-start gap-3 p-2 mb-1 rounded-lg opacity-30">
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold">{currentStep + 2 + idx}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{step}</p>
        </div>
      ))}
    </div>
  );
}

interface ModelUploadZoneProps {
  /** Called after a model is successfully saved to the database */
  onModelSaved?: () => void;
}

export function ModelUploadZone({ onModelSaved }: ModelUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedModel, setUploadedModel] = useState<UploadedModel | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [stepsCompleted, setStepsCompleted] = useState(false);

  const [editModality, setEditModality] = useState("");
  const [editArchitecture, setEditArchitecture] = useState("");
  const [editVersion, setEditVersion] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStepsCompleted(false);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          const modality = ["Brain MRI", "Chest X-Ray", "Retinal OCT", "Skin Lesion"][Math.floor(Math.random() * 4)];
          const architecture = ["EfficientNetV2", "ResNet18", "ViT", "ConvNeXt"][Math.floor(Math.random() * 4)];
          const version = `v1.${Math.floor(Math.random() * 10)}`;

          const mockModel: UploadedModel = {
            name: file.name,
            size: file.size,
            modality,
            architecture,
            version,
            instructions: "",
          };

          setUploadedModel(mockModel);
          setEditModality(modality);
          setEditArchitecture(architecture);
          setEditVersion(version);
          setShowPreview(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      simulateUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  const resetState = () => {
    setShowPreview(false);
    setUploadedModel(null);
    setInstructions("");
    setStepsCompleted(false);
    setEditModality("");
    setEditArchitecture("");
    setEditVersion("");
    setUploadProgress(0);
  };

  /**
   * Save the uploaded model to both model_packages AND global_models tables
   * With proper foreign key handling
   */
  const saveModelToDatabase = async () => {
    if (!stepsCompleted) {
      toast.error("Please complete all steps before saving");
      return;
    }
    if (!instructions.trim()) {
      toast.error("Please add deployment instructions before saving");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Get or create an FL round for this model upload
      let flRoundId: string | null = null;
      
      // Try to get existing FL round first
      const { data: existingRound, error: roundFetchError } = await supabase
        .from("fl_rounds")
        .select("id, round_number")
        .order("created_at", { ascending: false })
        .limit(1);

      if (roundFetchError) {
        console.error("Error fetching FL rounds:", roundFetchError);
      }

      if (existingRound && existingRound.length > 0) {
        // Use existing round
        flRoundId = existingRound[0].id;
        console.log("Using existing FL round:", flRoundId);
      } else {
        // Create a new FL round for this model
        // First get a hospital and AI team member
        const { data: anyHospital } = await supabase
          .from("hospitals")
          .select("id")
          .limit(1);
        
        const { data: anyAi } = await supabase
          .from("ai_team")
          .select("id")
          .limit(1);

        if (!anyHospital || anyHospital.length === 0) {
          toast.error("No hospitals found. Please add a hospital first.");
          return;
        }

        if (!anyAi || anyAi.length === 0) {
          toast.error("No AI team members found. Please add an AI team member first.");
          return;
        }

        const { data: newRound, error: createRoundError } = await supabase
          .from("fl_rounds")
          .insert({
            hospital_id: anyHospital[0].id,
            ai_team_id: anyAi[0].id,
            round_number: 1,
            status: "pending",
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (createRoundError) {
          console.error("Error creating FL round:", createRoundError);
          throw createRoundError;
        }

        flRoundId = newRound.id;
        console.log("Created new FL round:", flRoundId);
      }

      if (!flRoundId) {
        toast.error("Could not create or find an FL round");
        return;
      }

      // 2. Get AI team and hospital for the model package
      const { data: aiTeam } = await supabase
        .from("ai_team")
        .select("id")
        .limit(1);
      
      const { data: hospital } = await supabase
        .from("hospitals")
        .select("id")
        .limit(1);

      if (!aiTeam || aiTeam.length === 0 || !hospital || hospital.length === 0) {
        toast.error("Missing required data (AI team or hospitals)");
        return;
      }

      const aiTeamId = aiTeam[0].id;
      const hospitalId = hospital[0].id;
      const distId = `model_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const modelCode = editArchitecture
        ? `${editArchitecture} (${editModality})`
        : uploadedModel?.name?.replace(/\.[^/.]+$/, "") ?? "Uploaded Model";

      const packageContents = {
        fileName: uploadedModel?.name,
        fileSizeMB: uploadedModel ? (uploadedModel.size / (1024 * 1024)).toFixed(2) : 0,
        modality: editModality,
        architecture: editArchitecture,
        version: editVersion || "v1.0",
        uploadedAt: new Date().toISOString()
      };

      const timeline = {
        uploaded: new Date().toISOString(),
        stepsCompleted: true,
        instructionsAdded: true
      };

      // 3. Insert into model_packages table
      const { error: insertPackageError } = await supabase
        .from("model_packages")
        .insert({
          ai_team_id: aiTeamId,
          fl_round_id: flRoundId,
          hospital_id: hospitalId,
          zip_url: null,
          notebook_url: null,
          instructions: instructions,
          status: "sent",
          sent_at: new Date().toISOString(),
          recipient_name: "AI Team",
          recipient_role: "researcher",
          model_code: modelCode,
          modality: editModality,
          action: "upload",
          delivery_status: "pending",
          dist_id: distId,
          package_size_mb: uploadedModel ? uploadedModel.size / (1024 * 1024) : 0,
          estimated_delivery: "Pending review",
          delivered_at: null,
          package_contents: packageContents,
          timeline: timeline
        });

      if (insertPackageError) {
        console.error("Error inserting into model_packages:", insertPackageError);
        throw insertPackageError;
      }

      // 4. Insert into global_models table with REQUIRED fl_round_id
      const { error: insertGlobalError } = await supabase
        .from("global_models")
        .insert({
          fl_round_id: flRoundId,  // REQUIRED foreign key!
          name: modelCode,
          modality: editModality,
          version: editVersion || "v1.0",
          accuracy: 85.0, // Default accuracy
          global_accuracy: 85.0,
          status: "active",
          tags: [editModality, editArchitecture, "uploaded"],
          aggregated_at: new Date().toISOString(),
        });

      if (insertGlobalError) {
        console.error("Error inserting into global_models:", insertGlobalError);
        toast.warning("Model saved to packages but failed to add to global models list. Please check foreign key constraints.");
        throw insertGlobalError;
      }

      toast.success("Model saved successfully! It is now available for FL training.");
      resetState();
      onModelSaved?.();
      
    } catch (err: any) {
      console.error("Failed to save model:", err);
      toast.error(`Failed to save model: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <input
          type="file"
          accept=".zip,.h5,.pt,.pth,.onnx,.pb"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-4">
              <Upload className="w-12 h-12 text-emerald-500 animate-pulse" />
            </motion.div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Uploading model...</p>
            <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-emerald-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}% complete</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop your model package here
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              or click to browse (.zip, .h5, .pt, .onnx files)
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <FileCheck className="w-4 h-4" />
              <span>Model will be stored and available for FL training</span>
            </div>
          </div>
        )}
      </div>

      {showPreview && uploadedModel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Model Preview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Review &amp; save to database</p>
                </div>
              </div>
              <button
                onClick={resetState}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* File info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">File Name</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{uploadedModel.name}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {(uploadedModel.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Editable model info */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-3 font-semibold">
                  Model Information — will be saved to database
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 block">Modality</label>
                    <input
                      type="text"
                      value={editModality}
                      onChange={(e) => setEditModality(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 block">Model Name</label>
                    <input
                      type="text"
                      value={editArchitecture}
                      onChange={(e) => setEditArchitecture(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 block">Version</label>
                    <input
                      type="text"
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Steps wizard */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                {!stepsCompleted ? (
                  <StepsWizard onComplete={() => setStepsCompleted(true)} />
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="w-5 h-5" />
                    <p className="text-sm font-semibold">All steps reviewed!</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <label htmlFor="instructions" className="font-semibold text-amber-900 dark:text-amber-300">
                    Deployment Instructions *
                  </label>
                </div>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter detailed instructions for hospitals deploying this model (e.g., preprocessing steps, input requirements, usage guidelines, expected performance, etc.)"
                  className="w-full h-32 px-3 py-2 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                  These instructions will be sent with the model when deployed to hospitals
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Model will be stored in <strong>model_packages</strong> AND <strong>global_models</strong> tables. 
                  It will be immediately available for FL training.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveModelToDatabase}
                disabled={!instructions.trim() || !stepsCompleted || isSaving}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving to database…
                  </>
                ) : (
                  "Save Model & Make Available for FL Training"
                )}
              </button>
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}