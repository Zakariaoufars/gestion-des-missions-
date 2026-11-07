import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Building,
  Navigation,
  CheckCircle2,
  X,
  Fuel,
} from 'lucide-react';
import { Destination } from '../types/index.ts';

export const DestinationsView: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('TOUS');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [region, setRegion] = useState('Drâa-Tafilalet');
  const [province, setProvince] = useState('Ouarzazate');
  const [commune, setCommune] = useState('');
  const [villeOuLocalite, setVilleOuLocalite] = useState('');
  const [zoneAdministrative, setZoneAdministrative] = useState('Périmètre Agricole Ouarzazate');
  const [distanceAllerKm, setDistanceAllerKm] = useState(45);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/destinations');
      const data = await res.json();
      if (data.destinations) setDestinations(data.destinations);
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          province,
          commune: commune || villeOuLocalite,
          villeOuLocalite,
          zoneAdministrative,
          distanceAllerKm,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setVilleOuLocalite('');
        setCommune('');
        fetchDestinations();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de l\'ajout');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  const provinces = ['TOUS', 'Ouarzazate', 'Zagora', 'Tinghir', 'Errachidia', 'Midelt', 'Marrakech', 'Rabat', 'Agadir'];

  const filtered = destinations.filter((d) => {
    if (selectedProvince !== 'TOUS' && d.province !== selectedProvince) return false;
    const q = search.toLowerCase();
    return (
      d.villeOuLocalite.toLowerCase().includes(q) ||
      d.commune.toLowerCase().includes(q) ||
      d.province.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.zoneAdministrative.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Référentiel Géographique & Destinations du Maroc
          </h2>
          <p className="text-xs text-slate-500">
            Base exhaustive des périmètres de l'ORMVAO, communes de Drâa-Tafilalet et destinations nationales
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Ajouter une Destination</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher ville, commune, province..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold">Province :</span>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
          >
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const allerRetour = d.distanceAllerKm * 2;
          const estLitres = Math.round(((allerRetour * 7.5) / 100) * 1.15 * 10) / 10;
          return (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {d.province}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {d.region}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{d.villeOuLocalite}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Commune: {d.commune}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{d.zoneAdministrative}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Distance depuis siège</span>
                  <span className="font-extrabold text-slate-800">{d.distanceAllerKm} km aller</span>
                  <span className="text-[10px] text-slate-400 ml-1">({allerRetour} km A/R)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Carburant Est.</span>
                  <span className="font-bold text-emerald-700">~{estLitres} L ({Math.round(estLitres * 13)} DH)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Destination Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Ajouter une Destination</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ville ou Localité *
                </label>
                <input
                  type="text"
                  value={villeOuLocalite}
                  onChange={(e) => setVilleOuLocalite(e.target.value)}
                  placeholder="Ex: Palmeraie de M'Hamid, Skoura, Tinghir..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Province *</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Ex: Ouarzazate, Zagora..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commune</label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Ex: Skoura"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Région</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distance Aller (Km)</label>
                  <input
                    type="number"
                    value={distanceAllerKm}
                    onChange={(e) => setDistanceAllerKm(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Administrative</label>
                <input
                  type="text"
                  value={zoneAdministrative}
                  onChange={(e) => setZoneAdministrative(e.target.value)}
                  placeholder="Ex: Périmètre Ounila, Haute Vallée Dadès..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
