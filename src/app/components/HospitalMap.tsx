import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Building2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface Hospital {
  id: string;
  name: string;
  city: string;
  lat: number | null;
  lng: number | null;
  status: string;
  subscription_plan?: string;
  models_count?: number;
}

export function HospitalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumCount, setPremiumCount] = useState(0);
  const [standardCount, setStandardCount] = useState(0);

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    try {
      // Fetch hospitals with their subscription plans
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from("hospitals")
        .select(`
          id,
          name,
          city,
          country,
          status,
          plan
        `);

      if (hospitalsError) throw hospitalsError;

      // Get coordinates for each hospital (using city-based geocoding or stored coordinates)
      // For now, we'll use approximate coordinates based on city names
      const cityCoordinates: Record<string, { lat: number; lng: number }> = {
        "Alger": { lat: 36.7372, lng: 3.0886 },
        "Algiers": { lat: 36.7372, lng: 3.0886 },
        "Oran": { lat: 35.6987, lng: -0.6349 },
        "Constantine": { lat: 36.3650, lng: 6.6147 },
        "Annaba": { lat: 36.9000, lng: 7.7667 },
        "Tlemcen": { lat: 34.8828, lng: -1.3167 },
        "Blida": { lat: 36.4703, lng: 2.8277 },
        "Sétif": { lat: 36.1898, lng: 5.4108 },
        "Batna": { lat: 35.5554, lng: 6.1741 },
        "Béjaïa": { lat: 36.7515, lng: 5.0564 },
        "Bejaia": { lat: 36.7515, lng: 5.0564 },
        "Biskra": { lat: 34.8500, lng: 5.7333 },
        "Tizi Ouzou": { lat: 36.7169, lng: 4.0497 },
        "Médéa": { lat: 36.2637, lng: 2.7539 },
        "Medea": { lat: 36.2637, lng: 2.7539 },
        "Djelfa": { lat: 34.6736, lng: 3.2630 },
        "Mostaganem": { lat: 35.9317, lng: 0.0892 },
        "Skikda": { lat: 36.8760, lng: 6.9000 },
        "Guelma": { lat: 36.4621, lng: 7.4328 },
        "Tunis": { lat: 36.8065, lng: 10.1815 },
        "Casablanca": { lat: 33.5731, lng: -7.5898 },
        "Rabat": { lat: 34.0209, lng: -6.8416 },
        "Cairo": { lat: 30.0444, lng: 31.2357 },
        "Alexandria": { lat: 31.2001, lng: 29.9187 },
        "Tripoli": { lat: 32.8872, lng: 13.1913 },
        "Tunisia": { lat: 36.8065, lng: 10.1815 },
        "Morocco": { lat: 34.0209, lng: -6.8416 },
        "Egypt": { lat: 30.0444, lng: 31.2357 },
      };

      // Get model counts for each hospital from local_model_weights
      const { data: weightsData, error: weightsError } = await supabase
        .from("local_model_weights")
        .select("hospital_id");

      if (weightsError) console.error("Error fetching weights:", weightsError);

      const modelCountMap = new Map();
      (weightsData || []).forEach((weight: any) => {
        modelCountMap.set(weight.hospital_id, (modelCountMap.get(weight.hospital_id) || 0) + 1);
      });

      // Get subscription plans
      const { data: subscriptionsData, error: subsError } = await supabase
        .from("hospital_subscriptions")
        .select("hospital_id, plan_id, status");

      if (subsError) console.error("Error fetching subscriptions:", subsError);

      const subscriptionMap = new Map();
      (subscriptionsData || []).forEach((sub: any) => {
        if (sub.status === "active") {
          subscriptionMap.set(sub.hospital_id, sub.plan_id);
        }
      });

      // Enrich hospitals with coordinates, model counts, and subscription info
      const enrichedHospitals = (hospitalsData || []).map((hospital: any) => {
        const cityName = hospital.city || hospital.country || "Alger";
        const coords = cityCoordinates[cityName] || cityCoordinates["Alger"];
        const subscription = subscriptionMap.get(hospital.id) || hospital.plan || "free";
        
        return {
          id: hospital.id,
          name: hospital.name,
          city: hospital.city || "Unknown",
          lat: coords?.lat || null,
          lng: coords?.lng || null,
          status: hospital.status === "active" ? "active" : "inactive",
          subscription_plan: subscription,
          models_count: modelCountMap.get(hospital.id) || 0,
        };
      }).filter((h: Hospital) => h.lat && h.lng); // Only include hospitals with coordinates

      setHospitals(enrichedHospitals);
      
      // Count premium vs standard
      const premium = enrichedHospitals.filter((h: Hospital) => 
        h.subscription_plan === "premium" || h.subscription_plan === "Premium"
      ).length;
      const standard = enrichedHospitals.filter((h: Hospital) => 
        h.subscription_plan === "standard" || h.subscription_plan === "Standard"
      ).length;
      
      setPremiumCount(premium);
      setStandardCount(standard);

    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (loading || hospitals.length === 0 || mapInstanceRef.current || !mapRef.current) return;

    // Dynamically load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as any).L;
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [28.0339, 1.6596],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Dark-style tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Create marker icon based on subscription plan
      const createIcon = (plan: string) => {
        const isPremium = plan === "premium" || plan === "Premium";
        const color = isPremium ? "#10b981" : "#3b82f6";
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 32 40">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${color}" flood-opacity="0.6"/>
              </filter>
            </defs>
            <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24C32 7.164 24.836 0 16 0z"
              fill="${color}" filter="url(#shadow)" opacity="0.95"/>
            <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
            <text x="16" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">🏥</text>
          </svg>`;
        return L.divIcon({
          html: svg,
          className: "",
          iconSize: [34, 42],
          iconAnchor: [17, 42],
          popupAnchor: [0, -44],
        });
      };

      // Add markers for each hospital
      hospitals.forEach((hospital) => {
        if (!hospital.lat || !hospital.lng) return;
        
        const marker = L.marker([hospital.lat, hospital.lng], {
          icon: createIcon(hospital.subscription_plan || "free"),
        });

        const isPremium = hospital.subscription_plan === "premium" || hospital.subscription_plan === "Premium";
        
        marker.bindPopup(`
          <div style="
            font-family: 'Segoe UI', sans-serif;
            min-width: 220px;
            padding: 6px 2px;
          ">
            <div style="
              font-weight: 700;
              font-size: 15px;
              color: #111827;
              margin-bottom: 6px;
              border-bottom: 2px solid ${isPremium ? "#10b981" : "#3b82f6"};
              padding-bottom: 4px;
            ">${hospital.name}</div>
            <div style="
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              📍 ${hospital.city}
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span style="
                background: ${isPremium ? "#d1fae5" : "#dbeafe"};
                color: ${isPremium ? "#065f46" : "#1e40af"};
                padding: 3px 10px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 600;
              ">
                ${isPremium ? "⭐ Premium" : "📘 Standard"}
              </span>
              <span style="
                background: #f3f4f6;
                color: #374151;
                padding: 3px 10px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                🧠 ${hospital.models_count} model${hospital.models_count !== 1 ? "s" : ""}
              </span>
              <span style="
                background: ${hospital.status === "active" ? "#d1fae5" : "#fee2e2"};
                color: ${hospital.status === "active" ? "#065f46" : "#991b1b"};
                padding: 3px 10px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 600;
              ">
                ${hospital.status === "active" ? "🟢 Active" : "🔴 Inactive"}
              </span>
            </div>
          </div>
        `, {
          maxWidth: 280,
          className: "hospital-popup",
        });

        marker.addTo(map);
      });

      // Add popup styles
      const style = document.createElement("style");
      style.textContent = `
        .hospital-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          border: 1px solid #e5e7eb;
          padding: 0;
          background: white;
        }
        .hospital-popup .leaflet-popup-content {
          margin: 14px 18px;
        }
        .hospital-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom a {
          background: #1f2937 !important;
          color: #fff !important;
          border-color: #374151 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #374151 !important;
        }
      `;
      document.head.appendChild(style);
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, hospitals]);

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Global Hospital Network
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-gray-500">Loading hospital locations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Global Hospital Network
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-gray-600 dark:text-gray-400">Premium ({premiumCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-gray-600 dark:text-gray-400">Standard ({standardCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
              <span className="text-gray-600 dark:text-gray-400">
                Total ({hospitals.length})
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Showing {hospitals.length} hospitals with active subscriptions
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          className="w-full rounded-b-xl overflow-hidden"
          style={{ height: "480px" }}
        />
      </CardContent>
    </Card>
  );
}