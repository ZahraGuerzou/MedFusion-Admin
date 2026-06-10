import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, Mail, Globe, CreditCard, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { supabase } from "../../lib/supabaseClient";

export function HospitalUpdate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "CHU Alger",
    country: "Algeria",
    city: "",
    address: "",
    email: "contact@chualger.dz",
    plan: "Premium",
    status: "Active",
    doctors: "24",
    aiTeams: "8",
  });

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase.from("hospitals").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (data) {
          setFormData({
            name: data.name ?? "",
            country: data.country ?? "",
            city: data.city ?? "",
            address: data.full_address ?? data.address ?? "",
            email: data.contact_email ?? data.email ?? "",
            plan: data.plan ?? data.subscription_plan ?? "",
            status: data.status ?? "",
            doctors: data.number_of_doctors ?? data.doctors ?? "",
            aiTeams: data.number_of_ai_team ?? data.aiTeams ?? "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load hospital");
      }
    })();
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        if (!id) return;
        const payload: any = {
          name: formData.name,
          country: formData.country,
          city: formData.city,
          full_address: formData.address,
          contact_email: formData.email,
          plan: formData.plan,
          status: formData.status,
          number_of_doctors: formData.doctors || null,
          number_of_ai_team: formData.aiTeams || null,
        };
        const { error } = await supabase.from("hospitals").update(payload).eq("id", id);
        if (error) throw error;
        toast.success("Hospital updated successfully!");
        setTimeout(() => navigate("/hospitals"), 1200);
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to update hospital: ${err?.message ?? String(err)}`);
      }
    })();
  };

  const handleCancel = () => {
    navigate("/hospitals");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/hospitals")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Update Hospital</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Modify hospital information and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Hospital Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Algeria">Algeria</SelectItem>
                    <SelectItem value="Tunisia">Tunisia</SelectItem>
                    <SelectItem value="Morocco">Morocco</SelectItem>
                    <SelectItem value="Egypt">Egypt</SelectItem>
                    <SelectItem value="Libya">Libya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="contact@hospital.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Subscription Plan *</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctors">Number of Doctors</Label>
                <Input
                  id="doctors"
                  type="number"
                  value={formData.doctors}
                  onChange={(e) => setFormData({ ...formData, doctors: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiTeams">Number of AI Teams</Label>
                <Input
                  id="aiTeams"
                  type="number"
                  value={formData.aiTeams}
                  onChange={(e) => setFormData({ ...formData, aiTeams: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            Update Hospital
          </Button>
        </div>
      </form>
    </div>
  );
}
