import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  FileText,
  FileCheck2,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  User,
  Car,
  Fuel,
} from 'lucide-react';
import { Mission } from '../types/index.ts';
import { OfficialHeader, MinistryLogo, OrmvaoLogo } from '../lib/logos.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentsViewProps {
  missions: Mission[];
  selectedMission: Mission | null;
  onSelectMission: (m: Mission) => void;
}

type DocViewMode = 'OM_A5' | 'A4_COMBINED' | 'BSI_A5' | 'DF_A5';

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  missions,
  selectedMission,
  onSelectMission,
}) => {
  const [activeMission, setActiveMission] = useState<Mission | null>(
    selectedMission || missions[0] || null
  );
  const [docMode, setDocMode] = useState<DocViewMode>('OM_A5');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  // Sync if selectedMission changes from outside
  React.useEffect(() => {
    if (selectedMission) {
      setActiveMission(selectedMission);
    } else if (!activeMission && missions.length > 0) {
      setActiveMission(missions[0]);
    }
  }, [selectedMission, missions]);

  if (!activeMission) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Aucun ordre de mission disponible</h3>
        <p className="text-xs text-slate-500 mt-1">
          Créez un nouvel ordre de mission pour générer automatiquement les documents A5 et A4.
        </p>
      </div>
    );
  }

  // Handle High-Fidelity PDF Download using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    try {
      setIsGeneratingPdf(true);

      const element = printableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      if (docMode === 'OM_A5' || docMode === 'BSI_A5' || docMode === 'DF_A5') {
        // Exact A5 dimensions: 148 x 210 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5',
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 148, 210);
        const fileName = `${docMode}_${activeMission.numeroMission}.pdf`;
        pdf.save(fileName);
      } else {
        // Exact A4 dimensions: 210 x 297 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        const fileName = `BSI_DF_A4_COMBINE_${activeMission.numeroMission}.pdf`;
        pdf.save(fileName);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mission selector dropdown */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Mission Sélectionnée
            </label>
            <select
              value={activeMission.id}
              onChange={(e) => {
                const found = missions.find((m) => m.id === parseInt(e.target.value));
                if (found) {
                  setActiveMission(found);
                  onSelectMission(found);
                }
              }}
              className="font-bold text-slate-800 text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-600"
            >
              {missions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.numeroMission} - {m.employeeNom} ({m.destination})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Format Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setDocMode('OM_A5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              docMode === 'OM_A5'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ordre de Mission (Format A5)
          </button>
          <button
            onClick={() => setDocMode('A4_COMBINED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              docMode === 'A4_COMBINED'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BSI + DF (Feuille A4 divisée en 2 A5)
          </button>
          <button
            onClick={() => setDocMode('BSI_A5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              docMode === 'BSI_A5'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bon de Sortie Seul (A5)
          </button>
          <button
            onClick={() => setDocMode('DF_A5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              docMode === 'DF_A5'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demande Fourniture Seule (A5)
          </button>
        </div>

        {/* Action Buttons: Print & Download PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
          </button>
        </div>
      </div>

      {/* Document Preview Canvas */}
      <div className="flex justify-center p-4 bg-slate-100/70 rounded-2xl border border-slate-200 overflow-x-auto">
        {/* Print wrapper */}
        <div
          ref={printableRef}
          className={`bg-white shadow-xl transition-all duration-200 print:shadow-none print:m-0 ${
            docMode === 'A4_COMBINED'
              ? 'w-[210mm] min-h-[297mm] p-[10mm]'
              : 'w-[148mm] min-h-[210mm] p-[8mm]'
          }`}
          style={{ boxSizing: 'border-box' }}
        >
          {/* RENDER MODE 1: ORDRE DE MISSION A5 (148 x 210 mm) */}
          {docMode === 'OM_A5' && (
            <div className="h-full flex flex-col justify-between text-slate-900 font-sans text-[11px] leading-tight select-none">
              {/* Header */}
              <OfficialHeader compact={true} />

              {/* Title Badge */}
              <div className="text-center my-2">
                <div className="inline-block border-2 border-emerald-900 bg-emerald-50/50 px-4 py-1.5 rounded-md">
                  <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                    ORDRE DE MISSION
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-800 tracking-wide mt-0.5">
                    N° : {activeMission.numeroMission}
                  </p>
                </div>
              </div>

              {/* Administrative Body Information */}
              <div className="space-y-2 border border-slate-300 rounded-md p-3 bg-white text-[10px]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Employé(e) :</span>
                    <span className="font-extrabold text-slate-900 text-[11px]">
                      {activeMission.employeeNom}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Matricule :</span>
                    <span className="font-bold text-slate-900">{activeMission.employeeMatricule}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Grade & Fonction :</span>
                    <span className="font-semibold text-slate-800">
                      {activeMission.employeeGrade} - {activeMission.employeeFonction || 'Cadre ORMVAO'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Service Demandeur :</span>
                    <span className="font-bold text-emerald-800">{activeMission.service}</span>
                  </div>
                </div>

                {/* Mission Specifics */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-slate-200 pb-2 pt-1">
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Destination(s) :</span>
                    <span className="font-extrabold text-slate-900 text-[11px]">
                      {activeMission.destination}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Objet / Motif de la Mission :</span>
                    <span className="font-medium text-slate-800 leading-snug">
                      {activeMission.objetMission}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Date de début :</span>
                    <span className="font-semibold text-slate-900">
                      {activeMission.dateDebut.replace('T', ' à ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Date de fin :</span>
                    <span className="font-semibold text-slate-900">
                      {activeMission.dateFin.replace('T', ' à ')}
                    </span>
                  </div>
                </div>

                {/* Vehicle & Fuel Snapshot */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Véhicule affecté :</span>
                    <span className="font-bold text-slate-900">{activeMission.vehicleImmat}</span>
                    <span className="block text-[8px] text-slate-500">{activeMission.vehicleMarqueModele}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Dotation Carburant :</span>
                    <span className="font-extrabold text-emerald-900">
                      {activeMission.montantCarburantDh} DH ({activeMission.quantiteCarburantLitres} L)
                    </span>
                    <span className="block text-[8px] text-slate-500">Niveau: {activeMission.niveauCarburantInitial}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 block text-[9px] uppercase">Type de Vignette :</span>
                    <span className="font-semibold text-slate-900">{activeMission.typeVignette}</span>
                    <span className="block text-[8px] text-emerald-700 font-bold">GPS: Synchronisé</span>
                  </div>
                </div>
              </div>

              {/* Instructions text */}
              <p className="text-[8px] text-slate-500 text-justify italic px-1 my-1">
                Il est demandé aux autorités civiles et militaires, ainsi qu'aux services de police et de gendarmerie royale, de prêter aide et assistance au porteur du présent ordre de mission dans l'exercice de ses fonctions officielles.
              </p>

              {/* Signatures & Visas Grid */}
              <div className="border border-slate-300 rounded-md grid grid-cols-3 divide-x divide-slate-300 text-[9px] h-28 mt-2">
                <div className="p-2 flex flex-col justify-between">
                  <span className="font-bold text-slate-700 text-center uppercase text-[8px]">
                    Visa du Chef de Service
                  </span>
                  <div className="text-center text-slate-400 text-[8px] italic">
                    Date & Signature
                  </div>
                </div>
                <div className="p-2 flex flex-col justify-between">
                  <span className="font-bold text-slate-700 text-center uppercase text-[8px]">
                    Visa Autorité de Destination
                  </span>
                  <div className="text-center text-slate-400 text-[8px] italic">
                    Cachet d'arrivée / départ
                  </div>
                </div>
                <div className="p-2 flex flex-col justify-between bg-emerald-50/20">
                  <span className="font-bold text-emerald-900 text-center uppercase text-[8px]">
                    Le Directeur de l'ORMVAO
                  </span>
                  <div className="text-center">
                    <span className="block font-serif font-black text-slate-900 text-[9px]">
                      Driss AMRAOUI
                    </span>
                    <span className="text-[7px] text-slate-500">Signature et Cachet Officiel</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENDER MODE 2: COMBINED A4 (DIVIDED HORIZONTALLY IN 2 EQUAL A5 SECTIONS) */}
          {docMode === 'A4_COMBINED' && (
            <div className="h-full flex flex-col justify-between space-y-4 text-slate-900 font-sans text-[10px]">
              {/* TOP HALF: BON DE SORTIE INTERNE (A5) */}
              <div className="border-b-2 border-dashed border-slate-400 pb-5 h-[135mm] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-1 mb-2">
                    <div className="flex items-center gap-2">
                      <OrmvaoLogo className="w-8 h-8" showSubtext={false} />
                      <div>
                        <p className="font-bold text-emerald-950 text-[10px] uppercase">
                          ORMVA DE OUARZAZATE
                        </p>
                        <p className="text-[8px] text-slate-500">Service Administratif et Financier • Parc Auto</p>
                      </div>
                    </div>
                    <div className="border border-emerald-900 bg-emerald-50 px-3 py-1 rounded text-center">
                      <span className="block font-black text-emerald-950 text-xs uppercase">
                        BON DE SORTIE INTERNE
                      </span>
                      <span className="text-[9px] font-bold text-emerald-800">
                        N° BSI-{activeMission.numeroMission.replace('OM-', '')}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded p-2.5 text-[9px] space-y-1.5 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-2">
                      <p><span className="font-bold text-slate-600">Réf. Mission :</span> <span className="font-bold text-emerald-900">{activeMission.numeroMission}</span></p>
                      <p><span className="font-bold text-slate-600">Service Bénéficiaire :</span> <span className="font-bold">{activeMission.service}</span></p>
                      <p><span className="font-bold text-slate-600">Bénéficiaire / Chauffeur :</span> <span className="font-bold">{activeMission.employeeNom} ({activeMission.employeeMatricule})</span></p>
                      <p><span className="font-bold text-slate-600">Destination :</span> <span className="font-bold">{activeMission.destination}</span></p>
                      <p><span className="font-bold text-slate-600">Véhicule Désigné :</span> <span className="font-bold">{activeMission.vehicleImmat} ({activeMission.vehicleMarqueModele})</span></p>
                      <p><span className="font-bold text-slate-600">Compteur Initial :</span> <span className="font-bold">{activeMission.kmInitial.toLocaleString('fr-FR')} Km</span></p>
                      <p className="col-span-2"><span className="font-bold text-slate-600">Carburant Sorti :</span> <span className="font-extrabold text-emerald-800">{activeMission.quantiteCarburantLitres} Litres (Montant: {activeMission.montantCarburantDh} DH)</span> - Niveau: {activeMission.niveauCarburantInitial}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border border-slate-300 rounded text-[8px] h-20 text-center divide-x divide-slate-300">
                  <div className="p-1 flex flex-col justify-between">
                    <span className="font-bold uppercase">Le Magasinier / Parc</span>
                    <span className="text-slate-400 italic">Signature & Visa</span>
                  </div>
                  <div className="p-1 flex flex-col justify-between">
                    <span className="font-bold uppercase">Le Bénéficiaire</span>
                    <span className="text-slate-400 italic">Lu et approuvé</span>
                  </div>
                  <div className="p-1 flex flex-col justify-between bg-emerald-50/20">
                    <span className="font-bold uppercase text-emerald-900">Le Chef de Service</span>
                    <span className="text-slate-400 italic">Cachet Administratif</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM HALF: DEMANDE DE FOURNITURE (A5) */}
              <div className="pt-2 h-[135mm] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-1 mb-2">
                    <div className="flex items-center gap-2">
                      <MinistryLogo className="w-8 h-8" showSubtext={false} />
                      <div>
                        <p className="font-bold text-emerald-950 text-[10px] uppercase">
                          ROYAUME DU MAROC - ORMVAO
                        </p>
                        <p className="text-[8px] text-slate-500">Gestion des Matières & Dotation Carburant</p>
                      </div>
                    </div>
                    <div className="border border-emerald-900 bg-emerald-50 px-3 py-1 rounded text-center">
                      <span className="block font-black text-emerald-950 text-xs uppercase">
                        DEMANDE DE FOURNITURE
                      </span>
                      <span className="text-[9px] font-bold text-emerald-800">
                        N° DF-{activeMission.numeroMission.replace('OM-', '')}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded p-2.5 text-[9px] space-y-1.5 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-2">
                      <p><span className="font-bold text-slate-600">Imputation Budgétaire :</span> <span className="font-bold">Carburants & Lubrifiants - Exercice 2026</span></p>
                      <p><span className="font-bold text-slate-600">Service Demandeur :</span> <span className="font-bold text-emerald-800">{activeMission.service}</span></p>
                      <p><span className="font-bold text-slate-600">Demandeur :</span> <span className="font-bold">{activeMission.employeeNom}</span> (Matricule: {activeMission.employeeMatricule})</p>
                      <p><span className="font-bold text-slate-600">Affectation Véhicule :</span> <span className="font-bold">{activeMission.vehicleImmat}</span></p>
                      <p className="col-span-2"><span className="font-bold text-slate-600">Motif officiel :</span> <span>{activeMission.objetMission}</span></p>
                    </div>

                    <table className="w-full text-left border border-slate-300 mt-2 text-[8px]">
                      <thead className="bg-slate-100 font-bold">
                        <tr>
                          <th className="p-1 border-r border-slate-300">Désignation</th>
                          <th className="p-1 border-r border-slate-300 text-center">Unité</th>
                          <th className="p-1 border-r border-slate-300 text-center">Quantité</th>
                          <th className="p-1 text-right">Montant Estimé (DH)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td className="p-1 border-r border-slate-300 font-semibold">Carburant Diesel / Vignette {activeMission.typeVignette}</td>
                          <td className="p-1 border-r border-slate-300 text-center">Litre</td>
                          <td className="p-1 border-r border-slate-300 text-center font-bold">{activeMission.quantiteCarburantLitres} L</td>
                          <td className="p-1 text-right font-black text-emerald-900">{activeMission.montantCarburantDh} DH</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-3 border border-slate-300 rounded text-[8px] h-20 text-center divide-x divide-slate-300">
                  <div className="p-1 flex flex-col justify-between">
                    <span className="font-bold uppercase">L'Agent Demandeur</span>
                    <span className="text-slate-400 italic">Signature</span>
                  </div>
                  <div className="p-1 flex flex-col justify-between">
                    <span className="font-bold uppercase">Chef de Service SAF</span>
                    <span className="text-slate-400 italic">Accord Budgétaire</span>
                  </div>
                  <div className="p-1 flex flex-col justify-between bg-emerald-50/20">
                    <span className="font-bold uppercase text-emerald-900">Le Directeur ORMVAO</span>
                    <span className="text-slate-400 italic">Approbation & Cachet</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENDER MODE 3: BON DE SORTIE SEUL (A5) */}
          {docMode === 'BSI_A5' && (
            <div className="h-full flex flex-col justify-between text-slate-900 font-sans text-[11px] select-none">
              <OfficialHeader compact={true} />
              <div className="text-center my-3">
                <div className="inline-block border-2 border-emerald-900 bg-emerald-50 px-4 py-1.5 rounded">
                  <h2 className="text-xs font-black uppercase text-emerald-950">
                    BON DE SORTIE INTERNE (VÉHICULE & CARBURANT)
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-800">
                    N° BSI-{activeMission.numeroMission.replace('OM-', '')}
                  </p>
                </div>
              </div>

              <div className="border border-slate-300 rounded-md p-3 space-y-2 text-[10px] bg-slate-50/30">
                <p><span className="font-bold text-slate-600">Mission Associée :</span> <span className="font-extrabold text-emerald-900">{activeMission.numeroMission}</span></p>
                <p><span className="font-bold text-slate-600">Bénéficiaire :</span> <span className="font-bold">{activeMission.employeeNom}</span> ({activeMission.employeeMatricule} - {activeMission.employeeGrade})</p>
                <p><span className="font-bold text-slate-600">Service :</span> <span className="font-bold">{activeMission.service}</span></p>
                <p><span className="font-bold text-slate-600">Véhicule autorisé :</span> <span className="font-bold">{activeMission.vehicleImmat}</span> ({activeMission.vehicleMarqueModele})</p>
                <p><span className="font-bold text-slate-600">Destination :</span> <span className="font-bold">{activeMission.destination}</span></p>
                <p><span className="font-bold text-slate-600">Dotation Carburant :</span> <span className="font-black text-emerald-800">{activeMission.montantCarburantDh} DH ({activeMission.quantiteCarburantLitres} Litres)</span></p>
                <p><span className="font-bold text-slate-600">Niveau de départ :</span> <span className="font-bold">{activeMission.niveauCarburantInitial}</span> • Type: {activeMission.typeVignette}</p>
              </div>

              <div className="border border-slate-300 rounded grid grid-cols-2 divide-x divide-slate-300 h-28 text-[9px] text-center mt-3">
                <div className="p-2 flex flex-col justify-between">
                  <span className="font-bold uppercase">Le Magasinier / Chef de Parc</span>
                  <span className="text-slate-400 italic">Signature & Date</span>
                </div>
                <div className="p-2 flex flex-col justify-between">
                  <span className="font-bold uppercase">Le Chauffeur / Agent</span>
                  <span className="text-slate-400 italic">Reçu en bon état</span>
                </div>
              </div>
            </div>
          )}

          {/* RENDER MODE 4: DEMANDE DE FOURNITURE SEULE (A5) */}
          {docMode === 'DF_A5' && (
            <div className="h-full flex flex-col justify-between text-slate-900 font-sans text-[11px] select-none">
              <OfficialHeader compact={true} />
              <div className="text-center my-3">
                <div className="inline-block border-2 border-emerald-900 bg-emerald-50 px-4 py-1.5 rounded">
                  <h2 className="text-xs font-black uppercase text-emerald-950">
                    DEMANDE DE FOURNITURE DE CARBURANT
                  </h2>
                  <p className="text-[10px] font-bold text-emerald-800">
                    N° DF-{activeMission.numeroMission.replace('OM-', '')}
                  </p>
                </div>
              </div>

              <div className="border border-slate-300 rounded-md p-3 space-y-2 text-[10px] bg-slate-50/30">
                <p><span className="font-bold text-slate-600">Service Émetteur :</span> <span className="font-bold text-emerald-900">{activeMission.service}</span></p>
                <p><span className="font-bold text-slate-600">Bénéficiaire :</span> <span className="font-bold">{activeMission.employeeNom}</span></p>
                <p><span className="font-bold text-slate-600">Immatriculation Véhicule :</span> <span className="font-bold">{activeMission.vehicleImmat}</span></p>
                <p><span className="font-bold text-slate-600">Objet :</span> <span className="font-medium">{activeMission.objetMission}</span></p>
                <p><span className="font-bold text-slate-600">Quantité Demandée :</span> <span className="font-extrabold text-emerald-800">{activeMission.quantiteCarburantLitres} L ({activeMission.montantCarburantDh} DH)</span></p>
                <p><span className="font-bold text-slate-600">Mode de Délivrance :</span> <span className="font-bold">{activeMission.typeVignette}</span></p>
              </div>

              <div className="border border-slate-300 rounded grid grid-cols-2 divide-x divide-slate-300 h-28 text-[9px] text-center mt-3">
                <div className="p-2 flex flex-col justify-between">
                  <span className="font-bold uppercase">Chef de Service SAF</span>
                  <span className="text-slate-400 italic">Visa Budget</span>
                </div>
                <div className="p-2 flex flex-col justify-between bg-emerald-50/20">
                  <span className="font-bold uppercase text-emerald-900">Le Directeur ORMVAO</span>
                  <span className="text-slate-400 italic">Signature et Approbation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
