import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck2,
  Fuel,
  MapPin,
  Car,
  Users,
  Compass,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { OrmvaoLogo } from '../lib/logos.tsx';

export type NavTab =
  | 'dashboard'
  | 'missions'
  | 'documents'
  | 'fuel'
  | 'gps'
  | 'vehicles'
  | 'employees'
  | 'destinations'
  | 'reports'
  | 'admin';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openNewMissionModal: () => void;
  activeMissionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openNewMissionModal,
  activeMissionsCount,
}) => {
  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    section?: string;
  }> = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, section: 'PILOTAGE' },
    { id: 'missions', label: 'Ordres de Mission', icon: FileSpreadsheet, badge: activeMissionsCount > 0 ? activeMissionsCount : undefined },
    { id: 'documents', label: 'Documents A5 & A4', icon: FileCheck2 },
    { id: 'fuel', label: 'Suivi Carburant', icon: Fuel, section: 'EXPLOITATION & TÉLÉMATIQUE' },
    { id: 'gps', label: 'Suivi GPS Flotte', icon: MapPin },
    { id: 'vehicles', label: 'Parc Automobile', icon: Car, section: 'RÉFÉRENTIELS' },
    { id: 'employees', label: 'Base Employés', icon: Users },
    { id: 'destinations', label: 'Destinations Maroc', icon: Compass },
    { id: 'reports', label: 'Rapports & Stats', icon: BarChart3, section: 'ANALYSE & GOUVERNANCE' },
    { id: 'admin', label: 'Administration & Audit', icon: Settings },
  ];

  let lastSection = '';

  return (
    <aside className="w-64 bg-emerald-950 text-slate-100 flex flex-col h-screen border-r border-emerald-900/60 shadow-xl shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-emerald-850/80 bg-emerald-900/40">
        <div className="flex items-center gap-3">
          <OrmvaoLogo className="w-11 h-11 shrink-0" showSubtext={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide text-white">ORMVAO</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200 font-semibold border border-emerald-700/60">
                ERP v2.4
              </span>
            </div>
            <p className="text-[11px] text-emerald-300 font-medium leading-tight">
              Ouarzazate • Maroc
            </p>
          </div>
        </div>
      </div>

      {/* Quick Mission Action Button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={openNewMissionModal}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg font-semibold text-xs shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Nouvelle Mission</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-emerald-800">
        {menuItems.map((item) => {
          const isSelected = currentTab === item.id;
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="pt-3 pb-1 px-2 text-[10px] font-bold text-emerald-400/80 tracking-wider uppercase">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-950 font-semibold'
                    : 'text-slate-300 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isSelected ? 'text-amber-400' : 'text-emerald-400/80'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-emerald-950 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isSelected && item.badge === undefined && (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300 opacity-60" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-emerald-900/80 bg-emerald-950/90 text-[11px]">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">PostgreSQL & Télématique</span>
        </div>
        <p className="text-[10px] text-emerald-400/70 truncate mt-0.5">
          Connecteur GPS ORMVAO Synchronisé
        </p>
      </div>
    </aside>
  );
};
