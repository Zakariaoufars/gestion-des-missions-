import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Fuel,
  Gauge,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Vehicle } from '../types/index.ts';
import * as XLSX from 'xlsx';

export const VehiclesView: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [immatriculation, setImmatriculation] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [typeVehicule, setTypeVehicule] = useState('Pick-up 4x4');
  const [typeCarburant, setTypeCarburant] = useState('Diesel');
  const [consoTheorique, setConsoTheorique] = useState('7.5');
  const [kilometrage, setKilometrage] = useState(50000);
  const [identifiantGps, setIdentifiantGps] = useState('');
  const [etatVehicule, setEtatVehicule] = useState('Bon');
  const [disponibilite, setDisponibilite] = useState('Disponible');
  const [niveauReservoirActuel, setNiveauReservoirActuel] = useState('1/2');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      if (data.vehicles) setVehicles(data.vehicles);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setImmatriculation('');
    setMarque('Toyota');
    setModele('Hilux 4x4');
    setTypeVehicule('Pick-up 4x4');
    setTypeCarburant('Diesel');
    setConsoTheorique('8.5');
    setKilometrage(85000);
    setIdentifiantGps(`GPS-ORM-${Math.floor(100 + Math.random() * 900)}`);
    setEtatVehicule('Bon');
    setDisponibilite('Disponible');
    setNiveauReservoirActuel('1/2');
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setImmatriculation(v.immatriculation);
    setMarque(v.marque);
    setModele(v.modele);
    setTypeVehicule(v.typeVehicule);
    setTypeCarburant(v.typeCarburant);
    setConsoTheorique(String(v.consoTheorique));
    setKilometrage(v.kilometrage);
    setIdentifiantGps(v.identifiantGps || '');
    setEtatVehicule(v.etatVehicule);
    setDisponibilite(v.disponibilite);
    setNiveauReservoirActuel(v.niveauReservoirActuel || '1/2');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        immatriculation,
        marque,
        modele,
        typeVehicule,
        typeCarburant,
        consoTheorique,
        kilometrage,
        identifiantGps,
        etatVehicule,
        disponibilite,
        niveauReservoirActuel,
      };

      let res;
      if (editingVehicle) {
        res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchVehicles();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule du parc ?')) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVehicles();
      } else {
        const d = await res.json();
        alert(d.error || 'Impossible de supprimer');
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleExportExcel = () => {
    const data = vehicles.map((v) => ({
      'Immatriculation': v.immatriculation,
      'Marque': v.marque,
      'Modèle': v.modele,
      'Type': v.typeVehicule,
      'Carburant': v.typeCarburant,
      'Consommation Théorique (L/100km)': v.consoTheorique,
      'Consommation Réelle GPS (L/100km)': v.consoReelleGps || '',
      'Kilométrage Compteur': v.kilometrage,
      'Identifiant GPS': v.identifiantGps || '',
      'État': v.etatVehicule,
      'Disponibilité': v.disponibilite,
      'Niveau Réservoir Actuel': v.niveauReservoirActuel,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parc_Vehicules_ORMVAO');
    XLSX.writeFile(wb, `Parc_Vehicules_ORMVAO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.immatriculation.toLowerCase().includes(q) ||
      v.marque.toLowerCase().includes(q) ||
      v.modele.toLowerCase().includes(q) ||
      v.typeVehicule.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Gestion du Parc Automobile ORMVAO
          </h2>
          <p className="text-xs text-slate-500">
            Fiches techniques des 4x4, pick-ups, suivi des kilométrages et statuts de disponibilité
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exporter Excel</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Ajouter un Véhicule</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher immatriculation, marque, modèle..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 text-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 font-black text-xs border border-emerald-200">
                  {v.immatriculation}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.disponibilite === 'Disponible'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {v.disponibilite}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900">
                {v.marque} {v.modele}
              </h3>
              <p className="text-xs text-slate-500">{v.typeVehicule} • {v.typeCarburant}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Compteur Km</span>
                  <span className="font-bold text-slate-800">
                    {v.kilometrage.toLocaleString('fr-FR')} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Norme Conso</span>
                  <span className="font-bold text-slate-800">{v.consoTheorique} L/100km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Boîtier GPS</span>
                  <span className="font-bold text-emerald-800">{v.identifiantGps || 'Actif'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Niveau Réservoir</span>
                  <span className="font-bold text-amber-700">{v.niveauReservoirActuel || '1/2'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(v)}
                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-950 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingVehicle ? 'Modifier Véhicule' : 'Nouveau Véhicule'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Immatriculation *
                  </label>
                  <input
                    type="text"
                    value={immatriculation}
                    onChange={(e) => setImmatriculation(e.target.value)}
                    placeholder="Ex: 14285-WW-68"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Type de Véhicule *
                  </label>
                  <select
                    value={typeVehicule}
                    onChange={(e) => setTypeVehicule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Pick-up 4x4">Pick-up 4x4</option>
                    <option value="Tout-terrain">Tout-terrain (4x4)</option>
                    <option value="Utilitaire">Utilitaire</option>
                    <option value="Berline">Berline de service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marque *</label>
                  <input
                    type="text"
                    value={marque}
                    onChange={(e) => setMarque(e.target.value)}
                    placeholder="Ex: Toyota, Dacia..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modèle *</label>
                  <input
                    type="text"
                    value={modele}
                    onChange={(e) => setModele(e.target.value)}
                    placeholder="Ex: Hilux, Duster..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kilométrage</label>
                  <input
                    type="number"
                    value={kilometrage}
                    onChange={(e) => setKilometrage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Norme L/100km</label>
                  <input
                    type="text"
                    value={consoTheorique}
                    onChange={(e) => setConsoTheorique(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Boîtier GPS</label>
                  <input
                    type="text"
                    value={identifiantGps}
                    onChange={(e) => setIdentifiantGps(e.target.value)}
                    placeholder="Ex: GPS-ORM-042"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disponibilité</label>
                  <select
                    value={disponibilite}
                    onChange={(e) => setDisponibilite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En mission">En mission</option>
                    <option value="En panne">En panne</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">État</label>
                  <select
                    value={etatVehicule}
                    onChange={(e) => setEtatVehicule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Bon">Bon</option>
                    <option value="En maintenance">En maintenance</option>
                    <option value="Hors service">Hors service</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Réservoir</label>
                  <select
                    value={niveauReservoirActuel}
                    onChange={(e) => setNiveauReservoirActuel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="1/8">1/8</option>
                    <option value="1/4">1/4</option>
                    <option value="1/2">1/2</option>
                    <option value="3/4">3/4</option>
                    <option value="1/1">1/1</option>
                  </select>
                </div>
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
