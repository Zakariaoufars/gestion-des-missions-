import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Fuel,
  MapPin,
  ChevronRight,
  Eye,
  Check,
  Ban,
  FileText,
} from 'lucide-react';
import { Mission } from '../types/index.ts';
import * as XLSX from 'xlsx';

interface MissionsViewProps {
  missions: Mission[];
  onOpenNewMission: () => void;
  onOpenCloseMission: (m: Mission) => void;
  onSelectMissionDocs: (m: Mission) => void;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  onRefresh: () => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  onOpenNewMission,
  onOpenCloseMission,
  onSelectMissionDocs,
  onUpdateStatus,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');
  const [selectedService, setSelectedService] = useState<string>('TOUS');

  const statusOptions = [
    'TOUS',
    'Validée',
    'En cours',
    'Clôturée',
    'Exécutée',
    'En attente de validation',
    'Non exécutée',
    'Brouillon',
  ];

  const serviceOptions = ['TOUS', 'SAF', 'SER', 'SVOP', 'SAAF', 'Direction'];

  const filteredMissions = missions.filter((m) => {
    if (selectedStatus !== 'TOUS' && m.statut !== selectedStatus) return false;
    if (selectedService !== 'TOUS' && m.service !== selectedService) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.numeroMission.toLowerCase().includes(q) ||
        m.employeeNom.toLowerCase().includes(q) ||
        m.employeeMatricule.toLowerCase().includes(q) ||
        m.vehicleImmat.toLowerCase().includes(q) ||
        m.destination.toLowerCase().includes(q) ||
        m.objetMission.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportExcel = () => {
    const dataToExport = filteredMissions.map((m) => ({
      'N° Mission': m.numeroMission,
      'Employé': m.employeeNom,
      'Matricule': m.employeeMatricule,
      'Grade': m.employeeGrade,
      'Service': m.service,
      'Destination': m.destination,
      'Objet de la mission': m.objetMission,
      'Date Début': m.dateDebut,
      'Date Fin': m.dateFin,
      'Véhicule': m.vehicleImmat,
      'Marque/Modèle': m.vehicleMarqueModele,
      'Carburant (DH)': m.montantCarburantDh,
      'Carburant (L)': m.quantiteCarburantLitres,
      'Niveau Réservoir': m.niveauCarburantInitial,
      'Type Vignette': m.typeVignette,
      'Statut': m.statut,
      'Km Initial': m.kmInitial,
      'Km Final': m.kmFinal || '',
      'Distance (km)': m.distanceParcourue || '',
      'Conso Réelle (L)': m.quantiteReellementConsommee || '',
      'Conso Moyenne (L/100km)': m.consommationMoyenne || '',
      'Anomalie': m.anomalieConstatee || 'Aucune',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ordres_De_Mission_ORMVAO');
    XLSX.writeFile(wb, `Missions_ORMVAO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Gestion Centralisée des Ordres de Mission
          </h2>
          <p className="text-xs text-slate-500">
            Suivi des statuts, génération des pièces administratives et validation hiérarchique
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exporter Excel</span>
          </button>
          <button
            onClick={onOpenNewMission}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Nouvelle Mission</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par nom, matricule, immatriculation..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500">Statut:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:ring-1 focus:ring-emerald-600"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Service selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:ring-1 focus:ring-emerald-600"
            >
              {serviceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Missions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">N° Mission</th>
                <th className="py-3 px-4">Employé Bénéficiaire</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Destination & Objet</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Carburant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions Workflow & Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Aucune mission trouvée pour les critères spécifiés.
                  </td>
                </tr>
              ) : (
                filteredMissions.map((m) => {
                  const statusStyles: Record<string, string> = {
                    'Brouillon': 'bg-slate-100 text-slate-700 border-slate-200',
                    'En attente de validation': 'bg-amber-100 text-amber-800 border-amber-200',
                    'Validée': 'bg-blue-100 text-blue-800 border-blue-200',
                    'En cours': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
                    'Exécutée': 'bg-teal-100 text-teal-800 border-teal-200',
                    'Clôturée': 'bg-slate-100 text-slate-800 border-slate-300',
                    'Non exécutée': 'bg-rose-100 text-rose-800 border-rose-200',
                  };

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black text-emerald-900 whitespace-nowrap">
                        {m.numeroMission}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{m.employeeNom}</div>
                        <div className="text-[10px] text-slate-500">
                          {m.employeeMatricule} • {m.employeeGrade}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {m.service}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[240px]">
                        <p className="font-bold text-slate-800 truncate" title={m.destination}>
                          {m.destination}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5" title={m.objetMission}>
                          {m.objetMission}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px]">
                        <div className="font-medium text-slate-800">{m.dateDebut.substring(0, 10)}</div>
                        <span className="text-[10px] text-slate-400">au {m.dateFin.substring(0, 10)}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{m.vehicleImmat}</div>
                        <div className="text-[10px] text-slate-500">{m.vehicleMarqueModele}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{m.montantCarburantDh} DH</span>
                        <div className="text-[10px] text-slate-500">
                          {m.quantiteCarburantLitres} L ({m.niveauCarburantInitial})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusStyles[m.statut] || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {m.statut}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Documents A5 / A4 button */}
                          <button
                            onClick={() => onSelectMissionDocs(m)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                            title="Générer Ordre A5 & Bons de sortie"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Quick workflow actions */}
                          {m.statut === 'Validée' && (
                            <button
                              onClick={() => onUpdateStatus(m.id, 'En cours')}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              title="Départ en mission"
                            >
                              Démarrer
                            </button>
                          )}

                          {m.statut === 'En cours' && (
                            <button
                              onClick={() => onOpenCloseMission(m)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-lg text-[10px] font-black shadow-xs transition-colors cursor-pointer"
                              title="Clôturer le retour de mission et le carburant"
                            >
                              Clôturer
                            </button>
                          )}

                          {m.statut === 'Clôturée' && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                              Bilan OK
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
