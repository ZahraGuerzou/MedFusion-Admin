import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

interface Plan {
  id: string;
  name: string;
  price_dzd: number;
  max_diagnoses: number | null;
  max_storage_mb: number | null;
  max_ai_models: number | null;
  ai_team_access: boolean;
  explainability: boolean;
  fl_participation: string;
  support_level: string;
  custom_model_training: boolean;
  allowed_models: string[] | null;
}

const flParticipationOptions = [
  { value: "none", label: "None" },
  { value: "observer", label: "Observer" },
  { value: "active", label: "Active" },
];

const supportLevelOptions = [
  { value: "email", label: "Email Support" },
  { value: "priority", label: "Priority Email Support" },
  { value: "dedicated", label: "24/7 Dedicated Support" },
];

const modelOptions = [
  "Brain MRI",
  "Chest X-Ray",
  "Retinal OCT",
  "Skin Lesion",
  "CT Scan",
  "Pathology",
  "Experimental Model 1",
  "Experimental Model 2",
];

export function PlanSettings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [originalPlan, setOriginalPlan] = useState<Plan | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  async function fetchPlan() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setPlan(data);
      setOriginalPlan(data);
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast.error("Failed to load plan details");
      navigate("/subscriptions");
    } finally {
      setLoading(false);
    }
  }

  const updatePlan = (updates: Partial<Plan>) => {
    setPlan(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Check if there are changes
      const changed = JSON.stringify(updated) !== JSON.stringify(originalPlan);
      setHasChanges(changed);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!plan) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          name: plan.name,
          price_dzd: plan.price_dzd,
          max_diagnoses: plan.max_diagnoses,
          max_storage_mb: plan.max_storage_mb,
          max_ai_models: plan.max_ai_models,
          ai_team_access: plan.ai_team_access,
          explainability: plan.explainability,
          fl_participation: plan.fl_participation,
          support_level: plan.support_level,
          custom_model_training: plan.custom_model_training,
          allowed_models: plan.allowed_models,
        })
        .eq("id", plan.id);

      if (error) throw error;

      toast.success(`${plan.name} updated successfully!`);
      setOriginalPlan(plan);
      setHasChanges(false);
      
      // Navigate back after 1.5 seconds
      setTimeout(() => navigate("/subscriptions"), 1500);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan changes");
    } finally {
      setSaving(false);
    }
  };

  const toggleAllowedModel = (model: string) => {
    if (!plan) return;
    const currentModels = plan.allowed_models || [];
    const newModels = currentModels.includes(model)
      ? currentModels.filter(m => m !== model)
      : [...currentModels, model];
    updatePlan({ allowed_models: newModels });
  };

  const cancel = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/subscriptions");
      }
    } else {
      navigate("/subscriptions");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-500">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-500">Plan not found</p>
            <Button onClick={() => navigate("/subscriptions")} className="mt-4">
              Back to Subscriptions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPremium = plan.id === "premium";
  const isStandard = plan.id === "standard";
  const isFree = plan.id === "free";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={cancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit {plan.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Modify subscription plan settings and features
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              Unsaved changes
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Basic Information */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={plan.name}
                  onChange={(e) => updatePlan({ name: e.target.value })}
                  placeholder="e.g., Premium Plan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (DZD/month)</Label>
                <Input
                  id="price"
                  type="number"
                  value={plan.price_dzd}
                  onChange={(e) => updatePlan({ price_dzd: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_diagnoses">Max Diagnoses per Month</Label>
                <Input
                  id="max_diagnoses"
                  type="number"
                  value={plan.max_diagnoses || ""}
                  onChange={(e) => updatePlan({ max_diagnoses: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-500">Leave empty for unlimited</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_storage">Max Storage (MB)</Label>
                <Input
                  id="max_storage"
                  type="number"
                  value={plan.max_storage_mb || ""}
                  onChange={(e) => updatePlan({ max_storage_mb: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-500">Leave empty for unlimited</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_ai_models">Max AI Models</Label>
                <Input
                  id="max_ai_models"
                  type="number"
                  value={plan.max_ai_models || ""}
                  onChange={(e) => updatePlan({ max_ai_models: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-500">Leave empty for unlimited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-gray-200 dark:border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Features & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="font-medium">AI Team Access</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow access to AI team members
                  </p>
                </div>
                <Switch
                  checked={plan.ai_team_access}
                  onCheckedChange={(checked) => updatePlan({ ai_team_access: checked })}
                  disabled={isFree}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="font-medium">Explainability Features</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable Grad-CAM, Attention maps
                  </p>
                </div>
                <Switch
                  checked={plan.explainability}
                  onCheckedChange={(checked) => updatePlan({ explainability: checked })}
                  disabled={isFree}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="font-medium">Custom Model Training</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow custom model training
                  </p>
                </div>
                <Switch
                  checked={plan.custom_model_training}
                  onCheckedChange={(checked) => updatePlan({ custom_model_training: checked })}
                  disabled={!isPremium}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fl_participation">FL Participation Level</Label>
                <select
                  id="fl_participation"
                  value={plan.fl_participation}
                  onChange={(e) => updatePlan({ fl_participation: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  disabled={isFree}
                >
                  {flParticipationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_level">Support Level</Label>
                <select
                  id="support_level"
                  value={plan.support_level}
                  onChange={(e) => updatePlan({ support_level: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                >
                  {supportLevelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isPremium && (
              <div className="space-y-3">
                <Label>Allowed Models</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Select which AI models are available to this plan
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {modelOptions.slice(0, 6).map((model) => (
                    <div
                      key={model}
                      onClick={() => toggleAllowedModel(model)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        plan.allowed_models?.includes(model)
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model}</span>
                        {plan.allowed_models?.includes(model) && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isFree && (
                  <p className="text-xs text-amber-600 mt-2">
                    Free plan models are limited. Upgrade to Standard or Premium for more models.
                  </p>
                )}
              </div>
            )}

            {isPremium && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Premium plan includes access to ALL models (including experimental ones)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning for Free Plan */}
        {isFree && (
          <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                    Free Plan Limitations
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                    The Free plan has limited features. Some settings cannot be modified for this plan type.
                    Users on the Free plan have access to basic features only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6 sticky bottom-6">
          <Button
            type="button"
            variant="outline"
            onClick={cancel}
            className="rounded-xl h-11"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!hasChanges || saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl h-11"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}