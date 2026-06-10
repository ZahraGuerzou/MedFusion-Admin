import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, Edit, Trash2, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { toast } from "sonner";
import { supabase, testConnection } from "../../lib/supabaseClient";

// hospitals will be loaded from Supabase

const planColors = {
  Premium: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  Standard: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Free: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const statusColors = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Limited: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  Suspended: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export function Hospitals() {
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; hospitalId: number | null; hospitalName: string }>({
    isOpen: false,
    hospitalId: null,
    hospitalName: "",
  });

  const [hospitals, setHospitals] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await fetchHospitals();
    })();
  }, []);

  async function fetchHospitals() {
    try {
      setLoading(true);
      const { data: hospitalsData, error: hError } = await supabase
        .from("hospitals")
        .select("*");

      if (hError) throw hError;

      // total FL rounds for participation calculation
      const { count: totalRoundsCount } = await supabase.from("fl_rounds").select("id", { count: "exact" });
      const totalRounds = totalRoundsCount ?? 0;

      const enriched = await Promise.all(
        (hospitalsData || []).map(async (h: any) => {
          const { count: activeModelsCount } = await supabase
            .from("local_model_weights")
            .select("id", { count: "exact" })
            .eq("hospital_id", h.id);

          const { count: roundsCount } = await supabase
            .from("fl_rounds")
            .select("id", { count: "exact" })
            .eq("hospital_id", h.id);

          // country fallbacks
          const country = h.country ?? h.country_name ?? h.location ?? h.address ?? "Unknown";

          // subscription plan id/name fallbacks
          const planId = h.subscription_plan_id ?? h.plan_id ?? h.subscription_plan ?? h.plan;
          let plan = "Free";
          if (planId) {
            // if planId looks like an id (number or uuid), try to fetch name
            if (typeof planId === "number" || typeof planId === "string") {
              const { data: planData, error: planErr } = await supabase
                .from("subscription_plans")
                .select("name")
                .eq("id", planId)
                .maybeSingle();
              if (!planErr && planData?.name) plan = planData.name;
              else if (typeof planId === "string") plan = planId; // fallback to string value
            }
          }

          const participation = totalRounds > 0 ? Math.round(((roundsCount ?? 0) / totalRounds) * 100) : 0;

          return {
            id: h.id,
            name: h.name ?? h.title ?? "Unnamed Hospital",
            country,
            plan,
            activeModels: activeModelsCount ?? 0,
            participation,
            status: h.status ?? h.state ?? "Active",
          };
        })
      );

      setHospitals(enriched);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || String(err);
      toast.error(`Failed to load hospitals: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = () => {
    (async () => {
      try {
        const id = deleteModal.hospitalId;
        if (!id) return;
        const { error } = await supabase.from("hospitals").delete().eq("id", id);
        if (error) throw error;
        toast.success(`Hospital "${deleteModal.hospitalName}" deleted successfully`);
        setDeleteModal({ isOpen: false, hospitalId: null, hospitalName: "" });
        fetchHospitals();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete hospital");
      }
    })();
  };

  return (
    <div className="p-6 space-y-6">
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, hospitalId: null, hospitalName: "" })}
        onConfirm={handleDelete}
        title="Delete Hospital"
        message="Are you sure you want to delete this hospital? This action cannot be undone and will remove all associated data."
        itemName={deleteModal.hospitalName}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hospitals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all hospitals and institutions</p>
        </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setDiagLoading(true);
                  const res = await testConnection();
                  if (res?.ok) {
                    toast.success("Supabase connection OK");
                  } else {
                    const msg = res?.error?.message ?? String(res?.error ?? "Unknown error");
                    toast.error(`Supabase test failed: ${msg}`);
                  }
                } catch (err: any) {
                  toast.error(`Supabase test failed: ${err?.message ?? String(err)}`);
                } finally {
                  setDiagLoading(false);
                }
              }}
              disabled={diagLoading}
            >
              {diagLoading ? "Testing..." : "Test DB"}
            </Button>
            <Link to="/hospitals/add">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Users className="w-4 h-4 mr-2" />
                Add Hospital
              </Button>
            </Link>
          </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search hospitals by name, country..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Hospitals Table */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">All Hospitals ({hospitals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Active Models</TableHead>
                <TableHead>Participation Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitals.map((hospital) => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell>{hospital.country}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={planColors[hospital.plan as keyof typeof planColors]}>
                      {hospital.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{hospital.activeModels}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${hospital.participation}%` }}
                        />
                      </div>
                      <span className="text-sm">{hospital.participation}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[hospital.status as keyof typeof statusColors]}>
                      {hospital.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link to={`/hospitals/${hospital.id}`}>
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Update Hospital"
                        onClick={() => navigate(`/hospitals/update/${hospital.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete Hospital"
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            hospitalId: hospital.id,
                            hospitalName: hospital.name,
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
