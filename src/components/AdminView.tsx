import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  FileCheck2,
  Clock,
  UserCheck,
  Building,
  Fuel,
  MapPin,
  CheckCircle2,
  Save,
  Image as ImageIcon,
  Key,
} from 'lucide-react';
import { AuditLog } from '../types/index.ts';
import { MinistryLogo, OrmvaoLogo } from '../lib/logos.tsx';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'audit' | 'gps' | 'fuel'>('general');
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Settings
  const [fuelPrice, setFuelPrice] = useState(13.0);
  const [directorName, setDirectorName] = useState('Driss AMRAOUI');
  const [directorTitle, setDirectorTitle] = useState('Directeur de l\'ORMVAO');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.logs) setAuditLogsList(data.logs);
    } catch (err) {
      console.error('Audit logs error:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'organization',
          value: {
            nomEtablissement: 'Office Régional de Mise en Valeur Agricole de Ouarzazate',
            sigle: 'ORMVAO',
            directeur: directorName,
            titreDirecteur: directorTitle,
            prixCarburantLitreDh: fuelPrice,
          },
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      fetchAuditLogs();
    } catch (err) {
      alert('Erreur d\'enregistrement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Espace Administrateur & Journal des Opérations
          </h2>
          <p className="text-xs text-slate-500">
            Paramétrage institutionnel, prix du carburant, modèles de documents et traçabilité d'audit
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Paramètres enregistrés avec succès</span>
          </div>
        )}
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'general' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Paramètres Généraux & Signataires
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'audit' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Journal des Opérations (Audit Trail)
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'fuel' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tarifs & Barèmes Carburant
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Logos Institutionnels Officiels
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ces logos vectoriels officiels sont imprimés sur les Ordres de Mission A5 et les Bons A4/A5
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <MinistryLogo className="w-16 h-16" showSubtext={false} />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Logo Ministère de l'Agriculture</h4>
                  <p className="text-[11px] text-slate-500">Royaume du Maroc</p>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Vectoriel HD Intégré</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <OrmvaoLogo className="w-16 h-16" showSubtext={false} />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Logo Officiel ORMVAO</h4>
                  <p className="text-[11px] text-slate-500">Mise en Valeur Agricole Ouarzazate</p>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Vectoriel HD Intégré</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-800">
              Autorité Signataire pour Validation des Ordres de Mission
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom du Directeur / Signataire Principal
                </label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Titre Administratif Officiel
                </label>
                <input
                  type="text"
                  value={directorTitle}
                  onChange={(e) => setDirectorTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Enregistrer les Paramètres</span>
            </button>
          </div>
        </div>
      )}

      {/* Fuel Settings */}
      {activeTab === 'fuel' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-800">
            Barème de Conversion Carburant (DH / Litre)
          </h3>
          <p className="text-slate-500 text-xs">
            Ce prix de référence est utilisé par le formulaire intelligent pour convertir automatiquement les distances et consommations en Dirhams (DH) et Litres.
          </p>

          <div className="max-w-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Prix du Carburant Diesel / Vignette (DH/Litre)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 13.0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-800 text-sm focus:ring-1 focus:ring-emerald-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                DH/L
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Enregistrer le Barème</span>
            </button>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Journal des Opérations & Audit Système
              </h3>
              <p className="text-xs text-slate-500">
                Traçabilité rigoureuse de chaque création, modification, validation ou clôture de mission
              </p>
            </div>
            <button
              onClick={fetchAuditLogs}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Actualiser
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Date & Heure</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Entité</th>
                  <th className="py-2.5 px-4">Référence</th>
                  <th className="py-2.5 px-4">Utilisateur / Auteur</th>
                  <th className="py-2.5 px-4">Détails de l'opération</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '-'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700">
                      {log.entite}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-emerald-900">
                      {log.entiteId}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {log.utilisateur}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
