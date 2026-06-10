import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Edit, Check, X, Plus, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";
import { motion } from "motion/react";

const plansData: Record<string, any> = {
  free: {
    id: "free",
    name: "Free Plan",
    price: 0,
    usage: {
      diagnoses: { used: 4, total: 5 },
      models: { used: 1, total: 2 },
      storage: { used: 120, total: 500 },
    },
    features: [
      { text: "5 diagnoses/month", included: true, limit: "4/5 used", editable: true, value: 5 },
      { text: "2 basic models only", included: true, limit: "Brain MRI, Chest X-Ray", editable: true, value: 2 },
      { text: "No AI team access", included: false, editable: true },
      { text: "500 MB storage", included: true, limit: "120 MB used", editable: true, value: 500 },
      { text: "Email support only", included: true, editable: false },
    ],
    color: "gray",
    subscribers: 3,
    revenue: 0,
  },
  standard: {
    id: "standard",
    name: "Standard Plan",
    price: 2000,
    usage: {
      diagnoses: { used: 67, total: 100 },
      models: { used: 4, total: 6 },
      storage: { used: 3200, total: 10000 },
    },
    features: [
      { text: "100 diagnoses/month", included: true, limit: "67/100 used", editable: true, value: 100 },
      { text: "6 AI models access", included: true, limit: "All except experimental", editable: true, value: 6 },
      { text: "Explainability features", included: true, limit: "Grad-CAM, Attention", editable: false },
      { text: "Partial FL participation", included: true, limit: "Observer mode", editable: false },
      { text: "10 GB storage", included: true, limit: "3.2 GB used", editable: true, value: 10 },
      { text: "Priority email support", included: true, editable: false },
    ],
    color: "blue",
    subscribers: 5,
    revenue: 10000,
  },
  premium: {
    id: "premium",
    name: "Premium Plan",
    price: 4000,
    usage: {
      diagnoses: { used: 847, total: null },
      models: { used: 12, total: 12 },
      storage: { used: 15400, total: null },
    },
    features: [
      { text: "Unlimited diagnoses", included: true, limit: "847 this month", editable: false },
      { text: "All 12 AI models", included: true, limit: "Including experimental", editable: true, value: 12 },
      { text: "Full explainability suite", included: true, limit: "All methods enabled", editable: false },
      { text: "Full FL participation", included: true, limit: "Active contributor", editable: false },
      { text: "Unlimited storage", included: true, limit: "15.4 GB used", editable: false },
      { text: "24/7 dedicated support", included: true, editable: false },
      { text: "Custom model training", included: true, editable: false },
    ],
    color: "purple",
    subscribers: 10,
    revenue: 40000,
  },
};

export function PlanDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Get plan by ID string (not array index)
  const plan = plansData[id as keyof typeof plansData];

  const [isEditMode, setIsEditMode] = useState(false);
  const [planName, setPlanName] = useState(plan?.name || "");
  const [planPrice, setPlanPrice] = useState(plan?.price || 0);
  const [features, setFeatures] = useState(plan?.features || []);

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

  const handleSave = () => {
    toast.success(`Successfully updated ${planName}!`, {
      description: "All changes have been saved to the system",
    });
    setIsEditMode(false);
  };

  const handleToggleFeature = (index: number) => {
    const updated = [...features];
    updated[index].included = !updated[index].included;
    setFeatures(updated);
  };

  const handleUpdateFeatureValue = (index: number, value: string) => {
    const updated = [...features];
    updated[index].value = parseInt(value) || 0;
    setFeatures(updated);
  };

  const handleAddFeature = () => {
    setFeatures([...features, { text: "New feature", included: true, editable: true }]);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const colorClasses = {
    purple: {
      bg: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-600",
    },
    blue: {
      bg: "from-blue-500/10 to-indigo-500/10",
      border: "border-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-600",
    },
    gray: {
      bg: "from-gray-500/10 to-slate-500/10",
      border: "border-gray-500",
      text: "text-gray-600 dark:text-gray-400",
      badge: "bg-gray-600",
    },
  };

  const colors = colorClasses[plan.color as keyof typeof colorClasses];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plan Details & Configuration</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage plan settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button className={colors.badge} onClick={() => setIsEditMode(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Overview */}
        <Card className={`lg:col-span-2 border-2 ${colors.border} bg-white dark:bg-gray-900 relative overflow-hidden`}>
          <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${colors.bg}`} />

          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Plan Name</Label>
                      <Input
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        className="mt-1 max-w-md"
                      />
                    </div>
                    <div>
                      <Label>Monthly Price (DZD)</Label>
                      <Input
                        type="number"
                        value={planPrice}
                        onChange={(e) => setPlanPrice(parseInt(e.target.value) || 0)}
                        className="mt-1 max-w-md"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">{planName}</CardTitle>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {planPrice.toLocaleString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">DZD/month</span>
                    </div>
                  </>
                )}
              </div>
              <Badge className={colors.badge}>{plan.color.toUpperCase()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Usage */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Usage Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Diagnoses</span>
                    {plan.usage.diagnoses.total && (
                      <span className="text-sm font-semibold">
                        {plan.usage.diagnoses.used}/{plan.usage.diagnoses.total}
                      </span>
                    )}
                    {!plan.usage.diagnoses.total && (
                      <span className="text-sm font-semibold">{plan.usage.diagnoses.used} used</span>
                    )}
                  </div>
                  <Progress
                    value={
                      plan.usage.diagnoses.total
                        ? (plan.usage.diagnoses.used / plan.usage.diagnoses.total) * 100
                        : 30
                    }
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">AI Models</span>
                    <span className="text-sm font-semibold">
                      {plan.usage.models.used}/{plan.usage.models.total}
                    </span>
                  </div>
                  <Progress value={(plan.usage.models.used / plan.usage.models.total) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                    {plan.usage.storage.total && (
                      <span className="text-sm font-semibold">
                        {plan.usage.storage.used} / {plan.usage.storage.total} MB
                      </span>
                    )}
                    {!plan.usage.storage.total && (
                      <span className="text-sm font-semibold">{plan.usage.storage.used} MB used</span>
                    )}
                  </div>
                  <Progress
                    value={
                      plan.usage.storage.total ? (plan.usage.storage.used / plan.usage.storage.total) * 100 : 20
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Features & Limits */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Features & Service Limits</h3>
                {isEditMode && (
                  <Button variant="outline" size="sm" onClick={handleAddFeature}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      feature.included
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isEditMode ? (
                        <button
                          onClick={() => handleToggleFeature(index)}
                          className={`mt-1 w-5 h-5 rounded flex items-center justify-center border-2 ${
                            feature.included
                              ? "bg-emerald-600 border-emerald-600"
                              : "bg-white dark:bg-gray-700 border-gray-300"
                          }`}
                        >
                          {feature.included && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ) : feature.included ? (
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <Input
                              value={feature.text}
                              onChange={(e) => {
                                const updated = [...features];
                                updated[index].text = e.target.value;
                                setFeatures(updated);
                              }}
                              className="font-medium"
                            />
                            {feature.editable && feature.value !== undefined && (
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Limit:</Label>
                                <Input
                                  type="number"
                                  value={feature.value}
                                  onChange={(e) => handleUpdateFeatureValue(index, e.target.value)}
                                  className="w-24 h-8"
                                />
                                <span className="text-xs text-gray-500">per month</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p
                              className={`font-medium ${
                                feature.included ? "text-gray-900 dark:text-white" : "text-gray-500 line-through"
                              }`}
                            >
                              {feature.text}
                            </p>
                            {feature.limit && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.limit}</p>
                            )}
                          </>
                        )}
                      </div>

                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Info */}
        <div className="space-y-6">
          {/* Subscriber Stats */}
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Subscriber Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-1">Active Subscribers</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">{plan.subscribers}</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                  {plan.revenue.toLocaleString()} DZD
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Revenue per User</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                  {plan.subscribers > 0 ? (plan.revenue / plan.subscribers).toLocaleString() : 0} DZD
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Status */}
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Plan Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <Badge className="bg-emerald-600">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Visibility</span>
                <Badge variant="outline">Public</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                <span className="text-sm font-medium">Jan 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="text-sm font-medium">May 19, 2026</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => toast.info("Duplicating plan...")}>
                Duplicate Plan
              </Button>
              <Button variant="outline" className="w-full" onClick={() => toast.warning("Archiving plan...")}>
                Archive Plan
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => toast.error("Delete action requires confirmation")}
              >
                Delete Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}