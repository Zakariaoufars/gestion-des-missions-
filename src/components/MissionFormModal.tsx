import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Car,
  Fuel,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
} from 'lucide-react';
import { Employee, Vehicle, Destination } from '../types/index.ts';

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated: () => void;
}

export const MissionFormModal: React.FC<MissionFormModalProps> = ({
  isOpen,
  onClose,
  onMissionCreated,
}) => {
  // Database datasets for smart autocomplete
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [destinationsList, setDestinationsList] = useState<Destination[]>([]);

  // Employee Smart Autocomplete State
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Vehicle Smart Autocomplete State
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  // Destination Smart Autocomplete State
  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  // Form Fields
  const [objetMission, setObjetMission] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [montantCarburantDh, setMontantCarburantDh] = useState<number>(350);
  const [quantiteCarburantLitres, setQuantiteCarburantLitres] = useState<number>(26.9);
  const [niveauCarburantInitial, setNiveauCarburantInitial] = useState<string>('1/2');
  const [typeVignette, setTypeVignette] = useState<string>('E-vignette');
  const [service, setService] = useState<string>('SAF');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set default dates (today 08:00 to today 18:00)
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      setDateDebut(`${todayStr}T08:00`);
      setDateFin(`${todayStr}T18:00`);
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [empRes, vehRes, destRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/vehicles'),
        fetch('/api/destinations'),
      ]);
      const [empData, vehData, destData] = await Promise.all([
        empRes.json(),
        vehRes.json(),
        destRes.json(),
      ]);

      if (empData.employees) setEmployeesList(empData.employees);
      if (vehData.vehicles) setVehiclesList(vehData.vehicles);
      if (destData.destinations) setDestinationsList(destData.destinations);
    } catch (err) {
      console.error('Failed to load datasets for autocomplete:', err);
    }
  };

  // Filtered lists for instant autocomplete
  const filteredEmployees = employeesList.filter((e) => {
    const q = employeeSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.matricule.toLowerCase().includes(q) ||
      e.service.toLowerCase().includes(q)
    );
  });

  const filteredVehicles = vehiclesList.filter((v) => {
    const q = vehicleSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.immatriculation.toLowerCase().includes(q) ||
      v.marque.toLowerCase().includes(q) ||
      v.modele.toLowerCase().includes(q) ||
      (v.identifiantGps && v.identifiantGps.toLowerCase().includes(q))
    );
  });

  const filteredDestinations = destinationsList.filter((d) => {
    const q = destinationSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      d.villeOuLocalite.toLowerCase().includes(q) ||
      d.commune.toLowerCase().includes(q) ||
      d.province.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
    );
  });

  // Handle Employee Selection -> Auto-fill
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEmployeeSearch(`${emp.nom} ${emp.prenom} (${emp.matricule})`);
    setService(emp.service);
    setShowEmployeeDropdown(false);
  };

  // Handle Vehicle Selection -> Auto-fill
  const handleSelectVehicle = (veh: Vehicle) => {
    setSelectedVehicle(veh);
    setVehicleSearch(`${veh.immatriculation} - ${veh.marque} ${veh.modele}`);
    if (veh.niveauReservoirActuel) {
      setNiveauCarburantInitial(veh.niveauReservoirActuel);
    }
    setShowVehicleDropdown(false);
    recalculateFuel(selectedDestination, veh);
  };

  // Handle Destination Selection -> Auto-calculate distance and fuel
  const handleSelectDestination = (dest: Destination) => {
    setSelectedDestination(dest);
    setDestinationSearch(`${dest.villeOuLocalite} (${dest.province})`);
    setShowDestinationDropdown(false);
    recalculateFuel(dest, selectedVehicle);
  };

  // Automatic Fuel & DH Calculation Helper
  const recalculateFuel = (dest: Destination | null, veh: Vehicle | null) => {
    if (dest && dest.distanceAllerKm) {
      const distanceAllerRetour = dest.distanceAllerKm * 2;
      const consoPer100 = veh ? Number(veh.consoTheorique) || 7.5 : 7.5;
      const litresNeeded = Math.round(((distanceAllerRetour * consoPer100) / 100) * 1.15 * 10) / 10; // +15% safety buffer for terrain
      const fuelPriceDh = 13.0; // Current average DH per litre
      const dhAmount = Math.round(litresNeeded * fuelPriceDh);

      setQuantiteCarburantLitres(litresNeeded);
      setMontantCarburantDh(dhAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedEmployee) {
      setErrorMessage('Veuillez sélectionner un employé avec l\'autocomplétion.');
      return;
    }
    if (!selectedVehicle) {
      setErrorMessage('Veuillez sélectionner un véhicule affecté.');
      return;
    }
    if (!destinationSearch.trim()) {
      setErrorMessage('Veuillez spécifier la destination.');
      return;
    }
    if (!objetMission.trim()) {
      setErrorMessage('Veuillez renseigner le motif/objet de la mission.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        employeeId: selectedEmployee.id,
        destination: destinationSearch.trim(),
        destinationProvince: selectedDestination?.province || 'Drâa-Tafilalet',
        objetMission: objetMission.trim(),
        dateDebut,
        dateFin,
        vehicleId: selectedVehicle.id,
        montantCarburantDh,
        quantiteCarburantLitres,
        niveauCarburantInitial,
        typeVignette,
        service,
        notes,
      };

      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la mission');
      }

      onMissionCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/60 rounded-xl border border-emerald-600/40">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Création Intelligente d'un Ordre de Mission
              </h2>
              <p className="text-xs text-emerald-200">
                Génération automatique simultanée : Ordre A5 + Bon de Sortie + Demande Fourniture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Informations Administratives & Employé */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <User className="w-4 h-4 text-emerald-700" />
              <span>1. Employé & Informations Administratives</span>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recherche intelligente d'employé (Nom ou Matricule) *
              </label>
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setShowEmployeeDropdown(true);
                }}
                onFocus={() => setShowEmployeeDropdown(true)}
                placeholder="Tapez le nom (ex: Bennani) ou matricule (ex: M-1105)..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800 font-medium"
              />

              {showEmployeeDropdown && filteredEmployees.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="p-2.5 hover:bg-emerald-50 cursor-pointer text-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">
                          {emp.nom} {emp.prenom}
                        </span>
                        <span className="ml-2 text-emerald-700 font-semibold text-[11px]">
                          ({emp.matricule})
                        </span>
                        <p className="text-[10px] text-slate-500">{emp.fonction}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                        {emp.service}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-filled Employee Snapshot */}
            {selectedEmployee && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Matricule</span>
                  <span className="font-bold text-slate-800">{selectedEmployee.matricule}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Grade</span>
                  <span className="font-bold text-slate-800">{selectedEmployee.grade}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Fonction</span>
                  <span className="font-bold text-slate-800 truncate block" title={selectedEmployee.fonction}>
                    {selectedEmployee.fonction}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Service Rattaché</span>
                  <span className="font-bold text-emerald-800">{selectedEmployee.service}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Destination & Dates */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>2. Destination & Calendrier</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Destination Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination (Recherche autocomplétée ou saisie libre) *
                </label>
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value);
                    setShowDestinationDropdown(true);
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  placeholder="Ex: Skoura, Tinghir, Zagora, Agdz, Rabat..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800"
                />

                {showDestinationDropdown && filteredDestinations.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredDestinations.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDestination(d)}
                        className="p-2.5 hover:bg-emerald-50 cursor-pointer text-xs transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{d.villeOuLocalite}</span>
                          <span className="text-slate-500 text-[11px] ml-1">({d.province})</span>
                          <span className="block text-[10px] text-slate-400">{d.zoneAdministrative}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ~{d.distanceAllerKm} km aller
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service list selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Demandeur *
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="SAF">SAF (Service Administratif et Financier)</option>
                  <option value="SER">SER (Service de l'Équipement Rural)</option>
                  <option value="SVOP">SVOP (Service de la Vulgarisation et Organisation Pro.)</option>
                  <option value="SAAF">SAAF (Service des Aménagements Agricoles et Foncier)</option>
                  <option value="Direction">Direction Régionale</option>
                </select>
              </div>
            </div>

            {/* Motif / Objet précis de la mission */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif / Objet précis de la mission *
              </label>
              <input
                type="text"
                value={objetMission}
                onChange={(e) => setObjetMission(e.target.value)}
                placeholder="Ex: Supervision des travaux d'irrigation et suivi phytosanitaire des palmeraies"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800"
              />
            </div>

            {/* Dates début et fin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date & Heure de début *
                </label>
                <input
                  type="datetime-local"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date & Heure de fin estimée *
                </label>
                <input
                  type="datetime-local"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Véhicule & Carburant */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
              <Car className="w-4 h-4 text-emerald-700" />
              <span>3. Véhicule Affecté & Dotation Carburant</span>
            </div>

            {/* Vehicle Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Véhicule affecté (Recherche immatriculation, marque ou modèle) *
              </label>
              <input
                type="text"
                value={vehicleSearch}
                onChange={(e) => {
                  setVehicleSearch(e.target.value);
                  setShowVehicleDropdown(true);
                }}
                onFocus={() => setShowVehicleDropdown(true)}
                placeholder="Tapez l'immatriculation (ex: 14285) ou le modèle (ex: Duster)..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800 font-medium"
              />

              {showVehicleDropdown && filteredVehicles.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredVehicles.map((veh) => (
                    <div
                      key={veh.id}
                      onClick={() => handleSelectVehicle(veh)}
                      className="p-2.5 hover:bg-emerald-50 cursor-pointer text-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{veh.immatriculation}</span>
                        <span className="text-slate-600 text-[11px] ml-2">
                          {veh.marque} {veh.modele} ({veh.typeVehicule})
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Km: {veh.kilometrage.toLocaleString('fr-FR')} • Norme: {veh.consoTheorique} L/100km • GPS: {veh.identifiantGps || 'Actif'}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          veh.disponibilite === 'Disponible'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {veh.disponibilite}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fuel Parameters Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Montant Carburant (DH) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    value={montantCarburantDh}
                    onChange={(e) => setMontantCarburantDh(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    DH
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quantité Carburant (Litres) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={quantiteCarburantLitres}
                    onChange={(e) => setQuantiteCarburantLitres(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    L
                  </span>
                </div>
              </div>

              {/* Niveau initial du carburant (Exact list required: 1/8, 1/4, 1/2, 3/4, 1/1) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Niveau Initial Réservoir *
                </label>
                <select
                  value={niveauCarburantInitial}
                  onChange={(e) => setNiveauCarburantInitial(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="1/8">1/8 (Réserve)</option>
                  <option value="1/4">1/4 (Quart)</option>
                  <option value="1/2">1/2 (Demi)</option>
                  <option value="3/4">3/4 (Trois-quarts)</option>
                  <option value="1/1">1/1 (Plein)</option>
                </select>
              </div>

              {/* Type de vignette (Vignette simple, E-vignette) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Type de Vignette *
                </label>
                <select
                  value={typeVignette}
                  onChange={(e) => setTypeVignette(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Vignette simple">Vignette simple (Papier)</option>
                  <option value="E-vignette">E-vignette (Électronique)</option>
                </select>
              </div>
            </div>

            {/* Notes optionnelles */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Observations & Instructions particulières (optionnel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Équipements de prélèvement à charger, itinéraire piste Todgha..."
                className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Génération instantanée Ordre A5 & Bons A4/A5</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <span>Génération en cours...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Valider & Générer les Documents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
