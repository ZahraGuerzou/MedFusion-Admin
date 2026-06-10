import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, X, CreditCard, ArrowLeft, Building2, Calendar, DollarSign, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { motion } from "motion/react";

export function SubscriptionUpgrade() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [duration, setDuration] = useState("12");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from("hospital_subscriptions")
        .select(`
          *,
          hospital:hospitals(id, name),
          plan:subscription_plans(*)
        `);

      if (subsError) throw subsError;
      
      const idx = parseInt(id || "0");
      const sub = subscriptions?.[idx];
      setSubscription(sub);
      setSelectedPlan(sub?.plan_id || "standard");

      // Get all plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_dzd", { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
  const currentPlanDetails = subscription?.plan;
  const isUpgrade = selectedPlanDetails && currentPlanDetails && selectedPlanDetails.price_dzd > currentPlanDetails.price_dzd;

  const totalAmount = selectedPlanDetails ? selectedPlanDetails.price_dzd * parseInt(duration) : 0;
  const discount = parseInt(duration) === 12 ? 0.1 : parseInt(duration) === 6 ? 0.05 : 0;
  const finalAmount = totalAmount * (1 - discount);

  const handleConfirmUpgrade = async () => {
    if (!subscription || !selectedPlanDetails) return;
    
    const newExpiryDate = new Date();
    newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(duration));
    
    const { error } = await supabase
      .from("hospital_subscriptions")
      .update({ 
        plan_id: selectedPlan,
        expires_at: newExpiryDate.toISOString(),
        status: "active"
      })
      .eq("id", subscription.id);

    if (error) {
      toast.error("Failed to upgrade subscription");
      return;
    }

    toast.success(`Successfully upgraded ${subscription.hospital?.name} to ${selectedPlanDetails.name}!`, {
      description: `Duration: ${duration} months | Total: ${finalAmount.toLocaleString()} DZD`,
    });
    setTimeout(() => navigate("/subscriptions"), 1500);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Subscription not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Choose a new plan for {subscription.hospital?.name}</p>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{subscription.hospital?.name}</h3>
              <div className="flex items-center gap-4 text-sm">
                <Badge className="bg-blue-600">Current: {subscription.plan?.name}</Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  Expires: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select New Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-4">
                  {plans.map((plan) => {
                    const isCurrent = plan.id === subscription.plan_id;
                    const isSelected = plan.id === selectedPlan;
                    
                    return (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.01 }}
                        className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : isCurrent
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {isCurrent && (
                          <Badge className="absolute top-4 right-4 bg-blue-600">Current Plan</Badge>
                        )}

                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={plan.id} className="text-lg font-semibold cursor-pointer">
                              {plan.name}
                            </Label>
                            <div className="mt-2 mb-4">
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                {plan.price_dzd.toLocaleString()} DZD
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">/month</span>
                            </div>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span>{plan.max_diagnoses ? `${plan.max_diagnoses} diagnoses/month` : "Unlimited diagnoses"}</span>
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span>{plan.max_storage_mb ? `${plan.max_storage_mb} MB storage` : "Unlimited storage"}</span>
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                {plan.ai_team_access ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500" />
                                )}
                                <span className={!plan.ai_team_access ? "text-gray-400" : ""}>AI team access</span>
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                {plan.explainability ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <X className="w-4 h-4 text-red-500" />
                                )}
                                <span className={!plan.explainability ? "text-gray-400" : ""}>Explainability features</span>
                              </li>
                              <li className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span className="capitalize">FL Participation: {plan.fl_participation}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={duration} onValueChange={setDuration}>
                <div className="space-y-3">
                  {[
                    { value: "1", label: "1 Month", discount: "No discount", save: 0 },
                    { value: "6", label: "6 Months", discount: "Save 5%", save: 5 },
                    { value: "12", label: "12 Months", discount: "Save 10%", save: 10, best: true }
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        duration === opt.value
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      } relative`}
                      onClick={() => setDuration(opt.value)}
                    >
                      {opt.best && (
                        <Badge className="absolute -top-2 -right-2 bg-emerald-600">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Best Value
                        </Badge>
                      )}
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={opt.value} id={`duration-${opt.value}`} />
                        <Label htmlFor={`duration-${opt.value}`} className="flex-1 cursor-pointer">
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-sm text-emerald-600">{opt.discount}</div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 pb-4 border-b border-gray-300">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className="font-medium">{selectedPlanDetails?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price/month</span>
                  <span>{selectedPlanDetails?.price_dzd.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{totalAmount.toLocaleString()} DZD</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-{(totalAmount * discount).toLocaleString()} DZD</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-purple-600">
                  {finalAmount.toLocaleString()} DZD
                </span>
              </div>

              {isUpgrade && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800">
                      Upgrading from {currentPlanDetails?.name} to {selectedPlanDetails?.name}
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
                onClick={handleConfirmUpgrade}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Confirm {isUpgrade ? "Upgrade" : "Plan Change"}
              </Button>

              <Button variant="outline" className="w-full" onClick={() => navigate("/subscriptions")}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}