import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, Calendar, DollarSign, CreditCard, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { motion } from "motion/react";

const subscriptions = [
  { hospital: "CHU Alger", plan: "Premium", price: 4000, expiration: "June 2026", usage: 78 },
  { hospital: "CHU Oran", plan: "Premium", price: 4000, expiration: "July 2026", usage: 65 },
  { hospital: "CHU Constantine", plan: "Standard", price: 2000, expiration: "May 2026", usage: 92 },
  { hospital: "Hôpital Central Tunis", plan: "Premium", price: 4000, expiration: "August 2026", usage: 45 },
  { hospital: "Casablanca Medical", plan: "Standard", price: 2000, expiration: "June 2026", usage: 88 },
  { hospital: "Cairo University", plan: "Free", price: 0, expiration: "-", usage: 95 },
];

export function SubscriptionRenew() {
  const navigate = useNavigate();
  const { id } = useParams();
  const subscription = subscriptions[parseInt(id || "0")];

  const [duration, setDuration] = useState("12");
  const [autoRenew, setAutoRenew] = useState(false);

  const monthlyPrice = subscription?.price || 0;
  const totalAmount = monthlyPrice * parseInt(duration);
  const discount = parseInt(duration) === 12 ? 0.1 : parseInt(duration) === 6 ? 0.05 : 0;
  const finalAmount = totalAmount * (1 - discount);
  const savings = totalAmount * discount;

  const handleConfirmRenewal = () => {
    toast.success(`Successfully renewed subscription for ${subscription.hospital}!`, {
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Renew Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Extend subscription for {subscription.hospital}</p>
        </div>
      </div>

      {/* Current Subscription Info */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{subscription.hospital}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Current Plan</p>
                  <Badge className="mt-1 bg-emerald-600">{subscription.plan}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expires</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{subscription.expiration}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{monthlyPrice.toLocaleString()} DZD</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration Selection */}
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Renewal Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={duration} onValueChange={setDuration}>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    duration === "1"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setDuration("1")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="1" id="1-month" />
                      <Label htmlFor="1-month" className="cursor-pointer">
                        <div className="font-semibold text-gray-900 dark:text-white">1 Month</div>
                        <div className="text-sm text-gray-500">Standard rate</div>
                      </Label>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">{monthlyPrice.toLocaleString()} DZD</div>
                      <div className="text-xs text-gray-500">No discount</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    duration === "6"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setDuration("6")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="6" id="6-months" />
                      <Label htmlFor="6-months" className="cursor-pointer">
                        <div className="font-semibold text-gray-900 dark:text-white">6 Months</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">Save 5%</div>
                      </Label>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {(monthlyPrice * 6 * 0.95).toLocaleString()} DZD
                      </div>
                      <div className="text-xs text-gray-500 line-through">{(monthlyPrice * 6).toLocaleString()} DZD</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative ${
                    duration === "12"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setDuration("12")}
                >
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="12" id="12-months" />
                      <Label htmlFor="12-months" className="cursor-pointer">
                        <div className="font-semibold text-gray-900 dark:text-white">12 Months</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">Save 10%</div>
                      </Label>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {(monthlyPrice * 12 * 0.9).toLocaleString()} DZD
                      </div>
                      <div className="text-xs text-gray-500 line-through">{(monthlyPrice * 12).toLocaleString()} DZD</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </RadioGroup>

            {/* Auto-Renew Option */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="auto-renew"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="auto-renew" className="cursor-pointer">
                  <div className="font-medium text-gray-900 dark:text-white">Enable Auto-Renewal</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Automatically renew this subscription before expiration to avoid service interruption
                  </p>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 h-fit">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Renewal Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 pb-4 border-b border-gray-300 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                <span className="font-medium text-gray-900 dark:text-white">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price/month</span>
                <span className="font-medium text-gray-900 dark:text-white">{monthlyPrice.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">{duration} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{totalAmount.toLocaleString()} DZD</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="font-medium">Discount ({(discount * 100).toFixed(0)}%)</span>
                  <span className="font-semibold">-{savings.toLocaleString()} DZD</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {finalAmount.toLocaleString()} DZD
                </span>
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You save {savings.toLocaleString()} DZD</span>
                </div>
              )}
            </div>

            {autoRenew && (
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Auto-renewal enabled. The subscription will automatically renew on {subscription.expiration}.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-6"
                onClick={handleConfirmRenewal}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Confirm Renewal - {finalAmount.toLocaleString()} DZD
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/subscriptions")}
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Secure payment processing. Your subscription will be activated immediately after payment.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
