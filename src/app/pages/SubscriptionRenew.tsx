import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, Calendar, DollarSign, CreditCard, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { motion } from "motion/react";

export function SubscriptionRenew() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState("12");
  const [autoRenew, setAutoRenew] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [id]);

  const loadSubscription = async () => {
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
      setPlan(sub?.plan);
      
    } catch (error) {
      console.error("Failed to load subscription:", error);
      toast.error("Failed to load subscription data");
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyPrice = plan?.price_dzd || 0;
  const totalAmount = monthlyPrice * parseInt(duration);
  const discount = parseInt(duration) === 12 ? 0.1 : parseInt(duration) === 6 ? 0.05 : 0;
  const finalAmount = totalAmount * (1 - discount);
  const savings = totalAmount * discount;

  const handleConfirmRenewal = async () => {
    if (!subscription) return;
    
    const newExpiryDate = new Date();
    newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(duration));
    
    const { error } = await supabase
      .from("hospital_subscriptions")
      .update({ 
        expires_at: newExpiryDate.toISOString(),
        status: "active"
      })
      .eq("id", subscription.id);

    if (error) {
      toast.error("Failed to renew subscription");
      return;
    }

    toast.success(`Successfully renewed subscription for ${subscription.hospital?.name}!`, {
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Renew Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Extend subscription for {subscription.hospital?.name}</p>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{subscription.hospital?.name}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Current Plan</p>
                  <Badge className="mt-1 bg-emerald-600">{plan?.name}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expires</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">
                    {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "N/A"}
                  </p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Renewal Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={duration} onValueChange={setDuration}>
              <div className="space-y-4">
                {[
                  { value: "1", label: "1 Month", discount: "No discount", price: monthlyPrice, save: 0 },
                  { value: "6", label: "6 Months", discount: "Save 5%", price: monthlyPrice * 6 * 0.95, original: monthlyPrice * 6, save: 5 },
                  { value: "12", label: "12 Months", discount: "Save 10%", price: monthlyPrice * 12 * 0.9, original: monthlyPrice * 12, save: 10, best: true }
                ].map((opt) => (
                  <motion.div
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      duration === opt.value
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    } relative`}
                    onClick={() => setDuration(opt.value)}
                  >
                    {opt.best && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-600 to-teal-600">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Best Value
                      </Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={opt.value} id={`${opt.value}-month`} />
                        <Label htmlFor={`${opt.value}-month`} className="cursor-pointer">
                          <div className="font-semibold text-gray-900 dark:text-white">{opt.label}</div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400">{opt.discount}</div>
                        </Label>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">{opt.price.toLocaleString()} DZD</div>
                        {opt.original && (
                          <div className="text-xs text-gray-500 line-through">{opt.original.toLocaleString()} DZD</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>

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

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Renewal Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 pb-4 border-b border-gray-300 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                <span className="font-medium text-gray-900 dark:text-white">{plan?.name}</span>
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
                    Auto-renewal enabled. The subscription will automatically renew on expiration.
                  </p>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-6"
              onClick={handleConfirmRenewal}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Confirm Renewal - {finalAmount.toLocaleString()} DZD
            </Button>

            <Button variant="outline" className="w-full" onClick={() => navigate("/subscriptions")}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}