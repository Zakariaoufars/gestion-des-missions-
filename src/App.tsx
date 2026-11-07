import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MissionsView } from './components/MissionsView.tsx';
import { DocumentsView } from './components/DocumentsView.tsx';
import { FuelTrackingView } from './components/FuelTrackingView.tsx';
import { GpsTrackingView } from './components/GpsTrackingView.tsx';
import { VehiclesView } from './components/VehiclesView.tsx';
import { EmployeesView } from './components/EmployeesView.tsx';
import { DestinationsView } from './components/DestinationsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { MissionFormModal } from './components/MissionFormModal.tsx';
import { MissionCloseModal } from './components/MissionCloseModal.tsx';
import { DashboardStats, Mission } from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionForDocs, setSelectedMissionForDocs] = useState<Mission | null>(null);

  // Modals
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [missionToClose, setMissionToClose] = useState<Mission | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [statsRes, missionsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/missions'),
      ]);
      const [statsData, missionsData] = await Promise.all([
        statsRes.json(),
        missionsRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (missionsData.missions) {
        setMissions(missionsData.missions);
        if (!selectedMissionForDocs && missionsData.missions.length > 0) {
          setSelectedMissionForDocs(missionsData.missions[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/missions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: status }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error('Error changing mission status:', err);
    }
  };

  const handleSelectMissionDocs = (m: Mission) => {
    setSelectedMissionForDocs(m);
    setCurrentTab('documents');
  };

  const handleOpenCloseMission = (m: Mission) => {
    setMissionToClose(m);
    setIsCloseModalOpen(true);
  };

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Tableau de Bord Institutionnel',
      subtitle: 'Office Régional de Mise en Valeur Agricole de Ouarzazate (ORMVAO)',
    },
    missions: {
      title: 'Gestion des Ordres de Mission',
      subtitle: 'Centralisation, validation hiérarchique et suivi du cycle de vie des missions',
    },
    documents: {
      title: 'Documents Administratifs (A5 & A4)',
      subtitle: 'Ordre de mission A5, Bon de sortie interne et Demande de fourniture prêts pour impression',
    },
    fuel: {
      title: 'Suivi & Contrôle de Consommation de Carburant',
      subtitle: 'Calcul des moyennes réelles, rapprochement barème et alertes de surconsommation',
    },
    gps: {
      title: 'Télématique Flotte & Suivi GPS en Temps Réel',
      subtitle: 'Localisation des véhicules sur la carte du Drâa-Tafilalet et tracé des déplacements',
    },
    vehicles: {
      title: 'Gestion du Parc Automobile',
      subtitle: 'Inventaire technique des 4x4, pick-ups, compteurs kilométriques et états d\'entretien',
    },
    employees: {
      title: 'Base Centralisée des Employés',
      subtitle: 'Matricules administratifs, grades, fonctions et services de rattachement',
    },
    destinations: {
      title: 'Référentiel Géographique & Périmètres Agricoles',
      subtitle: 'Provinces de Ouarzazate, Zagora, Tinghir, Errachidia, Midelt et destinations nationales',
    },
    reports: {
      title: 'Rapports Statistiques & Analyses de Gestion',
      subtitle: 'Synthèse des dépenses carburant par service, véhicule et période',
    },
    admin: {
      title: 'Administration Système & Traçabilité d\'Audit',
      subtitle: 'Paramètres institutionnels, logos officiels, barèmes carburant et journal des opérations',
    },
  };

  const activeMissionsCount = missions.filter((m) => m.statut === 'En cours').length;

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        openNewMissionModal={() => setIsNewMissionOpen(true)}
        activeMissionsCount={activeMissionsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          currentTitle={tabTitles[currentTab].title}
          subtitle={tabTitles[currentTab].subtitle}
          anomaliesList={stats?.anomaliesList || []}
          onOpenNewMission={() => setIsNewMissionOpen(true)}
        />

        {/* View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                recentMissions={missions}
                onOpenNewMission={() => setIsNewMissionOpen(true)}
                onSelectMissionDocs={handleSelectMissionDocs}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'missions' && (
              <MissionsView
                missions={missions}
                onOpenNewMission={() => setIsNewMissionOpen(true)}
                onOpenCloseMission={handleOpenCloseMission}
                onSelectMissionDocs={handleSelectMissionDocs}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'documents' && (
              <DocumentsView
                missions={missions}
                selectedMission={selectedMissionForDocs}
                onSelectMission={(m) => setSelectedMissionForDocs(m)}
              />
            )}

            {currentTab === 'fuel' && <FuelTrackingView />}

            {currentTab === 'gps' && <GpsTrackingView />}

            {currentTab === 'vehicles' && <VehiclesView />}

            {currentTab === 'employees' && <EmployeesView />}

            {currentTab === 'destinations' && <DestinationsView />}

            {currentTab === 'reports' && <ReportsView stats={stats} missions={missions} />}

            {currentTab === 'admin' && <AdminView />}
          </div>
        </main>
      </div>

      {/* New Mission Creation Wizard Modal */}
      <MissionFormModal
        isOpen={isNewMissionOpen}
        onClose={() => setIsNewMissionOpen(false)}
        onMissionCreated={() => {
          loadAllData();
          setCurrentTab('missions');
        }}
      />

      {/* Mission Return & Fuel Settlement Modal */}
      <MissionCloseModal
        mission={missionToClose}
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onMissionClosed={() => {
          loadAllData();
        }}
      />
    </div>
  );
}
