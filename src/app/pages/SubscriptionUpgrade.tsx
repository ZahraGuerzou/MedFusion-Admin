import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, X, CreditCard, ArrowLeft, Building2, Calendar, DollarSign, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { motion } from "motion/react";

const subscriptions = [
  { hospital: "CHU Alger", plan: "Premium", expiration: "June 2026", usage: 78, revenue: 4000 },
  { hospital: "CHU Oran", plan: "Premium", expiration: "July 2026", usage: 65, revenue: 4000 },
  { hospital: "CHU Constantine", plan: "Standard", expiration: "May 2026", usage: 92, revenue: 2000 },
  { hospital: "Hôpital Central Tunis", plan: "Premium", expiration: "August 2026", usage: 45, revenue: 4000 },
  { hospital: "Casablanca Medical", plan: "Standard", expiration: "June 2026", usage: 88, revenue: 2000 },
  { hospital: "Cairo University", plan: "Free", expiration: "-", usage: 95, revenue: 0 },
];

const plans = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    features: [
      { text: "5 diagnoses/month", included: true },
      { text: "Limited models", included: true },
      { text: "No AI team access", included: false },
      { text: "Basic support", included: true },
    ],
    color: "gray",
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: 2000,
    features: [
      { text: "100 diagnoses/month", included: true },
      { text: "Explainability enabled", included: true },
      { text: "Partial AI team access", included: true },
      { text: "Priority support", included: true },
    ],
    color: "blue",
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 4000,
    features: [
      { text: "Unlimited diagnoses", included: true },
      { text: "Full FL participation", included: true },
      { text: "All modalities", included: true },
      { text: "24/7 dedicated support", included: true },
    ],
    color: "purple",
  },
];

export function SubscriptionUpgrade() {
  const navigate = useNavigate();
  const { id } = useParams();
  const subscription = subscriptions[parseInt(id || "0")];
  const currentPlanId = subscription?.plan.toLowerCase();

  const [selectedPlan, setSelectedPlan] = useState(currentPlanId);
  const [duration, setDuration] = useState("12");

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
  const currentPlanDetails = plans.find(p => p.id === currentPlanId);
  const isUpgrade = selectedPlanDetails && currentPlanDetails && selectedPlanDetails.price > currentPlanDetails.price;

  const totalAmount = selectedPlanDetails ? selectedPlanDetails.price * parseInt(duration) : 0;
  const discount = parseInt(duration) === 12 ? 0.1 : parseInt(duration) === 6 ? 0.05 : 0;
  const finalAmount = totalAmount * (1 - discount);

  const handleConfirmUpgrade = () => {
    toast.success(`Successfully upgraded ${subscription.hospital} to ${selectedPlanDetails?.name}!`, {
      description: `Duration: ${duration} months | Total: ${finalAmount.toLocaleString()} DZD`,
    });
    setTimeout(() => navigate("/subscriptions"), 1500);
  };

  if (!subscription) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Subscription not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/subscriptions")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Choose a new plan for {subscription.hospital}</p>
        </div>
      </div>

      {/* Current Subscription Info */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{subscription.hospital}</h3>
              <div className="flex items-center gap-4 text-sm">
                <Badge className="bg-blue-600">Current: {subscription.plan}</Badge>
                <span className="text-gray-600 dark:text-gray-400">Expires: {subscription.expiration}</span>
                <span className="text-gray-600 dark:text-gray-400">Usage: {subscription.usage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Selection */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Select New Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-4">
                  {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlanId;
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
                                {plan.price.toLocaleString()} DZD
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">/month</span>
                            </div>
                            <ul className="space-y-2">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  {feature.included ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={feature.included ? "" : "line-through text-gray-400"}>
                                    {feature.text}
                                  </span>
                                </li>
                              ))}
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

        {/* Duration & Summary */}
        <div className="space-y-6">
          {/* Duration Selection */}
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={duration} onValueChange={setDuration}>
                <div className="space-y-3">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      duration === "1"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setDuration("1")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="1" id="1-month" />
                      <Label htmlFor="1-month" className="flex-1 cursor-pointer">
                        <div className="font-semibold">1 Month</div>
                        <div className="text-sm text-gray-500">No discount</div>
                      </Label>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      duration === "6"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setDuration("6")}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="6" id="6-months" />
                      <Label htmlFor="6-months" className="flex-1 cursor-pointer">
                        <div className="font-semibold">6 Months</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">Save 5%</div>
                      </Label>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                      duration === "12"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setDuration("12")}
                  >
                    <Badge className="absolute -top-2 -right-2 bg-emerald-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="12" id="12-months" />
                      <Label htmlFor="12-months" className="flex-1 cursor-pointer">
                        <div className="font-semibold">12 Months</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">Save 10%</div>
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 pb-4 border-b border-gray-300 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedPlanDetails?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price/month</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedPlanDetails?.price.toLocaleString()} DZD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">{duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">{totalAmount.toLocaleString()} DZD</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-{(totalAmount * discount).toLocaleString()} DZD</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {finalAmount.toLocaleString()} DZD
                </span>
              </div>

              {isUpgrade && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
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

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/subscriptions")}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
