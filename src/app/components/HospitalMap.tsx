import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Building2 } from "lucide-react";

const hospitals = [
  { id: 1, name: "CHU Mustapha Pacha", city: "Alger", lat: 36.7372, lng: 3.0886, status: "Premium", models: 5 },
  { id: 2, name: "CHU Beni Messous", city: "Alger", lat: 36.7539, lng: 3.0021, status: "Premium", models: 4 },
  { id: 3, name: "CHU Oran", city: "Oran", lat: 35.6987, lng: -0.6349, status: "Premium", models: 3 },
  { id: 4, name: "CHU Constantine", city: "Constantine", lat: 36.3650, lng: 6.6147, status: "Premium", models: 4 },
  { id: 5, name: "CHU Annaba", city: "Annaba", lat: 36.9000, lng: 7.7667, status: "Standard", models: 2 },
  { id: 6, name: "CHU Tlemcen", city: "Tlemcen", lat: 34.8828, lng: -1.3167, status: "Standard", models: 2 },
  { id: 7, name: "EHU Oran", city: "Oran", lat: 35.7200, lng: -0.6100, status: "Premium", models: 3 },
  { id: 8, name: "CHU Blida", city: "Blida", lat: 36.4703, lng: 2.8277, status: "Standard", models: 2 },
  { id: 9, name: "CHU Sétif", city: "Sétif", lat: 36.1898, lng: 5.4108, status: "Standard", models: 1 },
  { id: 10, name: "CHU Batna", city: "Batna", lat: 35.5554, lng: 6.1741, status: "Standard", models: 2 },
  { id: 11, name: "CHU Béjaïa", city: "Béjaïa", lat: 36.7515, lng: 5.0564, status: "Standard", models: 1 },
  { id: 12, name: "CHU Biskra", city: "Biskra", lat: 34.8500, lng: 5.7333, status: "Standard", models: 1 },
  { id: 13, name: "CHU Tizi Ouzou", city: "Tizi Ouzou", lat: 36.7169, lng: 4.0497, status: "Premium", models: 3 },
  { id: 14, name: "CHU Médéa", city: "Médéa", lat: 36.2637, lng: 2.7539, status: "Standard", models: 1 },
  { id: 15, name: "CHU Djelfa", city: "Djelfa", lat: 34.6736, lng: 3.2630, status: "Standard", models: 1 },
  { id: 16, name: "CHU Mostaganem", city: "Mostaganem", lat: 35.9317, lng: 0.0892, status: "Standard", models: 1 },
  { id: 17, name: "CHU Skikda", city: "Skikda", lat: 36.8760, lng: 6.9000, status: "Standard", models: 1 },
  { id: 18, name: "CHU Guelma", city: "Guelma", lat: 36.4621, lng: 7.4328, status: "Standard", models: 1 },
];

export function HospitalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

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

      // Custom marker icons
      const createIcon = (isPremium: boolean) => {
        const color = isPremium ? "#10b981" : "#3b82f6";
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
              </filter>
            </defs>
            <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24C32 7.164 24.836 0 16 0z"
              fill="${color}" filter="url(#shadow)" opacity="0.95"/>
            <circle cx="16" cy="16" r="8" fill="white" opacity="0.95"/>
            <text x="16" y="20" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}">+</text>
          </svg>`;
        return L.divIcon({
          html: svg,
          className: "",
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -42],
        });
      };

      // Add markers
      hospitals.forEach((h) => {
        const marker = L.marker([h.lat, h.lng], {
          icon: createIcon(h.status === "Premium"),
        });

        marker.bindPopup(`
          <div style="
            font-family: 'Segoe UI', sans-serif;
            min-width: 200px;
            padding: 4px;
          ">
            <div style="
              font-weight: 700;
              font-size: 14px;
              color: #111827;
              margin-bottom: 4px;
            ">${h.name}</div>
            <div style="
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
            ">📍 ${h.city}</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span style="
                background: ${h.status === "Premium" ? "#d1fae5" : "#dbeafe"};
                color: ${h.status === "Premium" ? "#065f46" : "#1e40af"};
                padding: 2px 8px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 600;
              ">${h.status}</span>
              <span style="
                background: #f3f4f6;
                color: #374151;
                padding: 2px 8px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 600;
              ">🧠 ${h.models} model${h.models > 1 ? "s" : ""}</span>
            </div>
          </div>
        `, {
          maxWidth: 240,
          className: "hospital-popup",
        });

        marker.addTo(map);
      });

      // Add popup styles
      const style = document.createElement("style");
      style.textContent = `
        .hospital-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          border: 1px solid #e5e7eb;
          padding: 0;
        }
        .hospital-popup .leaflet-popup-content {
          margin: 12px 16px;
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
  }, []);

  const premiumCount = hospitals.filter((h) => h.status === "Premium").length;
  const standardCount = hospitals.filter((h) => h.status === "Standard").length;

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          className="w-full rounded-b-xl overflow-hidden"
          style={{ height: "450px" }}
        />
      </CardContent>
    </Card>
  );
}
