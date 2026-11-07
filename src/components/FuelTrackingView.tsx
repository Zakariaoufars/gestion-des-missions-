import React, { useState, useEffect } from 'react';
import {
  Fuel,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Gauge,
  Car,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface LedgerItem {
  id: number;
  numeroMission: string;
  employeeNom: string;
  employeeMatricule: string;
  service: string;
  destination: string;
  vehicleImmat: string;
  vehicleMarqueModele: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  montantCarburantDh: number;
  quantiteAttribuee: number;
  niveauInitial: string;
  niveauFinal: string;
  quantiteConsommee: number;
  soldeLitres: number;
  kmInitial: number;
  kmFinal: any;
  distanceParcourue: number;
  consoTheorique: number;
  consoMoyenne: number;
  ecartTheorique: number;
  alerte: string | null;
}

export const FuelTrackingView: React.FC = () => {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fuel/ledger');
      const data = await res.json();
      if (data.ledger) {
        setLedger(data.ledger);
      }
    } catch (err) {
      console.error('Failed to load fuel ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ledger.filter((item) => {
    if (filterAlertOnly && !item.alerte) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.numeroMission.toLowerCase().includes(q) ||
        item.employeeNom.toLowerCase().includes(q) ||
        item.vehicleImmat.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Aggregated totals
  let totalAttribue = 0;
  let totalConsomme = 0;
  let totalDistance = 0;
  let totalAnomalies = 0;

  ledger.forEach((it) => {
    totalAttribue += it.quantiteAttribuee;
    totalConsomme += it.quantiteConsommee;
    totalDistance += it.distanceParcourue;
    if (it.alerte) totalAnomalies++;
  });

  const totalSolde = Math.round((totalAttribue - totalConsomme) * 10) / 10;
  const overallConsoMoyenne =
    totalDistance > 0 ? Math.round((totalConsomme / totalDistance) * 100 * 10) / 10 : 0;

  const handleExportExcel = () => {
    const data = filtered.map((it) => ({
      'N° Mission': it.numeroMission,
      'Employé': it.employeeNom,
      'Service': it.service,
      'Destination': it.destination,
      'Véhicule': it.vehicleImmat,
      'Modèle': it.vehicleMarqueModele,
      'Dotation (DH)': it.montantCarburantDh,
      'Dotation (Litres)': it.quantiteAttribuee,
      'Niveau Réservoir Départ': it.niveauInitial,
      'Niveau Réservoir Retour': it.niveauFinal,
      'Quantité Réellement Consommée (L)': it.quantiteConsommee,
      'Solde Restant (L)': it.soldeLitres,
      'Km Initial': it.kmInitial,
      'Km Final': it.kmFinal,
      'Distance Parcourue (km)': it.distanceParcourue,
      'Conso Théorique (L/100km)': it.consoTheorique,
      'Conso Réelle Moyenne (L/100km)': it.consoMoyenne,
      'Écart Théorique (L/100km)': it.ecartTheorique,
      'Alerte / Anomalie': it.alerte || 'Conforme',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Suivi_Carburant_ORMVAO');
    XLSX.writeFile(wb, `Bilan_Carburant_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Suivi Rigoureux & Contrôle du Carburant
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Formules Télématiques Automatiques
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit des dotations, rapprochement des consommations réelles et détection proactive des anomalies
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-amber-300" />
          <span>Exporter le Bilan Carburant (Excel)</span>
        </button>
      </div>

      {/* KPI Cards for Fuel Control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dotation Carburant Totale</span>
            <Fuel className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-slate-800">
            {Math.round(totalAttribue * 10) / 10} <span className="text-xs font-semibold text-slate-400">Litres</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Alloué via bons administratifs
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quantité Réellement Consommée</span>
            <TrendingDown className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-slate-800">
            {Math.round(totalConsomme * 10) / 10} <span className="text-xs font-semibold text-slate-400">Litres</span>
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            Pour {totalDistance.toLocaleString('fr-FR')} km parcourus
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Solde Carburant Restant</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">
            {totalSolde} <span className="text-xs font-semibold text-slate-400">Litres</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            Économie / Stock disponible
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consommation Moyenne Flotte</span>
            <Gauge className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-slate-800">
            {overallConsoMoyenne} <span className="text-xs font-semibold text-slate-400">L/100km</span>
          </p>
          <span className="text-[10px] text-slate-500 font-medium">
            Formule: (Quantité / Distance) × 100
          </span>
        </div>
      </div>

      {/* Filter and Anomaly Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher véhicule, mission, employé..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={filterAlertOnly}
              onChange={(e) => setFilterAlertOnly(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <span>Afficher uniquement les anomalies ({totalAnomalies})</span>
          </label>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Mission & Véhicule</th>
                <th className="py-3 px-3.5">Employé & Service</th>
                <th className="py-3 px-3.5">Destination</th>
                <th className="py-3 px-3.5">Dotation (DH / L)</th>
                <th className="py-3 px-3.5">Niveau Réservoir</th>
                <th className="py-3 px-3.5">Km Compteur</th>
                <th className="py-3 px-3.5">Consommé Réel</th>
                <th className="py-3 px-3.5">Solde Restant</th>
                <th className="py-3 px-3.5">Moyenne L/100km</th>
                <th className="py-3 px-3.5 text-right">Contrôle & Anomalie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Chargement du journal carburant...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Aucun enregistrement ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-emerald-900">{it.numeroMission}</div>
                      <div className="text-[10px] font-semibold text-slate-700">{it.vehicleImmat}</div>
                      <span className="text-[9px] text-slate-400">{it.vehicleMarqueModele}</span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800">{it.employeeNom}</div>
                      <span className="text-[10px] text-slate-500 font-bold">{it.service}</span>
                    </td>

                    <td className="py-3 px-3.5 max-w-[160px] truncate" title={it.destination}>
                      <span className="font-medium text-slate-700">{it.destination}</span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{it.montantCarburantDh} DH</span>
                      <span className="block text-[10px] text-slate-500">{it.quantiteAttribuee} Litres</span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400">Départ:</span>{' '}
                        <span className="font-bold text-slate-700">{it.niveauInitial}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Retour:</span>{' '}
                        <span className="font-bold text-slate-700">{it.niveauFinal}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-[11px]">
                      <div>{it.kmInitial.toLocaleString('fr-FR')} → {it.kmFinal ? it.kmFinal.toLocaleString('fr-FR') : 'En cours'}</div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {it.distanceParcourue > 0 ? `${it.distanceParcourue} km` : '-'}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-800">
                      {it.quantiteConsommee > 0 ? `${it.quantiteConsommee} L` : '-'}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          it.soldeLitres < 0
                            ? 'text-rose-600'
                            : it.soldeLitres > 0
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {it.soldeLitres > 0 ? `+${it.soldeLitres}` : it.soldeLitres} L
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {it.consoMoyenne > 0 ? (
                        <div>
                          <span className="font-bold text-slate-800">{it.consoMoyenne} L</span>
                          <span className="block text-[9px] text-slate-400">
                            Théorique: {it.consoTheorique} L
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {it.alerte ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span title={it.alerte} className="max-w-[180px] truncate">
                            {it.alerte}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Conforme</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
