import React from 'react';
import {
  Users,
  Car,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  Fuel,
  TrendingDown,
  AlertTriangle,
  FileText,
  MapPin,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { DashboardStats, Mission } from '../types/index.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentMissions: Mission[];
  onOpenNewMission: () => void;
  onSelectMissionDocs: (mission: Mission) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentMissions,
  onOpenNewMission,
  onSelectMissionDocs,
  onNavigateTab,
}) => {
  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Chargement des données du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle Moroccan background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950 uppercase tracking-wider">
                Espace Décisionnel
              </span>
              <span className="text-xs text-emerald-300">
                Drâa-Tafilalet • Ouarzazate
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Office Régional de Mise en Valeur Agricole de Ouarzazate
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Plateforme centralisée d'automatisation des ordres de mission, génération des bons administratifs, suivi télématique GPS et contrôle rigoureux des consommations de carburant.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewMission}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>+ Créer un Ordre de Mission</span>
            </button>
            <button
              onClick={() => onNavigateTab('gps')}
              className="px-3.5 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              <span>Carte Flotte GPS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Anomalies Alert Banner if any */}
      {stats.anomaliesCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-900">
                {stats.anomaliesCount} Anomalie(s) de consommation ou déplacement constatée(s)
              </h4>
              <button
                onClick={() => onNavigateTab('fuel')}
                className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Examiner dans le module Carburant</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Des écarts de consommation au-delà de la norme constructeur ou des anomalies de parcours ont été signalés par le suivi télématique.
            </p>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (All required figures) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Employés */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Employés</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.totalEmployees}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Cadres & techniciens</span>
        </div>

        {/* Total Véhicules */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Véhicules</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.totalVehicles}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
            <span className="text-emerald-600 font-bold">{stats.vehiculesDisponibles} dispo</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{stats.vehiculesEnMission} en mission</span>
          </div>
        </div>

        {/* Missions Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Missions Totales</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.totalMissions}</p>
          <span className="text-[10px] text-slate-500 font-medium">{stats.missionsValidees} validées prêtes</span>
        </div>

        {/* Missions En Cours */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">En Cours</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.missionsEnCours}</p>
          <span className="text-[10px] text-slate-500 font-medium">Sur le terrain</span>
        </div>

        {/* Missions Exécutées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Exécutées</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.missionsExecutees}</p>
          <span className="text-[10px] text-slate-500 font-medium">Bilan clôturé</span>
        </div>

        {/* Missions Non Exécutées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Non Exécutées</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{stats.missionsNonExecutees}</p>
          <span className="text-[10px] text-slate-500 font-medium">Annulées / reportées</span>
        </div>
      </div>

      {/* Fuel Summary Metric Row (DH, Consumed, Remaining) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Carburant Attribué DH */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Budget Carburant Attribué</span>
            <Fuel className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black">{stats.montantCarburantAttribue.toLocaleString('fr-FR')}</span>
            <span className="text-xs font-bold text-amber-300">DH</span>
          </div>
          <p className="text-[11px] text-emerald-200 mt-2">
            Équivalent à {stats.quantiteCarburantAttribuee} Litres alloués
          </p>
        </div>

        {/* Quantité Consommée */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Carburant Consommé</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{stats.quantiteCarburantConsommee}</span>
            <span className="text-xs font-bold text-slate-500">Litres</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{
                width: `${Math.min(100, (stats.quantiteCarburantConsommee / (stats.quantiteCarburantAttribuee || 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Taux de consommation: {stats.quantiteCarburantAttribuee > 0 ? Math.round((stats.quantiteCarburantConsommee / stats.quantiteCarburantAttribuee) * 100) : 0}%
          </p>
        </div>

        {/* Solde Restant */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Solde Carburant Restant</span>
            <Fuel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-black text-emerald-700">{stats.soldeCarburantRestant}</span>
            <span className="text-xs font-bold text-slate-500">Litres</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Soit ~{(stats.soldeCarburantRestant * 13).toLocaleString('fr-FR')} DH d'économies ou dotations en réserve
          </p>
        </div>

        {/* Anomalies */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Anomalies de Conso</span>
            <AlertTriangle className={`w-4 h-4 ${stats.anomaliesCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl md:text-3xl font-black ${stats.anomaliesCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {stats.anomaliesCount}
            </span>
            <span className="text-xs font-bold text-slate-500">Cas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {stats.anomaliesCount > 0 ? 'Écart consommation GPS vs théorique' : 'Toutes les consommations sont régulières'}
          </p>
        </div>
      </div>

      {/* Analytical Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Évolution Mensuelle des Missions & Consommation Carburant
              </h3>
              <p className="text-xs text-slate-500">Mois d'activité ORMVAO</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
              Exercice 2026
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-slate-100">
            {stats.monthlyStats.map((item, i) => {
              const maxFuel = 25000;
              const heightPct = Math.min(100, Math.max(15, (item.fuelDh / maxFuel) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.fuelDh.toLocaleString('fr-FR')} DH
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg flex flex-col justify-end p-0.5 relative h-40">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-800 to-emerald-600 rounded-t-md transition-all group-hover:from-emerald-700 group-hover:to-emerald-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-slate-700">{item.month}</span>
                    <span className="block text-[9px] text-slate-400 font-medium">{item.missions} miss.</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-emerald-700" />
              <span>Budget Carburant (DH)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Nombre de missions validées</span>
            </div>
          </div>
        </div>

        {/* Consommation par Service */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Répartition par Service</h3>
                <p className="text-xs text-slate-500">Dotation carburant par entité</p>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Détails
              </button>
            </div>

            <div className="space-y-3.5">
              {Object.entries(stats.serviceStats).map(([svc, data]) => {
                const totalFuel = stats.montantCarburantAttribue || 1;
                const pct = Math.round((data.fuelDh / totalFuel) * 100);
                const colors: Record<string, string> = {
                  SAF: 'bg-blue-600',
                  SER: 'bg-emerald-600',
                  SVOP: 'bg-amber-500',
                  SAAF: 'bg-purple-600',
                  Direction: 'bg-slate-700',
                };
                return (
                  <div key={svc}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-700">{svc}</span>
                      <span className="text-slate-500 font-medium">
                        {data.fuelDh.toLocaleString('fr-FR')} DH ({data.missions} missions)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${colors[svc] || 'bg-emerald-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Principe ERP :</span> Une seule saisie initiale génère l'ordre de mission A5, le bon de sortie interne A5 et la demande de fourniture A5, sans aucune ressaisie.
          </div>
        </div>
      </div>

      {/* Recent Missions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Derniers Ordres de Mission Enregistrés
            </h3>
            <p className="text-xs text-slate-500">
              Missions récentes et statut des documents administratifs
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('missions')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Voir toutes les missions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">N° Mission</th>
                <th className="py-3 px-4">Employé</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Carburant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMissions.slice(0, 5).map((m) => {
                const statusStyles: Record<string, string> = {
                  'Brouillon': 'bg-slate-100 text-slate-700',
                  'En attente de validation': 'bg-amber-100 text-amber-800 border-amber-200',
                  'Validée': 'bg-blue-100 text-blue-800 border-blue-200',
                  'En cours': 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse',
                  'Exécutée': 'bg-teal-100 text-teal-800 border-teal-200',
                  'Clôturée': 'bg-slate-200 text-slate-800 border-slate-300',
                  'Non exécutée': 'bg-rose-100 text-rose-800 border-rose-200',
                };
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-900 whitespace-nowrap">
                      {m.numeroMission}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{m.employeeNom}</div>
                      <span className="text-[10px] text-slate-400">{m.employeeMatricule}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{m.service}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate" title={m.destination}>
                      {m.destination}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{m.vehicleImmat}</div>
                      <span className="text-[10px] text-slate-500">{m.vehicleMarqueModele}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{m.montantCarburantDh} DH</span>
                      <span className="block text-[10px] text-slate-400">{m.quantiteCarburantLitres} L ({m.niveauCarburantInitial})</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyles[m.statut] || 'bg-slate-100 text-slate-800'}`}>
                        {m.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectMissionDocs(m)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer border border-emerald-200"
                        title="Imprimer ou télécharger Ordre de Mission A5 & Bons de sortie"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Documents A5/A4</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
