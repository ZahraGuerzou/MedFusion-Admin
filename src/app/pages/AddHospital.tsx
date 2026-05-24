import { useState } from "react";
import { Building2, MapPin, Mail, Phone, Users, CreditCard, Shield, Save, X, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

export function AddHospital() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    adminName: "",
    adminEmail: "",
    plan: "free",
    numberOfDoctors: "",
    numberOfAITeam: "",
    specializations: [] as string[],
    enabledModalities: [] as string[],
    status: "active",
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const countries = ["Algeria", "Tunisia", "Morocco", "Egypt", "Libya", "Mauritania", "USA", "Germany", "Japan", "Singapore"];
  const plans = [
    { value: "free", label: "Free", description: "5 diagnoses/month, Limited models" },
    { value: "standard", label: "Standard", description: "100 diagnoses/month, Explainability enabled" },
    { value: "premium", label: "Premium", description: "Unlimited usage, Full FL participation" },
  ];

  const modalities = ["Brain MRI", "Chest X-Ray", "Retinal OCT", "Skin Lesion", "CT Scan", "Pathology"];
  const specializations = ["Radiology", "Neurology", "Cardiology", "Oncology", "Dermatology", "Pathology"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast.success(
      <div>
        <p className="font-semibold">Hospital Added Successfully!</p>
        <p className="text-sm">{formData.name} has been registered to the network</p>
      </div>
    );

    setTimeout(() => {
      navigate("/hospitals");
    }, 2000);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Hospital</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Register a new hospital to the federated network</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/hospitals")}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Progress Indicator */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      s < step
                        ? "bg-emerald-500 text-white"
                        : s === step
                        ? "bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="w-6 h-6" /> : s}
                  </div>
                  <p className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300">
                    {s === 1 && "Basic Info"}
                    {s === 2 && "Contact Details"}
                    {s === 3 && "Configuration"}
                    {s === 4 && "Review"}
                  </p>
                </div>
                {s < totalSteps && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      s < step ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., CHU Alger"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Algiers"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hospital Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <Badge
                        key={spec}
                        variant="outline"
                        className={`cursor-pointer transition-all ${
                          formData.specializations.includes(spec)
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, specializations: toggleArrayItem(formData.specializations, spec) })
                        }
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Mail className="w-5 h-5" />
                  Contact & Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@hospital.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+213 XXX XXX XXX"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Name *</Label>
                    <Input
                      id="adminName"
                      placeholder="Dr. Ahmed Mohamed"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@hospital.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfDoctors">Number of Doctors</Label>
                    <Input
                      id="numberOfDoctors"
                      type="number"
                      placeholder="e.g., 50"
                      value={formData.numberOfDoctors}
                      onChange={(e) => setFormData({ ...formData, numberOfDoctors: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfAITeam">AI Team Members</Label>
                    <Input
                      id="numberOfAITeam"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.numberOfAITeam}
                      onChange={(e) => setFormData({ ...formData, numberOfAITeam: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="w-5 h-5" />
                  Subscription & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Subscription Plan</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.value}
                        onClick={() => setFormData({ ...formData, plan: plan.value })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.plan === plan.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{plan.label}</h3>
                          {formData.plan === plan.value && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Enabled Modalities</Label>
                  <p className="text-sm text-gray-500 mb-2">Select AI modalities available to this hospital</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {modalities.map((modality) => (
                      <div
                        key={modality}
                        onClick={() =>
                          setFormData({ ...formData, enabledModalities: toggleArrayItem(formData.enabledModalities, modality) })
                        }
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.enabledModalities.includes(modality)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{modality}</p>
                        {formData.enabledModalities.includes(modality) && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label>Hospital Status</Label>
                    <p className="text-sm text-gray-500">Activate hospital immediately after creation</p>
                  </div>
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "inactive" })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <CheckCircle2 className="w-5 h-5" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Hospital Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formData.city}, {formData.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Admin</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.adminName}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Subscription Plan</p>
                      <Badge className="bg-emerald-500 text-white capitalize">{formData.plan}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Team Size</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formData.numberOfDoctors} Doctors, {formData.numberOfAITeam} AI Team
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.specializations.map((spec) => (
                          <Badge key={spec} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Enabled Modalities</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.enabledModalities.map((mod) => (
                          <Badge key={mod} variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                            {mod}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    <strong>Ready to register!</strong> The hospital will receive an email with setup instructions and
                    credentials.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {step < totalSteps ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next Step
              </Button>
            ) : (
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Register Hospital
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
