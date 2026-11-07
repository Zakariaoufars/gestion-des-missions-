import React, { useState } from 'react';
import { Bell, Search, Fuel, AlertTriangle, Shield, CheckCircle2, User } from 'lucide-react';
import { MinistryLogo } from '../lib/logos.tsx';
import { Mission } from '../types/index.ts';

interface HeaderProps {
  currentTitle: string;
  subtitle?: string;
  onSearchGlobal?: (term: string) => void;
  anomaliesList?: Mission[];
  onOpenNewMission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTitle,
  subtitle,
  onSearchGlobal,
  anomaliesList = [],
  onOpenNewMission,
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchGlobal) onSearchGlobal(val);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Path */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            {currentTitle}
          </h1>
          {subtitle ? (
            <p className="text-xs text-slate-500">{subtitle}</p>
          ) : (
            <p className="text-xs text-emerald-700 font-medium">
              Office Régional de Mise en Valeur Agricole de Ouarzazate
            </p>
          )}
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Rechercher mission, employé, immatriculation, destination..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-700 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls & Official Badge */}
      <div className="flex items-center gap-3">
        {/* Quick New Mission */}
        <button
          onClick={onOpenNewMission}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span>+ Créer Mission</span>
        </button>

        {/* Notifications & Anomalies Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg relative transition-colors cursor-pointer"
            title="Alertes & Anomalies carburant"
          >
            <Bell className="w-4 h-4" />
            {anomaliesList.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse border-2 border-white" />
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Alertes Télématique & Carburant
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                  {anomaliesList.length} Détectée(s)
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {anomaliesList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Aucune anomalie de carburant constatée.</span>
                  </div>
                ) : (
                  anomaliesList.map((m) => (
                    <div key={m.id} className="p-3 hover:bg-slate-50 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{m.numeroMission} - {m.vehicleImmat}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {m.anomalieConstatee || 'Écart de consommation anormal par rapport au barème constructeur.'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Employé: {m.employeeNom} ({m.service})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Institutional Ministry Seal */}
        <div className="hidden lg:flex items-center">
          <MinistryLogo className="w-8 h-8" showSubtext={false} />
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
            DA
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <p className="font-semibold text-slate-800">Driss AMRAOUI</p>
            <p className="text-[10px] text-emerald-700 font-medium">Directeur ORMVAO</p>
          </div>
        </div>
      </div>
    </header>
  );
};
