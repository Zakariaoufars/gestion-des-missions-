import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Car,
  Fuel,
  Navigation,
  Settings2,
  RefreshCw,
  Gauge,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import { GpsVehicleTelemetry } from '../types/index.ts';

export const GpsTrackingView: React.FC = () => {
  const [vehicles, setVehicles] = useState<GpsVehicleTelemetry[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<GpsVehicleTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Map container reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    fetchVehiclesGps();
    const interval = setInterval(() => {
      if (isLiveActive) {
        fetchVehiclesGps(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const fetchVehiclesGps = async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      const res = await fetch('/api/gps/vehicles');
      const data = await res.json();
      if (data.vehicles) {
        setVehicles(data.vehicles);
        if (!selectedVehicle && data.vehicles.length > 0) {
          setSelectedVehicle(data.vehicles[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch GPS telematics:', err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  // Initialize or update Leaflet interactive map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Load leaflet from window (included via link/script in index.html)
    const initLeaflet = async () => {
      const L = (window as any).L;
      if (!L) {
        // Dynamic import fallback
        const leafletModule = await import('leaflet');
        setupMap(leafletModule.default || leafletModule);
      } else {
        setupMap(L);
      }
    };

    const setupMap = (L: any) => {
      if (!mapContainerRef.current) return;

      if (!leafletMapInstanceRef.current) {
        // Centered on Ouarzazate & Drâa-Tafilalet Region [30.9238, -6.9142]
        const map = L.map(mapContainerRef.current).setView([30.9238, -6.9142], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap - Télématique ORMVAO Ouarzazate',
        }).addTo(map);

        leafletMapInstanceRef.current = map;
      }

      const map = leafletMapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      // Add pins for all vehicles
      vehicles.forEach((v) => {
        const isSelected = selectedVehicle?.immatriculation === v.immatriculation;
        const isMoving = v.vitesse > 0;

        const customIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div style="
              background-color: ${isMoving ? '#047857' : isSelected ? '#1e293b' : '#0284c7'};
              color: white;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              border: 2px solid white;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <span style="font-size: 12px;">🚗</span>
              <span>${v.immatriculation}</span>
              ${v.vitesse > 0 ? `<span style="background: #eab308; color: #000; padding: 1px 3px; border-radius: 4px; font-size: 8px;">${v.vitesse} km/h</span>` : ''}
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        });

        const marker = L.marker([v.latitude, v.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedVehicle(v);
        });

        markersRef.current[v.immatriculation] = marker;
      });
    };

    initLeaflet();
  }, [vehicles]);

  // Pan to selected vehicle
  const handleSelectVehicle = (veh: GpsVehicleTelemetry) => {
    setSelectedVehicle(veh);
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([veh.latitude, veh.longitude], 12, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner with Connecteur Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Système de Géolocalisation & Télématique Flotte
            </h2>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Connecteur GPS Prêt (API REST & Webhooks)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cartographie temps réel du Drâa-Tafilalet et suivi des vitesses, compteurs et consommations mesurées
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchVehiclesGps(true)}
            className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Rafraîchir les positions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-emerald-700" />
            <span>Paramètres Fournisseur GPS</span>
          </button>
        </div>
      </div>

      {/* Main Map & Telemetry Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Side: Vehicle List & Live Telemetry Inspector */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Véhicules Monitorés ({vehicles.length})
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Live télématique
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {vehicles.map((v) => {
                const isSelected = selectedVehicle?.immatriculation === v.immatriculation;
                return (
                  <div
                    key={v.immatriculation}
                    onClick={() => handleSelectVehicle(v)}
                    className={`pt-2 pb-1 px-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border border-emerald-300'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            v.vitesse > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-extrabold text-xs text-slate-800">
                          {v.immatriculation}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          v.disponibilite === 'En mission'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {v.disponibilite}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{v.marqueModele}</span>
                      <span className="font-bold text-slate-700">
                        {v.vitesse > 0 ? `${v.vitesse} km/h` : 'À l\'arrêt'}
                      </span>
                    </div>

                    {v.missionActive && (
                      <div className="mt-1.5 p-1.5 bg-amber-50/80 rounded border border-amber-200 text-[10px] text-amber-900">
                        <span className="font-bold">{v.missionActive.numeroMission}</span> • {v.missionActive.employe} ({v.missionActive.destination})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Vehicle Telemetry Card */}
          {selectedVehicle && (
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-2 mb-3">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Boîtier Télématique : {selectedVehicle.identifiantGps}
                  </span>
                  <h4 className="text-base font-black tracking-tight">{selectedVehicle.immatriculation}</h4>
                  <p className="text-xs text-emerald-200">{selectedVehicle.marqueModele}</p>
                </div>
                <div className="p-2 bg-emerald-800/80 rounded-xl">
                  <Gauge className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-300 block">Vitesse Instantanée</span>
                  <span className="text-lg font-bold">
                    {selectedVehicle.vitesse} <span className="text-xs font-normal">km/h</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 block">Kilométrage Compteur</span>
                  <span className="text-lg font-bold">
                    {selectedVehicle.kilometrage.toLocaleString('fr-FR')} <span className="text-xs font-normal">km</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 block">Niveau Réservoir</span>
                  <span className="font-bold text-amber-300">{selectedVehicle.niveauReservoir}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 block">Consommation Mesurée</span>
                  <span className="font-bold text-white">
                    {selectedVehicle.consoReelleGps || selectedVehicle.consoTheorique} L/100km
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-800/80 text-[10px] text-emerald-200">
                <span className="font-semibold text-white">Localisation :</span> {selectedVehicle.statutTelemetrie}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Leaflet Interactive Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[520px]">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Carte Télématique du Maroc • Région Drâa-Tafilalet</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Zoom: Ouarzazate • Skoura • Kalaat M'gouna • Zagora • Tinghir
            </span>
          </div>

          <div
            ref={mapContainerRef}
            className="flex-1 w-full h-[480px] z-10"
            style={{ minHeight: '480px' }}
          />
        </div>
      </div>

      {/* GPS Provider Connection Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Connecteur GPS & Télématique</h3>
                <p className="text-xs text-emerald-300">Intégration API REST et Webhooks</p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Connecteur Télématique Multi-Fournisseurs ORMVAO
                </p>
                <p className="text-[11px] mt-1 text-emerald-800">
                  L'architecture est entièrement prête pour recevoir les trames JSON des plateformes télématiques telles que <strong>Teltonika, Ruptela, Webfleet, Traccar ou Meitrack</strong>.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom du Fournisseur GPS
                </label>
                <input
                  type="text"
                  defaultValue="Plateforme Télématique Flotte ORMVAO"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Endpoint API REST (Polling des positions)
                </label>
                <input
                  type="text"
                  defaultValue="https://telematics.ormvao.gov.ma/api/v2/vehicles/telemetry"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-700 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Webhook URL (Événements de départ, arrêts, carburant)
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://ormvao-flotte.gov.ma/api/gps/webhook"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clé d'API / Bearer Token
                </label>
                <input
                  type="password"
                  defaultValue="orm_live_token_98471203498124098"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-700 text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Configuration télématique sauvegardée avec succès.');
                    setShowConfigModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
