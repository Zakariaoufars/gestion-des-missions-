import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Building2,
  Car,
  Users,
  Fuel,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { DashboardStats, Mission } from '../types/index.ts';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
  stats: DashboardStats | null;
  missions: Mission[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ stats, missions }) => {
  const [reportType, setReportType] = useState<'service' | 'vehicle' | 'destination' | 'monthly'>('service');

  if (!stats) return null;

  // Breakdown by Vehicle
  const vehicleBreakdown: Record<string, { missions: number; fuelDh: number; fuelLitres: number }> = {};
  missions.forEach((m) => {
    const v = m.vehicleImmat || 'Non assigné';
    if (!vehicleBreakdown[v]) vehicleBreakdown[v] = { missions: 0, fuelDh: 0, fuelLitres: 0 };
    vehicleBreakdown[v].missions += 1;
    vehicleBreakdown[v].fuelDh += Number(m.montantCarburantDh) || 0;
    vehicleBreakdown[v].fuelLitres += Number(m.quantiteCarburantLitres) || 0;
  });

  // Breakdown by Destination
  const destinationBreakdown: Record<string, { missions: number; fuelDh: number }> = {};
  missions.forEach((m) => {
    const d = m.destination || 'Non spécifié';
    if (!destinationBreakdown[d]) destinationBreakdown[d] = { missions: 0, fuelDh: 0 };
    destinationBreakdown[d].missions += 1;
    destinationBreakdown[d].fuelDh += Number(m.montantCarburantDh) || 0;
  });

  const handleExportStats = () => {
    const ws1 = XLSX.utils.json_to_sheet(
      Object.entries(stats.serviceStats).map(([s, d]) => ({
        Service: s,
        Missions: d.missions,
        'Budget Carburant (DH)': d.fuelDh,
        'Quantité (Litres)': d.fuelLitres,
      }))
    );

    const ws2 = XLSX.utils.json_to_sheet(
      Object.entries(vehicleBreakdown).map(([v, d]) => ({
        Véhicule: v,
        Missions: d.missions,
        'Dépenses Carburant (DH)': d.fuelDh,
        'Quantité (Litres)': d.fuelLitres,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Services');
    XLSX.utils.book_append_sheet(wb, ws2, 'Vehicules');
    XLSX.writeFile(wb, `Rapport_Statistique_ORMVAO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Rapports Analytiques & Gouvernance Carburant
          </h2>
          <p className="text-xs text-slate-500">
            Audit décisionnel des dotations, ratios de consommation par service, véhicule et axe géographique
          </p>
        </div>

        <button
          onClick={handleExportStats}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-amber-300" />
          <span>Exporter Synthèse (Excel)</span>
        </button>
      </div>

      {/* Overview Macro Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Budget Carburant Alloué 2026
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {stats.montantCarburantAttribue.toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-700">DH</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.quantiteCarburantAttribuee} Litres attribués aux agents
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Consommation Réelle Constatée
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {stats.quantiteCarburantConsommee} <span className="text-xs font-bold text-slate-400">Litres</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Mesuré par retours de missions et télématique
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Solde en Réserve & Économies
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {stats.soldeCarburantRestant} <span className="text-xs font-bold text-slate-400">Litres</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            ~{Math.round(stats.soldeCarburantRestant * 13).toLocaleString('fr-FR')} DH préservés
          </span>
        </div>
      </div>

      {/* Tabs Switcher for Reports */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setReportType('service')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            reportType === 'service' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Par Service (SAF, SER, SVOP...)
        </button>
        <button
          onClick={() => setReportType('vehicle')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            reportType === 'vehicle' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Par Véhicule de Flotte
        </button>
        <button
          onClick={() => setReportType('destination')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            reportType === 'destination' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Par Destination & Axe
        </button>
      </div>

      {/* Dynamic Report Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        {reportType === 'service' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Bilan Comparatif par Service de l'ORMVAO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.serviceStats).map(([s, d]) => (
                <div key={s} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{s}</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {d.missions} missions
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Dotation Carburant :</span>
                    <span className="font-black text-slate-900">{d.fuelDh.toLocaleString('fr-FR')} DH</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-xs text-slate-500">
                    <span>Quantité allouée :</span>
                    <span className="font-bold text-slate-700">{d.fuelLitres} Litres</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'vehicle' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Dépenses et Fréquence d'Utilisation par Véhicule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Immatriculation</th>
                    <th className="py-2.5 px-3">Missions Effectuées</th>
                    <th className="py-2.5 px-3">Carburant Alloué (DH)</th>
                    <th className="py-2.5 px-3">Carburant (Litres)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(vehicleBreakdown).map(([v, d]) => (
                    <tr key={v} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{v}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{d.missions}</td>
                      <td className="py-2.5 px-3 font-black text-emerald-900">{d.fuelDh.toLocaleString('fr-FR')} DH</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{d.fuelLitres} L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'destination' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Répartition des Déplacements par Destination
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(destinationBreakdown).map(([dest, d]) => (
                <div key={dest} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-800 text-xs truncate" title={dest}>{dest}</h4>
                  <div className="flex items-center justify-between text-xs mt-2 text-slate-600">
                    <span>{d.missions} mission(s)</span>
                    <span className="font-bold text-emerald-800">{d.fuelDh} DH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
