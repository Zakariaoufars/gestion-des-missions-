export interface Employee {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  grade: string;
  fonction: string;
  service: string;
  telephone?: string | null;
  email?: string | null;
  actif: boolean;
  createdAt?: string;
}

export interface Vehicle {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  typeVehicule: string;
  typeCarburant: string;
  consoTheorique: string | number;
  consoReelleGps?: string | number | null;
  kilometrage: number;
  identifiantGps?: string | null;
  etatVehicule: string;
  disponibilite: string;
  niveauReservoirActuel: string;
  createdAt?: string;
}

export interface Destination {
  id: number;
  region: string;
  province: string;
  commune: string;
  villeOuLocalite: string;
  zoneAdministrative: string;
  distanceAllerKm: number;
}

export interface Mission {
  id: number;
  numeroMission: string;
  employeeId?: number | null;
  employeeNom: string;
  employeeMatricule: string;
  employeeGrade: string;
  employeeService: string;
  employeeFonction?: string | null;
  destination: string;
  destinationProvince?: string | null;
  objetMission: string;
  dateDebut: string;
  dateFin: string;
  vehicleId?: number | null;
  vehicleImmat: string;
  vehicleMarqueModele: string;
  kmInitial: number;
  kmFinal?: number | null;
  distanceParcourue?: number | null;
  montantCarburantDh: string | number;
  quantiteCarburantLitres: string | number;
  niveauCarburantInitial: string;
  niveauCarburantFinal?: string | null;
  typeVignette: string;
  service: string;
  statut: 'Brouillon' | 'En attente de validation' | 'Validée' | 'En cours' | 'Exécutée' | 'Non exécutée' | 'Clôturée';
  quantiteReellementConsommee?: string | number | null;
  consommationMoyenne?: string | number | null;
  anomalieConstatee?: string | null;
  gpsSyncId?: string | null;
  validePar?: string | null;
  valideAt?: string | null;
  clotureAt?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalVehicles: number;
  totalMissions: number;
  missionsEnCours: number;
  missionsExecutees: number;
  missionsNonExecutees: number;
  missionsValidees: number;
  vehiculesDisponibles: number;
  vehiculesEnMission: number;
  vehiculesMaintenance: number;
  montantCarburantAttribue: number;
  quantiteCarburantAttribuee: number;
  quantiteCarburantConsommee: number;
  soldeCarburantRestant: number;
  anomaliesCount: number;
  anomaliesList: Mission[];
  serviceStats: Record<string, { missions: number; fuelDh: number; fuelLitres: number }>;
  monthlyStats: Array<{ month: string; missions: number; fuelDh: number; fuelLitres: number }>;
}

export interface GpsVehicleTelemetry {
  vehicleId: number;
  immatriculation: string;
  marqueModele: string;
  typeVehicule: string;
  typeCarburant: string;
  consoTheorique: string | number;
  consoReelleGps?: string | number | null;
  kilometrage: number;
  identifiantGps: string;
  disponibilite: string;
  etatVehicule: string;
  niveauReservoir: string;
  latitude: number;
  longitude: number;
  vitesse: number;
  statutTelemetrie: string;
  missionActive?: {
    numeroMission: string;
    employe: string;
    destination: string;
  } | null;
}

export interface AuditLog {
  id: number;
  action: string;
  entite: string;
  entiteId?: string | null;
  utilisateur: string;
  details?: string | null;
  timestamp: string;
}

export interface OrganizationSettings {
  nomEtablissement: string;
  sigle: string;
  tutelle: string;
  adresse: string;
  telephone: string;
  fax: string;
  email: string;
  siteWeb: string;
  prixCarburantLitreDh: number;
}
