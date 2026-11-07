import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth linked)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('AGENT'), // 'ADMIN', 'CHEF_SERVICE', 'GESTIONNAIRE_PARC', 'AGENT'
  service: text('service'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  matricule: text('matricule').notNull().unique(),
  nom: text('nom').notNull(),
  prenom: text('prenom').notNull(),
  grade: text('grade').notNull(), // 'Technicien', 'Adjoint technique', 'Ingénieur', 'Chef de service'
  fonction: text('fonction').notNull(),
  service: text('service').notNull(), // 'SAF', 'SER', 'SVOP', 'SAAF', 'Direction'
  telephone: text('telephone'),
  email: text('email'),
  actif: boolean('actif').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  immatriculation: text('immatriculation').notNull().unique(),
  marque: text('marque').notNull(),
  modele: text('modele').notNull(),
  typeVehicule: text('type_vehicule').notNull(), // 'Pick-up 4x4', 'Utilitaire', 'Tout-terrain', 'Berline'
  typeCarburant: text('type_carburant').notNull(), // 'Diesel', 'Essence'
  consoTheorique: numeric('conso_theorique').notNull(), // L/100km
  consoReelleGps: numeric('conso_reelle_gps'), // L/100km
  kilometrage: integer('kilometrage').notNull().default(0),
  identifiantGps: text('identifiant_gps'),
  etatVehicule: text('etat_vehicule').notNull().default('Bon'), // 'Excellent', 'Bon', 'En maintenance', 'Hors service'
  disponibilite: text('disponibilite').notNull().default('Disponible'), // 'Disponible', 'En mission', 'En panne'
  niveauReservoirActuel: text('niveau_reservoir_actuel').notNull().default('1/2'), // '1/8', '1/4', '1/2', '3/4', '1/1'
  createdAt: timestamp('created_at').defaultNow(),
});

// Destinations table (Morocco comprehensive geographical base)
export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  region: text('region').notNull(),
  province: text('province').notNull(),
  commune: text('commune').notNull(),
  villeOuLocalite: text('ville_ou_localite').notNull(),
  zoneAdministrative: text('zone_administrative').notNull(),
  distanceAllerKm: integer('distance_aller_km').notNull().default(50),
  createdAt: timestamp('created_at').defaultNow(),
});

// Missions table
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  numeroMission: text('numero_mission').notNull().unique(),
  employeeId: integer('employee_id').references(() => employees.id),
  employeeNom: text('employee_nom').notNull(),
  employeeMatricule: text('employee_matricule').notNull(),
  employeeGrade: text('employee_grade').notNull(),
  employeeService: text('employee_service').notNull(),
  employeeFonction: text('employee_fonction'),
  destination: text('destination').notNull(),
  destinationProvince: text('destination_province'),
  objetMission: text('objet_mission').notNull(),
  dateDebut: text('date_debut').notNull(),
  dateFin: text('date_fin').notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  vehicleImmat: text('vehicle_immat').notNull(),
  vehicleMarqueModele: text('vehicle_marque_modele').notNull(),
  kmInitial: integer('km_initial').notNull().default(0),
  kmFinal: integer('km_final'),
  distanceParcourue: integer('distance_parcourue'),
  montantCarburantDh: numeric('montant_carburant_dh').notNull().default('0'),
  quantiteCarburantLitres: numeric('quantite_carburant_litres').notNull().default('0'),
  niveauCarburantInitial: text('niveau_carburant_initial').notNull().default('1/2'),
  niveauCarburantFinal: text('niveau_carburant_final'),
  typeVignette: text('type_vignette').notNull().default('Vignette simple'), // 'Vignette simple', 'E-vignette'
  service: text('service').notNull(),
  statut: text('statut').notNull().default('Validée'), // 'Brouillon', 'En attente de validation', 'Validée', 'En cours', 'Exécutée', 'Non exécutée', 'Clôturée'
  quantiteReellementConsommee: numeric('quantite_reellement_consommee'),
  consommationMoyenne: numeric('consommation_moyenne'), // (quantite / distance) * 100
  anomalieConstatee: text('anomalie_constatee'),
  gpsSyncId: text('gps_sync_id'),
  validePar: text('valide_par'),
  valideAt: text('valide_at'),
  clotureAt: text('cloture_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// GPS telemetry tracking logs
export const gpsTrackingLogs = pgTable('gps_tracking_logs', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  missionId: integer('mission_id').references(() => missions.id),
  vehicleImmat: text('vehicle_immat').notNull(),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  vitesse: integer('vitesse').notNull().default(0),
  distanceParcourue: numeric('distance_parcourue').notNull().default('0'),
  niveauCarburant: text('niveau_carburant'),
  consommationInstantanee: numeric('consommation_instantanee'),
  statutGps: text('statut_gps').notNull().default('Normal'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Audit log for traceability
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  entite: text('entite').notNull(),
  entiteId: text('entite_id'),
  utilisateur: text('utilisateur').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// App settings
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({}) => ({}));

export const employeesRelations = relations(employees, ({ many }) => ({
  missions: many(missions),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  missions: many(missions),
  gpsLogs: many(gpsTrackingLogs),
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  employee: one(employees, {
    fields: [missions.employeeId],
    references: [employees.id],
  }),
  vehicle: one(vehicles, {
    fields: [missions.vehicleId],
    references: [vehicles.id],
  }),
  gpsLogs: many(gpsTrackingLogs),
}));

export const gpsTrackingLogsRelations = relations(gpsTrackingLogs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [gpsTrackingLogs.vehicleId],
    references: [vehicles.id],
  }),
  mission: one(missions, {
    fields: [gpsTrackingLogs.missionId],
    references: [missions.id],
  }),
}));
